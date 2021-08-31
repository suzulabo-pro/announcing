import { ImportPosts } from '@announcing/shared';
import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import https from 'https';
import { importPostsJSON } from '../import-posts/import-posts';
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
  const res = await new Promise<Buffer>((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': FETCH_UA }, timeout: FETCH_TIMEOUT },
      res => {
        const statusCode = res.statusCode || -1;
        if (!(statusCode >= 200 && statusCode < 299)) {
          reject({ msg: `status: ${statusCode}` });
          return;
        }

        let size = 0;
        const chunks = [] as Buffer[];
        res.on('data', (v: Buffer) => {
          if (size > FETCH_MAX_SIZE) {
            res.destroy();
            return;
          }
          chunks.push(v);
          size += v.byteLength;
        });
        res.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      },
    );
    req.on('error', err => {
      reject(err);
    });
  });

  return res.toString('utf-8');
};
