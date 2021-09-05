import { ImportPostsRule, EditImportPostsParams } from '@announcing/shared';
import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { checkOwner } from '../utils/firestore';

export const callEditImportPosts = async (
  params: Partial<EditImportPostsParams>,
  context: CallableContext,
  adminApp: admin.app.App,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id, url, pubKey } = params;
  if (!id) {
    throw new Error('missing id');
  }
  if (url) {
    if (url.length > ImportPostsRule.url.length) {
      throw new Error('url is too long');
    }
    if (!pubKey) {
      throw new Error('missing pubKey');
    }

    {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol.toLowerCase();
      if (protocol != 'https:' && protocol != 'http:') {
        throw new Error('invalid protocol');
      }
    }
  }

  const firestore = adminApp.firestore();

  {
    const isOwner = await checkOwner(firestore, uid, id);
    if (!isOwner) {
      throw new Error('not Owner');
    }
  }

  const data = {
    url,
    pubKey,
    uT: admin.firestore.FieldValue.serverTimestamp(),
  };

  const optionRef = firestore.doc(`import-posts/${id}`);
  await optionRef.set(data, { merge: true });
};
