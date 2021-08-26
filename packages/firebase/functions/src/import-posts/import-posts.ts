import { Announce, Post } from '@announcing/shared';
import { toDate } from 'date-fns-tz';
import admin from 'firebase-admin';
import { postHash } from '../utils/firestore';
import { logger } from '../utils/logger';
import { validatePostsImportJSON } from './schema';

const importPostsJSON = async (
  firestore: admin.firestore.Firestore,
  announceID: string,
  json: string,
) => {
  const data = JSON.parse(json);

  if (!validatePostsImportJSON(data)) {
    logger.error('Invalid JSON', validatePostsImportJSON.errors);
    // TODO: logging for user
    throw new Error('Validate JSON Error');
  }

  const newPostsMap = new Map(
    data.posts.map(v => {
      const post: Post = {
        ...v,
        pT: admin.firestore.Timestamp.fromDate(toDate(v.pT, { timeZone: 'UTC' })),
      };
      const id = postHash(post);
      return [id, post];
    }),
  );

  await firestore.runTransaction(async t => {
    const announceRef = firestore.doc(`announces/${announceID}`);

    const announce = await t.get(announceRef);
    const curAnnounce = announce.data() as Announce;
    if (!curAnnounce) {
      throw new Error(`missing announce: ${announceID}`);
    }

    let same = false;

    const ids = Object.keys(curAnnounce);
    const deleteList = [] as string[];

    for (const id of ids) {
      if (!newPostsMap.has(id)) {
        deleteList.push(id);
      }
    }

    if (deleteList.length == 0 && newPostsMap.size == ids.length) {
      same = true;
    } else {
      for (const id of deleteList) {
        t.delete(announceRef.collection('posts').doc(id));
      }
    }

    if (same) {
      logger.warn('Same posts');
      // TODO: logging for user
      return;
    }

    const posts: Announce['posts'] = {};
    for (const [id, post] of newPostsMap.entries()) {
      t.set(announceRef.collection('posts').doc(id), post);
      posts[id] = { pT: post.pT };
    }

    const newAnnounce: Announce = {
      ...curAnnounce,
      posts,
      uT: admin.firestore.FieldValue.serverTimestamp() as any,
    };
    t.set(announceRef, newAnnounce);
  });
};

export const _importPostsJSON = importPostsJSON;
