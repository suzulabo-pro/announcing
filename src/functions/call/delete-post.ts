import { Announce, AppError, DeletePostParams } from '../../shared';
import {
  CallableContext,
  fieldDelete,
  FirebaseAdminApp,
  getFirestore,
  serverTimestamp,
} from '../firebase';
import { checkOwner } from '../utils/firestore';
import { logger } from '../utils/logger';

export const deletePost = async (
  params: DeletePostParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new AppError('missing uid');
  }

  const { id, postID } = params;
  if (!id) {
    throw new AppError('missing id');
  }
  if (!postID) {
    throw new AppError('missing postID');
  }

  const firestore = getFirestore(adminApp);

  {
    const isOwner = await checkOwner(firestore, uid, id);
    if (!isOwner) {
      return;
    }
  }

  await firestore.runTransaction<void>(async t => {
    const announceRef = firestore.doc(`announces/${id}`);
    const announceData = (await t.get(announceRef)).data() as Announce;
    if (!announceData) {
      logger.debug('no data', { id });
      return;
    }
    if (!(postID in announceData.posts)) {
      logger.debug('no post data', { id, postID });
      return;
    }

    t.delete(announceRef.collection('posts').doc(postID));
    {
      const updateData = {
        [`posts.${postID}`]: fieldDelete(),
        uT: serverTimestamp(),
      };
      t.update(announceRef, updateData);
    }
  });
};
