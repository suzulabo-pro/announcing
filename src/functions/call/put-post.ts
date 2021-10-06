import { Announce, Post, PutPostParams } from '../../shared';
import {
  CallableContext,
  fieldDelete,
  FirebaseAdminApp,
  serverTimestamp,
  Timestamp,
} from '../firebase';
import { checkOwner, postHash, storeImage } from '../utils/firestore';
import { logger } from '../utils/logger';

export const putPost = async (
  params: PutPostParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;

  if (!uid) {
    throw new Error('missing uid');
  }

  const { id, title, body, link, imgData, editID } = params;

  const firestore = adminApp.firestore();

  {
    const isOwner = await checkOwner(firestore, uid, id);
    if (!isOwner) {
      logger.warn('not owner', { params });
      return;
    }
  }

  const now = Timestamp.now();

  const postData: Post = {
    ...(!!title && { title }),
    ...(!!body && { body }),
    ...(!!link && { link }),
    pT: now,
  };

  if (editID) {
    const postRef = firestore.doc(`announces/${id}/posts/${editID}`);
    const data = (await postRef.get()).data() as Post;
    if (!data) {
      throw new Error(`missing edit data: ${id}/${editID}`);
    }
    postData.pT = data.pT;
  }

  await firestore.runTransaction<void>(async t => {
    const announceRef = firestore.doc(`announces/${id}`);
    const announceData = (await t.get(announceRef)).data() as Announce;
    if (!announceData) {
      logger.debug('no data', { id });
      return;
    }

    if (imgData) {
      const imgID = await storeImage(firestore, imgData);
      if (imgID) {
        postData.img = imgID;
      }
    }

    const postID = postHash(postData);
    if (postID in announceData.posts) {
      logger.warn('duplicate postID', { postID, params });
    }

    t.create(announceRef.collection('posts').doc(postID), postData);

    if (editID) {
      const updateData = {
        [`posts.${postID}`]: { pT: postData.pT, edited: editID },
        [`posts.${editID}`]: fieldDelete(),
        uT: serverTimestamp(),
      };
      t.update(announceRef, updateData);
      t.delete(announceRef.collection('posts').doc(editID));
    } else {
      const updateData = {
        [`posts.${postID}`]: { pT: postData.pT },
        uT: serverTimestamp(),
      };
      t.update(announceRef, updateData);
    }
  });
};
