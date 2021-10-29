import { EditImportPostsParams, ImportPosts } from '../../shared';
import { CallableContext, FirebaseAdminApp, getFirestore, serverTimestamp } from '../firebase';
import { checkOwner } from '../utils/firestore';

export const editImportPosts = async (
  params: EditImportPostsParams,
  context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id, url, pubKey } = params;

  const firestore = getFirestore(adminApp);

  {
    const isOwner = await checkOwner(firestore, uid, id);
    if (!isOwner) {
      throw new Error('not Owner');
    }
  }

  const data: Partial<ImportPosts> = {
    url,
    pubKey,
    requested: false,
    uT: serverTimestamp() as any,
  };

  const optionRef = firestore.doc(`import-posts/${id}`);
  await optionRef.set(data, { merge: true });
};
