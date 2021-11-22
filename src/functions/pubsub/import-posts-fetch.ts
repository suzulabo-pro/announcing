import { PubSub } from '@google-cloud/pubsub';
import axios from 'axios';
import { toDate } from 'date-fns-tz';
import { Announce, AppError, ImportPosts, Post } from '../../shared';
import {
  EventContext,
  FirebaseAdminApp,
  Firestore,
  getFirestore,
  PubSubMessage,
  serverTimestamp,
  Timestamp,
  Transaction,
} from '../firebase';
import { validators } from '../json-schema';
import { postHash } from '../utils/firestore';
import { logger } from '../utils/logger';
import { RetryError } from './retry-error';

const FETCH_UA = 'announcing-bot';
const FETCH_TIMEOUT = 30 * 1000;
const FETCH_MAX_SIZE = 1024 * 1024;

export const pubImportPostsFetch = async (id: string, uT: number) => {
  const pubsub = new PubSub();
  const topic = pubsub.topic('import-posts-fetch');
  await topic.publishJSON({ id, uT });
};

export const pubsubImportPostsFetch = async (
  msg: PubSubMessage,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  const params = msg.json;
  if (!validators.importPostsFetchMessage(params)) {
    logger.warn('invalid params', { params });
    return;
  }

  const { id, uT } = params;

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`import-posts/${id}`);

  await firestore.runTransaction(async t => {
    const data = (await t.get(docRef)).data() as ImportPosts;

    if (!data) {
      logger.warn('no data', { id });
      return;
    }
    if (data.uT.toMillis() != uT) {
      logger.warn('document updated', { id, uT });
      return;
    }

    const url = data.requestedURL;
    if (!url) {
      logger.warn('no url', { id });
      return;
    }

    try {
      const json = await fetch(url);
      if (json) {
        await importPostsJSON(firestore, t, id, json);
      }
    } catch (err) {
      if (err instanceof RetryError) {
        throw err;
      }
      logger.error('import error', { err });
    }
  });
};

const fetch = async (url: string): Promise<any | undefined> => {
  const timeout = process.env['FETCH_TIMEOUT']
    ? parseInt(process.env['FETCH_TIMEOUT'])
    : FETCH_TIMEOUT;

  const source = axios.CancelToken.source();

  const timer = setTimeout(() => {
    source.cancel();
  }, timeout);

  try {
    logger.debug('fetch', { url });
    const res = await axios.get(url, {
      timeout,
      maxContentLength: FETCH_MAX_SIZE,
      maxRedirects: 0,
      validateStatus: undefined,
      headers: {
        'user-agent': FETCH_UA,
      },
      cancelToken: source.token,
    });
    const status = res.status;
    if (status >= 200 && status < 300) {
      return res.data;
    }
    if (status >= 500) {
      throw new RetryError(`Status Error: ${status}`);
    }

    logger.warn('fetch error', { status, url });
  } catch (err) {
    if (err instanceof RetryError) {
      throw err;
    } else if (axios.isCancel(err)) {
      throw new RetryError('timeout(cancel)');
    } else if (axios.isAxiosError(err)) {
      if (err.code == 'ECONNABORTED') {
        throw new RetryError('timeout(ECONNABORTED)');
      }
    }
    logger.warn('fetch error', { url, err });
  } finally {
    clearTimeout(timer);
  }
};

const importPostsJSON = async (
  firestore: Firestore,
  t: Transaction,
  announceID: string,
  data: any,
) => {
  if (!validators.importPostsJSON(data)) {
    // TODO: logging for user
    throw new AppError('Validate JSON Error');
  }

  const newPostsMap = new Map(
    data.posts.map(v => {
      const post = {
        ...v,
        pT: Timestamp.fromDate(toDate(v.pT, { timeZone: 'UTC' })),
      };
      const id = postHash(post);
      return [id, post];
    }),
  );

  const cIDMap = new Map<string, string>();
  for (const [id, post] of newPostsMap.entries()) {
    if (post.cID) {
      cIDMap.set(post.cID, id);
    }
  }

  const posts: Announce['posts'] = {};
  for (const [id, post] of newPostsMap.entries()) {
    const p: Announce['posts'][string] = { pT: post.pT };
    if (post.parentID) {
      const parent = cIDMap.get(post.parentID);
      if (!parent) {
        throw new AppError(`missing parentID: ${post.parentID}`);
      }
      p.parent = parent;
    }
    posts[id] = p;
  }

  const announceRef = firestore.doc(`announces/${announceID}`);

  const announce = await t.get(announceRef);
  const curAnnounce = announce.data() as Announce;
  if (!curAnnounce) {
    throw new AppError(`missing announce: ${announceID}`);
  }

  const curPosts = curAnnounce.posts;
  if (Object.keys(posts).sort().join(':') == Object.keys(curPosts).sort().join(':')) {
    logger.warn('Same posts');
    // TODO: logging for user
    return;
  }

  for (const [id, v] of newPostsMap.entries()) {
    if (!(id in curPosts)) {
      t.create(announceRef.collection('posts').doc(id), {
        title: v.title,
        body: v.body,
        link: v.link,
        img: v.img,
        imgs: v.imgs,
        pT: v.pT,
      } as Post);
    }
  }

  for (const id of Object.keys(curPosts)) {
    if (!newPostsMap.has(id)) {
      t.delete(announceRef.collection('posts').doc(id));
    }
  }

  const announceUpdate: Partial<Announce> = {
    posts,
    uT: serverTimestamp() as any,
  };
  t.update(announceRef, announceUpdate);
};
