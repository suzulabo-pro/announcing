import { DeleteAnnounceParams } from '../../shared';
import { arrayRemove, CallableContext, FirebaseAdminApp, serverTimestamp } from '../firebase';
import { logger } from '../utils/logger';

export const deleteAnnounce = async (
  params: DeleteAnnounceParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id } = params;
  if (!id) {
    throw new Error('missing id');
  }

  const firestore = adminApp.firestore();

  const owners = await firestore.collection('users').where('announces', 'array-contains', id).get();

  const batch = firestore.batch();
  let isOwner = false;
  for (const d of owners.docs) {
    if (d.id == uid) {
      isOwner = true;
    }
    batch.update(d.ref, {
      announces: arrayRemove(id),
      uT: serverTimestamp(),
    });
  }
  if (!isOwner) {
    logger.warn('not owner', { uid, id });
    return;
  }
  batch.delete(firestore.doc(`announces/${id}`));

  await batch.commit();
};
