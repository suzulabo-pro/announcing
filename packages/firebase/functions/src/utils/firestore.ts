import {
  AnnounceMetaBase,
  ANNOUNCE_ID_LENGTH,
  ANNOUNCE_META_ID_LENGTH,
  bs62,
  Post,
  POST_ID_LENGTH,
  User,
} from '@announcing/shared';
import * as crypto from 'crypto';
import nacl from 'tweetnacl';
import { Firestore } from '../firebase';
import { logger } from '../utils/logger';

const toMD5Base62 = (v: Buffer | string) => {
  const md5 = crypto.createHash('md5');
  return bs62.encode(md5.update(v).digest());
};

const serialize = (...args: (string | undefined)[]) => {
  return args
    .map(v => (!v ? '' : v))
    .join('\0')
    .replace(/\0+$/, '');
};

export const genAnnounceID = () => {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  const random = nacl.randomBytes(ANNOUNCE_ID_LENGTH);
  const l = [] as string[];
  random.forEach(v => {
    l.push(chars.charAt(v % 32));
  });
  return l.join('');
};

export const announceMetaHash = (v: AnnounceMetaBase) => {
  return toMD5Base62(serialize(v.name, v.desc, v.link, v.icon)).substr(0, ANNOUNCE_META_ID_LENGTH);
};

export const postHash = (v: Post) => {
  return toMD5Base62(
    serialize(v.pT.toMillis().toString(), v.title, v.body, v.link, v.img, v.imgs?.join(':')),
  ).substr(0, POST_ID_LENGTH);
};

export const checkOwner = async (firestore: Firestore, uid: string, id: string) => {
  const userRef = firestore.doc(`users/${uid}`);
  const userData = (await userRef.get()).data() as User;
  if (!userData) {
    logger.warn('no user', { uid });
    return false;
  }
  if (!userData.announces || userData.announces.indexOf(id) < 0) {
    logger.warn('not owner', { uid, id });
    return false;
  }
  return true;
};

export const storeImage = async (firestore: Firestore, img: string) => {
  if (!img) {
    return;
  }
  const data = Buffer.from(img, 'base64');
  const imgID = toMD5Base62(data);
  const imgRef = firestore.doc(`images/${imgID}`);
  const doc = await imgRef.get();
  if (!doc.exists) {
    await imgRef.create({ data });
  }
  return imgID;
};

// testing
export const _serialize = serialize;
