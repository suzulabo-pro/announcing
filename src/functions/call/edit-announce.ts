import { Announce, AppError, EditAnnounceParams } from '../../shared';
import { CallableContext, FirebaseAdminApp, getFirestore, serverTimestamp } from '../firebase';
import { announceMetaHash, checkOwner, storeImage } from '../utils/firestore';
import { logger } from '../utils/logger';

export const editAnnounce = async (
  params: EditAnnounceParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new AppError('missing uid');
  }

  const { id, name, desc, link, icon, newIcon } = params;

  const firestore = getFirestore(adminApp);

  {
    const isOwner = await checkOwner(firestore, uid, id);
    if (!isOwner) {
      return;
    }
  }

  const newMeta = {
    name,
    desc,
    link,
    icon,
    cT: serverTimestamp() as any,
  };

  if (newIcon) {
    const imgID = await storeImage(firestore, newIcon);
    if (imgID) {
      newMeta.icon = imgID;
    }
  }

  const newMetaID = announceMetaHash(newMeta);

  const updateAnnounce = {
    mid: newMetaID,
    uT: serverTimestamp(),
  };

  const announceRef = firestore.doc(`announces/${id}`);
  const announceData = (await announceRef.get()).data() as Announce;
  if (!announceData) {
    logger.debug('no data', { id });
    return;
  }
  if (announceData.mid == newMetaID) {
    logger.debug('same meta', { mid: announceData.mid, newMetaID });
    return;
  }

  const batch = firestore.batch();
  batch.create(firestore.doc(`announces/${id}/meta/${newMetaID}`), newMeta);
  batch.update(announceRef, updateAnnounce);
  batch.delete(firestore.doc(`announces/${id}/meta/${announceData.mid}`));
  await batch.commit();
};
