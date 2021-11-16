import { RegisterExternalAnnouncesParams } from '../../shared';
import {
  arrayUnion,
  CallableContext,
  FirebaseAdminApp,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { ExternalAnnounces } from '../utils/datatypes';
import { genExternalAnnouncesID } from '../utils/firestore';

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
