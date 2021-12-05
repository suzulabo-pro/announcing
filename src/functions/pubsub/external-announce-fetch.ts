import { PubSub } from '@google-cloud/pubsub';
import axios from 'axios';
import { toDate } from 'date-fns-tz';
import { Announce, AnnounceMeta, AppError, ExternalAnnouncePing, Post } from '../../shared';
import {
  DocumentReference,
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
import { announceMetaHash, postHash, toMD5Base62 } from '../utils/firestore';
import { logger } from '../utils/logger';
import { RetryError } from './retry-error';

const FETCH_UA = 'announcing-bot';
const FETCH_TIMEOUT = 30 * 1000;
const FETCH_MAX_SIZE = 1024 * 1024;

export const addExternalAnnounceFetchTask = async (id: string, idSuffix: string, uT: number) => {
  const pubsub = new PubSub();
  const topic = pubsub.topic('external-announce-fetch');
  await topic.publishJSON({ id, idSuffix, uT });
};

export const pubsubExternalAnnounceFetch = async (
  msg: PubSubMessage,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  const params = msg.json;

  const { id, idSuffix, uT } = params as { id: string; idSuffix: string; uT: number };

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`external-announces/${id}/ping/${idSuffix}`);

  await firestore.runTransaction(async t => {
    const data = (await t.get(docRef)).data() as ExternalAnnouncePing;

    if (!data) {
      logger.warn('no data', { id, idSuffix });
      return;
    }
    if (data.uT.toMillis() != uT) {
      logger.warn('task updated', { id, idSuffix, uT });
      return;
    }

    const url = data.url;
    if (!url) {
      logger.warn('no url', { id, idSuffix });
      return;
    }

    try {
      const json = await fetch(url);
      if (json) {
        await importExternalAnnounceJSON(firestore, t, id, idSuffix, json);
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

const importExternalAnnounceJSON = async (
  firestore: Firestore,
  t: Transaction,
  id: string,
  idSuffix: string,
  data: any,
) => {
  if (!validators.externalAnnounceJSON(data)) {
    // TODO: logging for user
    throw new AppError('Validate JSON Error');
  }

  {
    if (data.id != idSuffix) {
      throw new AppError('Invalid id');
    }
    const idMD5 = toMD5Base62(id);
    if (data.key != idMD5) {
      throw new AppError('Invalid key', { key: data.key, id, idMD5 });
    }
  }

  const newMeta = { ...data.info, cT: serverTimestamp() as any } as AnnounceMeta;
  const newMetaHash = announceMetaHash(newMeta);

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

  const announceID = `${id}-${idSuffix}`;

  const announceRef = firestore.doc(`announces/${announceID}`);

  const announce = await t.get(announceRef);
  const curAnnounce = announce.data() as Announce | undefined;

  const curPosts = curAnnounce?.posts || [];

  const th = new TransactionHelper(t);

  if (curAnnounce?.mid != newMetaHash) {
    th.create(announceRef.collection('meta').doc(newMetaHash), newMeta);
    if (curAnnounce?.mid) {
      th.delete(announceRef.collection('meta').doc(curAnnounce.mid));
    }
  }

  for (const [id, v] of newPostsMap.entries()) {
    if (!(id in curPosts)) {
      th.create(announceRef.collection('posts').doc(id), {
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
      th.delete(announceRef.collection('posts').doc(id));
    }
  }

  if (!th.isUpdated()) {
    logger.warn('Same data');
    // TODO: logging for user
    return;
  }

  const announceUpdate: Partial<Announce> = {
    mid: newMetaHash,
    posts,
    uT: serverTimestamp() as any,
  };
  if (curAnnounce) {
    th.update(announceRef, announceUpdate);
  } else {
    th.create(announceRef, announceUpdate);
  }

  th.flush();
};

class TransactionHelper {
  private writeQueue: (() => void)[] = [];

  constructor(private t: Transaction) {}

  create(ref: DocumentReference, data: Record<string, any>) {
    this.writeQueue.push(() => {
      this.t.create(ref, data);
    });
  }

  set(ref: DocumentReference, data: Record<string, any>, options: { merge?: boolean }) {
    this.writeQueue.push(() => {
      this.t.set(ref, data, options);
    });
  }

  update(ref: DocumentReference, data: Record<string, any>) {
    this.writeQueue.push(() => {
      this.t.update(ref, data);
    });
  }

  delete(ref: DocumentReference) {
    this.writeQueue.push(() => {
      this.t.delete(ref);
    });
  }

  isUpdated() {
    return this.writeQueue.length > 0;
  }

  flush() {
    this.writeQueue.forEach(f => f());
  }
}
