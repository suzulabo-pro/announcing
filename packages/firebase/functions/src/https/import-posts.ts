import { bs62, ImportPosts } from '@announcing/shared';
import * as admin from 'firebase-admin';
import { Request, Response } from 'firebase-functions';
import nacl from 'tweetnacl';
import { IMPORT_POSTS_EXPIRED_MSEC } from '../utils/datatypes';
import { logger } from '../utils/logger';

const pathPattern = new RegExp('^/import-posts/([a-zA-Z0-9]{12})/([a-zA-Z0-9]{32,43})$');

export const httpsPingImportPosts = async (
  req: Request,
  res: Response,
  adminApp: admin.app.App,
) => {
  const sendErr = (msg: string, info?: Record<string, any>, status = 400) => {
    logger.error(msg, { path: req.path, ...info });
    res.status(status).send(msg);
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

  await firestore.runTransaction(async t => {
    const data = (await t.get(docRef)).data() as ImportPosts;
    if (!data) {
      sendErr('data not found');
      return;
    }

    const url = data.url;

    if (!url) {
      sendErr('url does not set');
      return;
    }
    if (data.pubKey != pubKey) {
      sendErr('bad path (secKey does not match)');
      return;
    }

    const expired = Date.now() + IMPORT_POSTS_EXPIRED_MSEC;

    if (data.requested && data.uT.toMillis() < expired) {
      res.status(200).send('already requested');
      return;
    }

    const importURL = req.header('APP-IMPORT-URL');
    if (importURL && !importURL.startsWith(url)) {
      sendErr(`bad APP-IMPORT-URL: ${importURL} / ${url}`);
      return;
    }
    const requestedURL = importURL || url;

    t.update(docRef, {
      requested: true,
      requestedURL,
      uT: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send('ok');
  });
};
