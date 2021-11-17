import {
  RegisterExternalAnnouncesParams,
  UpdateExternalAnnouncesKeyParams,
  User,
} from '../../shared';
import {
  arrayUnion,
  CallableContext,
  FirebaseAdminApp,
  Firestore,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { ExternalAnnounces } from '../utils/datatypes';
import { genExternalAnnouncesID } from '../utils/firestore';
import { logger } from '../utils/logger';

export const registerExternalAnnounces = async (
  params: RegisterExternalAnnouncesParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { urlPrefix, pubKey } = params;
  const id = genExternalAnnouncesID();

  const firestore = getFirestore(adminApp);
  const batch = firestore.batch();
  batch.create(firestore.doc(`external_announces/${id}`), {
    urlPrefix,
    pubKey,
    announces: [],
    uT: serverTimestamp() as any,
  } as ExternalAnnounces);
  batch.set(
    firestore.doc(`users/${uid}`),
    { externalAnnounces: arrayUnion(id), uT: serverTimestamp() as any },
    { merge: true },
  );
  await batch.commit();
};

export const updateExternalAnnouncesKey = async (
  params: UpdateExternalAnnouncesKeyParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id, pubKey } = params;
  const firestore = getFirestore(adminApp);

  {
    const isOwner = await checkExternalAnnouncesOwner(firestore, uid, id);
    if (!isOwner) {
      throw new Error('not Owner');
    }
  }

  await firestore.doc(`external_announces/${id}`).update({
    pubKey,
    uT: serverTimestamp() as any,
  });
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
