import { bs62, ImportPosts } from '@announcing/shared';
import nacl from 'tweetnacl';
import { FirebaseAdminApp, HttpRequest, HttpResponse, Timestamp } from '../firebase';
import { pubImportPostsFetch } from '../pubsub/import-posts-fetch';
import { logger } from '../utils/logger';

const cacheControl = 'public, max-age=30, s-maxage=30';

export const pingImportPosts = async (
  params: Record<string, string>,
  req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const sendErr = (msg: string, info?: Record<string, any>, status = 400) => {
    logger.error(msg, { path: req.path, ...info });
    res.status(status).send({ status: 'error', msg });
  };

  const { announceID, secKey } = params;
  if (!announceID || !secKey) {
    sendErr('bad path');
    return;
  }

  const pubKey = (() => {
    try {
      return bs62.encode(nacl.box.keyPair.fromSecretKey(bs62.decode(secKey)).publicKey);
    } catch (err) {
      sendErr('bad path (secKey)', { err });
      return;
    }
  })();
  if (!pubKey) {
    return;
  }

  const firestore = adminApp.firestore();
  const docRef = firestore.doc(`import-posts/${announceID}`);

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

    const importURL = req.header('APP-IMPORT-URL');
    if (importURL && !importURL.startsWith(url)) {
      sendErr(`bad APP-IMPORT-URL: ${importURL} / ${url}`);
      return;
    }
    const requestedURL = importURL || url;

    const reqID = req.header('APP-REQUEST-ID') || '';

    const uT = Timestamp.now();

    t.update(docRef, {
      requested: true,
      requestedURL,
      uT,
    });

    await pubImportPostsFetch(announceID, uT.toMillis());

    res.setHeader('Cache-Control', cacheControl);
    res.status(200).send({ reqID, status: 'ok' });
  });
};
