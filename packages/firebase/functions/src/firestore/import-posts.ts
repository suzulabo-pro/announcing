import { Announce, ImportPosts, Post, stripObj } from '@announcing/shared';
import axios from 'axios';
import { toDate } from 'date-fns-tz';
import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { validatePostsImportJSON } from '../import-posts/schema';
import { postHash } from '../utils/firestore';
import { logger } from '../utils/logger';

const FETCH_UA = 'announcing-bot';
const FETCH_TIMEOUT = 5000;
const FETCH_MAX_SIZE = 1024 * 1024;

export const firestoreUpdateImportPosts = async (
  change: Change<QueryDocumentSnapshot>,
  _context: EventContext,
  adminApp: admin.app.App,
): Promise<void> => {
  const firestore = adminApp.firestore();
  const id = change.after.id;

  const afterData = change.after.data() as ImportPosts;
  if (!afterData.requested) {
    logger.debug('not requested', { id });
    return;
  }
  const beforeData = change.before.data() as ImportPosts;
  if (beforeData.requested) {
    logger.debug('alraedy requested', { id });
    return;
  }

  const docRef = change.after.ref;

  await firestore.runTransaction(async t => {
    const data = (await t.get(docRef)).data() as ImportPosts;
    if (!data) {
      logger.warn('no data', { id });
      return;
    }
    if (!data.requested) {
      logger.warn('not requested', { id });
      return;
    }

    const url = data.url;
    if (!url) {
      logger.warn('no url', { id });
      return;
    }

    const json = await fetch(url);
    await importPostsJSON(firestore, id, json);
    t.update(docRef, { requested: false, uT: admin.firestore.FieldValue.serverTimestamp() });
  });
};

const fetch = async (url: string) => {
  const timeout = process.env['FETCH_TIMEOUT']
    ? parseInt(process.env['FETCH_TIMEOUT'])
    : FETCH_TIMEOUT;

  const source = axios.CancelToken.source();

  const timer = setTimeout(() => {
    source.cancel();
  }, timeout);

  try {
    const res = await axios.get(url, {
      timeout,
      maxContentLength: FETCH_MAX_SIZE,
      headers: {
        'user-agent': FETCH_UA,
      },
      cancelToken: source.token,
    });
    return res.data;
  } catch (err) {
    if (axios.isCancel(err)) {
      throw new Error('timeout(timer)');
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timer);
  }
};

const importPostsJSON = async (
  firestore: admin.firestore.Firestore,
  announceID: string,
  data: any,
) => {
  if (!validatePostsImportJSON(data)) {
    logger.error('Invalid JSON', validatePostsImportJSON.errors);
    // TODO: logging for user
    throw new Error('Validate JSON Error');
  }

  const newPostsMap = new Map(
    data.posts.map(v => {
      const post = {
        ...v,
        pT: admin.firestore.Timestamp.fromDate(toDate(v.pT, { timeZone: 'UTC' })),
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
        throw new Error(`missing parentID: ${post.parentID}`);
      }
      p.parent = parent;
    }
    posts[id] = p;
  }

  await firestore.runTransaction(async t => {
    const announceRef = firestore.doc(`announces/${announceID}`);

    const announce = await t.get(announceRef);
    const curAnnounce = announce.data() as Announce;
    if (!curAnnounce) {
      throw new Error(`missing announce: ${announceID}`);
    }

    const curPosts = curAnnounce.posts;
    if (Object.keys(posts).sort().join(':') == Object.keys(curPosts).sort().join(':')) {
      logger.warn('Same posts');
      // TODO: logging for user
      return;
    }

    for (const [id, v] of newPostsMap.entries()) {
      if (!(id in curPosts)) {
        t.create(
          announceRef.collection('posts').doc(id),
          stripObj({
            title: v.title,
            body: v.body,
            link: v.link,
            img: v.img,
            pT: v.pT,
          } as Post),
        );
      }
    }

    for (const id of Object.keys(curPosts)) {
      if (!newPostsMap.has(id)) {
        t.delete(announceRef.collection('posts').doc(id));
      }
    }

    const announceUpdate: Partial<Announce> = {
      posts,
      uT: admin.firestore.FieldValue.serverTimestamp() as any,
    };
    t.update(announceRef, announceUpdate);
  });
};
