import nacl from 'tweetnacl';
import { bs62 } from '../../shared';
import { FirebaseAdminApp, getFirestore, HttpRequest, HttpResponse, Timestamp } from '../firebase';
import { addExternalAnnounceFetchTask } from '../pubsub/external-announce-fetch';
import { ExternalAnnounces, ExternalAnnouncesPing } from '../utils/datatypes';
import { logger } from '../utils/logger';

const cacheControl = 'public, max-age=30, s-maxage=30';

export const pingExternalAnnounce = async (
  params: Record<string, string>,
  req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const sendErr = (msg: string, info?: Record<string, any>, status = 400) => {
    logger.error(msg, { path: req.path, ...info });
    res.status(status).send({ status: 'error', msg });
  };

  const { id, idSuffix } = params;
  if (!id || !idSuffix) {
    sendErr('bad path');
    return;
  }
  const secKey = req.header('APP-SEC-KEY');
  if (!secKey) {
    sendErr('missing APP-SEC-KEY');
    return;
  }
  const url = req.header('APP-ANNOUNCE-URL');
  if (!url) {
    sendErr('missing APP-ANNOUNCE-URL');
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

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`external-announces/${id}`);

  const data = (await docRef.get()).data() as ExternalAnnounces;
  if (!data) {
    sendErr('data not found');
    return;
  }

  if (!data.pubKeys.includes(pubKey)) {
    sendErr('invalid secKey');
    return;
  }
  {
    const includes = data.urlPrefixes.find(v => {
      return url.startsWith(v);
    });
    if (!includes) {
      sendErr('invalid url');
      return;
    }
  }

  const reqID = req.header('APP-REQUEST-ID') || '';
  const uT = Timestamp.now();

  {
    const pingRef = firestore.doc(`external-announces/${id}/ping/${idSuffix}`);
    await pingRef.set({
      url,
      uT,
    } as ExternalAnnouncesPing);
  }

  await addExternalAnnounceFetchTask(id, idSuffix, uT.toMillis());

  res.setHeader('Cache-Control', cacheControl);
  res.status(200).send({ reqID, status: 'ok' });
};
