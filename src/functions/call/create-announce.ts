import { AppError, CreateAnnounceParams } from '../../shared';
import {
  arrayUnion,
  CallableContext,
  FirebaseAdminApp,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { announceMetaHash, genAnnounceID } from '../utils/firestore';
import { logger } from '../utils/logger';

export const createAnnounce = async (
  params: CreateAnnounceParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new AppError('missing uid');
  }
  const { name, desc } = params;

  const metaData = {
    name,
    ...(!!desc && { desc }),
    cT: serverTimestamp(),
  };

  const id = genAnnounceID();
  const mid = announceMetaHash(metaData);

  const announceData = {
    mid,
    posts: {},
    uT: serverTimestamp(),
  };
  const userData = {
    announces: arrayUnion(id),
    uT: serverTimestamp(),
  };

  const firestore = getFirestore(adminApp);
  const batch = firestore.batch();
  batch.create(firestore.doc(`announces/${id}`), announceData);
  batch.create(firestore.doc(`announces/${id}/meta/${mid}`), metaData);
  batch.set(firestore.doc(`users/${uid}`), userData, { merge: true });
  await batch.commit();
  logger.info('CREATE ANNOUNCE', { announceData, metaData });
};
