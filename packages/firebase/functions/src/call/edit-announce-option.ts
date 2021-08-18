import { AnnounceOptionRule, EditAnnounceOptionParams } from '@announcing/shared';
import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { checkOwner } from '../utils/firestore';

export const callEditAnnounceOption = async (
  params: Partial<EditAnnounceOptionParams>,
  context: CallableContext,
  adminApp: admin.app.App,
): Promise<void> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new Error('missing uid');
  }

  const { id, importURL, importToken } = params;
  if (!id) {
    throw new Error('missing id');
  }
  if (importURL) {
    if (importURL.length > AnnounceOptionRule.importURL.length) {
      throw new Error('importURL is too long');
    }
    if (!importToken) {
      throw new Error('missing importToken');
    }
    if (importToken.length > AnnounceOptionRule.importToken.length) {
      throw new Error('importToken is too long');
    }

    {
      const url = new URL(importURL);
      if (url.protocol != 'https:') {
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
    importURL,
    importToken,
    uT: admin.firestore.FieldValue.serverTimestamp(),
  };

  const optionRef = firestore.doc(`announce_options/${id}`);
  await optionRef.set(data);
};
