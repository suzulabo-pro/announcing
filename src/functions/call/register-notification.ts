import nacl from 'tweetnacl';
import { bs62, Lang, RegisterNotificationParams } from '../../shared';
import {
  arrayRemove,
  arrayUnion,
  CallableContext,
  fieldDelete,
  FirebaseAdminApp,
  Firestore,
  getFirestore,
  serverTimestamp,
  Transaction,
} from '../firebase';
import { NotificationDevice } from '../utils/datatypes';
import { logger } from '../utils/logger';

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

  const firestore = getFirestore(adminApp);

  const devicesRef = firestore.doc(`notif-devices/${token}`);

  await firestore.runTransaction(async t => {
    const curDevice = (await t.get(devicesRef)).data() as NotificationDevice;
    if (curDevice) {
      if (curDevice.signKey != signKey) {
        throw new Error('invalid signkey');
      }
    }
    if (announces.length > 0) {
      const newDevice = {
        signKey,
        lang,
        announces,
        uT: serverTimestamp() as any,
      };

      t.set(devicesRef, newDevice);

      updateNotification(token, curDevice, newDevice, t, adminApp);

      logger.info('SET NOTIFICATION:', { token, data: newDevice });
    } else {
      t.delete(devicesRef);

      updateNotification(token, curDevice, null, t, adminApp);

      logger.info('UNSET NOTIFICATION:', { token });
    }
  });
};

const setImmediateNotification = (
  firestore: Firestore,
  t: Transaction,
  announceID: string,
  token: string,
  lang: Lang,
) => {
  const data = {
    announceID,
    devices: {
      [token]: [lang],
    },
    cancels: arrayRemove(token),
    uT: serverTimestamp(),
  };
  t.set(firestore.doc(`notif-imm/${announceID}`), data, {
    merge: true,
  });
};

const unsetImmediateNotification = (
  firestore: Firestore,
  t: Transaction,
  announceID: string,
  token: string,
) => {
  const data = {
    devices: { [token]: fieldDelete() },
    cancels: arrayUnion(token),
    uT: serverTimestamp(),
  };
  t.set(firestore.doc(`notif-imm/${announceID}`), data, {
    merge: true,
  });
};

const genUpdators = (
  firestore: Firestore,
  t: Transaction,
  token: string,
  device: NotificationDevice,
) => {
  const result = [] as {
    key: string;
    update: () => void;
    remove: () => void;
  }[];

  for (const announceID of device.announces) {
    const key = `imm-${announceID}`;
    const update = () => {
      setImmediateNotification(firestore, t, announceID, token, device.lang);
    };
    const remove = () => {
      unsetImmediateNotification(firestore, t, announceID, token);
    };
    result.push({ key, update, remove });
  }

  return result;
};

const updateNotification = (
  token: string,
  curDevice: NotificationDevice | null,
  newDevice: NotificationDevice | null,
  t: Transaction,
  adminApp: FirebaseAdminApp,
) => {
  const firestore = getFirestore(adminApp);

  const updators = newDevice ? genUpdators(firestore, t, token, newDevice) : [];
  if (curDevice) {
    const keysSet = new Set(
      updators.map(v => {
        return v.key;
      }),
    );
    const beforeUpdators = genUpdators(firestore, t, token, curDevice);
    for (const updator of beforeUpdators) {
      if (!keysSet.has(updator.key)) {
        updator.remove();
      }
    }
  }

  for (const updator of updators) {
    updator.update();
  }
};
