import { ImportPosts } from '@announcing/shared';
import * as admin from 'firebase-admin';
import { Request, Response } from 'firebase-functions';
import nacl from 'tweetnacl';
import { logger } from '../utils/logger';
import { bs62 } from '../utils/util';

const pathPattern = new RegExp('^/import-posts/([a-zA-Z0-9]{12})/([a-zA-Z0-9]{32,43})$');

export const httpsPingImportPosts = async (
  req: Request,
  res: Response,
  adminApp: admin.app.App,
) => {
  const sendErr = (msg: string, info?: Record<string, any>) => {
    logger.error(msg, { path: req.path, ...info });
    res.status(400).send(msg);
  };

  const m = pathPattern.exec(req.path);
  if (!m) {
    sendErr('bad path');
    return;
  }
  const [, id, secKey] = m;
  if (!id || !secKey) {
    sendErr('bad path');
    return;
  }

  const pubKey = (() => {
    try {
      const secKeyB = bs62.decode(secKey);
      return bs62.encode(nacl.box.keyPair.fromSecretKey(secKeyB).publicKey);
    } catch (err) {
      sendErr('bad path (secKey)', { err });
      return;
    }
  })();
  if (!pubKey) {
    return;
  }

  const firestore = adminApp.firestore();
  const docRef = firestore.doc(`import-posts/${id}`);
  const data = (await docRef.get()).data() as ImportPosts;
  if (!data) {
    sendErr('data not found');
    return;
  }
  if (!data.url) {
    sendErr('url does not set');
    return;
  }
  if (data.pubKey != pubKey) {
    sendErr('bad path (secKey does not match)');
    return;
  }
  if (data.importing) {
    logger.info('already importing');
    res.status(200).send('already importing');
    return;
  }

  await docRef.update({ importing: true, uT: admin.firestore.FieldValue.serverTimestamp() });
  res.status(200).send('ok');
};
