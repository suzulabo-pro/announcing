import {
  DeleteExternalAnnouncesParams,
  ExternalAnnounce,
  PutExternalAnnouncesParams,
  User,
} from '../../shared';
import {
  arrayRemove,
  arrayUnion,
  CallableContext,
  FirebaseAdminApp,
  Firestore,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { genExternalAnnouncesID } from '../utils/firestore';
import { logger } from '../utils/logger';

export const putExternalAnnounces = async (
  params: PutExternalAnnouncesParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { urlPrefixes, pubKeys, id } = params;

  const firestore = getFirestore(adminApp);

  if (id) {
    await firestore.doc(`external-announces/${id}`).update({
      urlPrefixes,
      pubKeys,
      uT: serverTimestamp() as any,
    } as ExternalAnnounce);
    return;
  }

  const newID = genExternalAnnouncesID();

  const batch = firestore.batch();
  batch.create(firestore.doc(`external-announces/${newID}`), {
    urlPrefixes,
    pubKeys,
    uT: serverTimestamp() as any,
  } as ExternalAnnounce);
  batch.set(
    firestore.doc(`users/${uid}`),
    { externalAnnounces: arrayUnion(newID), uT: serverTimestamp() as any },
    { merge: true },
  );
  await batch.commit();
};

export const deleteExternalAnnounces = async (
  params: DeleteExternalAnnouncesParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id } = params;
  const firestore = getFirestore(adminApp);

  {
    const isOwner = await checkExternalAnnouncesOwner(firestore, uid, id);
    if (!isOwner) {
      throw new Error('not Owner');
    }
  }

  await firestore.doc(`external-announces/${id}`).delete();

  const batch = firestore.batch();
  batch.delete(firestore.doc(`external-announces/${id}`));
  batch.set(
    firestore.doc(`users/${uid}`),
    { externalAnnounces: arrayRemove(id), uT: serverTimestamp() as any },
    { merge: true },
  );
  await batch.commit();
};

export const checkExternalAnnouncesOwner = async (
  firestore: Firestore,
  uid: string,
  id: string,
) => {
  const userRef = firestore.doc(`users/${uid}`);
  const userData = (await userRef.get()).data() as User;
  if (!userData) {
    logger.warn('no user', { uid });
    return false;
  }
  if (!userData.externalAnnounces || userData.externalAnnounces.indexOf(id) < 0) {
    logger.warn('not owner', { uid, id });
    return false;
  }
  return true;
};
