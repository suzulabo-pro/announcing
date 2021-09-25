import { CreateAnnounceParams } from '@announcing/shared';
import { arrayUnion, CallableContext, FirebaseAdminApp, serverTimestamp } from '../firebase';
import { announceMetaHash } from '../utils/firestore';
import { logger } from '../utils/logger';
import { autoID } from '../utils/util';

export const createAnnounce = async (
  params: CreateAnnounceParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }
  const { name, desc } = params;

  const metaData = {
    name,
    ...(!!desc && { desc }),
    cT: serverTimestamp(),
  };

  const id = autoID();
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

  const firestore = adminApp.firestore();
  const batch = firestore.batch();
  batch.create(firestore.doc(`announces/${id}`), announceData);
  batch.create(firestore.doc(`announces/${id}/meta/${mid}`), metaData);
  batch.set(firestore.doc(`users/${uid}`), userData, { merge: true });
  await batch.commit();
  logger.info('CREATE ANNOUNCE', { announceData, metaData });
};
