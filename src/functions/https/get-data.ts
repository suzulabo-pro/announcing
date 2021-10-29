import { AnnounceMeta, Post } from '../../shared';
import {
  DocumentReference,
  FirebaseAdminApp,
  getFirestore,
  HttpRequest,
  HttpResponse,
} from '../firebase';
import { Cache } from '../utils/cache';

const cacheControl = 'public, max-age=31556952, s-maxage=86400, immutable';

const cache = new Cache();

const getCacheFirst = async <T extends Record<string, any>>(docRef: DocumentReference) => {
  const v = cache.get(docRef.path);
  if (v) {
    return v as T;
  }

  const data = (await docRef.get()).data();
  if (!data) {
    return;
  }
  cache.set(docRef.path, data);
  return data as T;
};

export const getAnnounceMetaData = async (
  params: Record<string, string>,
  _req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const { announceID, metaID } = params;

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`announces/${announceID}/meta/${metaID}`);
  const data = await getCacheFirst<AnnounceMeta>(docRef);
  if (!data) {
    res.sendStatus(404);
    return;
  }

  res.setHeader('Cache-Control', cacheControl);
  res.json({ ...data, cT: data.cT.toMillis() });
};

export const getAnnouncePostData = async (
  params: Record<string, string>,
  _req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const { announceID, postID } = params;

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`announces/${announceID}/posts/${postID}`);
  const data = await getCacheFirst<Post>(docRef);
  if (!data) {
    res.sendStatus(404);
    return;
  }

  res.setHeader('Cache-Control', cacheControl);
  res.json({ ...data, pT: data.pT.toMillis() });
};

export const getImageData = async (
  params: Record<string, string>,
  _req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const { imageID } = params;

  const firestore = getFirestore(adminApp);
  const docRef = firestore.doc(`images/${imageID}`);
  const data = await getCacheFirst<{ data: Buffer }>(docRef);
  if (!data) {
    res.sendStatus(404);
    return;
  }

  const img = data.data;

  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(img).end();
};
