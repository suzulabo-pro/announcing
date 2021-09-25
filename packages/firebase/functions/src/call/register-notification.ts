import { bs62, RegisterNotificationParams } from '@announcing/shared';
import nacl from 'tweetnacl';
import { TextDecoder } from 'util';
import { CallableContext, FirebaseAdminApp, serverTimestamp } from '../firebase';
import { NotificationDevice } from '../utils/datatypes';
import { logger } from '../utils/logger';

export const verifySign = (_signKey: string, _sign: string) => {
  const signKey = bs62.decode(_signKey);
  const sign = bs62.decode(_sign);
  const data = nacl.sign.open(sign, signKey);
  if (!data) {
    return;
  }
  const s = new TextDecoder().decode(data);
  return s.split('\0');
};

export const registerNotification = async (
  params: RegisterNotificationParams,
  _context: CallableContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const { reqTime, token, signKey, sign, lang, announces } = params;

  {
    const d = new Date(reqTime).getTime();
    const now = Date.now();
    if (!(d >= now - 1000 * 60 * 60 && d <= now + 1000 * 60 * 60)) {
      throw new Error('invalid sign (retTime)');
    }

    const m = new TextEncoder().encode([reqTime, token, ...announces].join('\0'));
    if (!nacl.sign.detached.verify(m, bs62.decode(sign), bs62.decode(signKey))) {
      throw new Error('invalid sign');
    }
  }

  const firestore = adminApp.firestore();
  const docRef = firestore.doc(`notif-devices/${token}`);
  {
    const doc = (await docRef.get()).data() as NotificationDevice;
    if (doc) {
      if (doc.signKey != signKey) {
        throw new Error('invalid signkey');
      }
    }
  }

  if (announces.length > 0) {
    const data = {
      signKey,
      lang,
      announces,
      uT: serverTimestamp(),
    };
    await firestore.doc(`notif-devices/${token}`).set(data);
    logger.info('SET NOTIFICATION:', { token, data });
  } else {
    await firestore.doc(`notif-devices/${token}`).delete();
    logger.info('UNSET NOTIFICATION:', { token });
  }
};
