import { Announce, AnnounceMeta, Lang, Post } from '../../shared';
import {
  DocumentChange,
  EventContext,
  FirebaseAdminApp,
  Firestore,
  MulticastMessage,
  Notification,
} from '../firebase';
import { pubMulticastMessages } from '../pubsub/send-notification';
import { ImmediateNotification, ImmediateNotificationArchive } from '../utils/datatypes';
import { logger } from '../utils/logger';

const getImmediateNotificationDevices = async (firestore: Firestore, announceID: string) => {
  const immediateRef = firestore.doc(`notif-imm/${announceID}`);
  const immediate = (await immediateRef.get()).data() as ImmediateNotification;
  if (!immediate) {
    return;
  }

  const devices = [] as [string, [lang: Lang]][];
  if (immediate.archives) {
    const archivesRef = immediateRef.collection('archives');
    for (const archiveID of immediate.archives) {
      const archive = (
        await archivesRef.doc(archiveID).get()
      ).data() as ImmediateNotificationArchive;
      if (archive) {
        devices.push(...Object.entries(archive.devices));
      }
    }
  }

  if (immediate.devices) {
    devices.push(...Object.entries(immediate.devices));
  }

  const cancels = immediate.cancels;
  if (!cancels || cancels.length == 0) {
    return new Map(devices);
  } else {
    const filtered = devices.filter(([token]) => {
      return !cancels.includes(token);
    });
    return new Map(filtered);
  }
};

export const pushPosts = async (
  change: DocumentChange,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const beforeData = change.before.data() as Announce;
  const afterData = change.after.data() as Announce;
  if (!afterData) {
    logger.warn('afterData is null');
    return;
  }

  const beforePosts = beforeData.posts;
  const afterPosts = afterData.posts;

  {
    const beforeLatest = Math.max(...Object.values(beforePosts).map(v => v.pT.toMillis()));
    const afterLatest = Math.max(...Object.values(afterPosts).map(v => v.pT.toMillis()));
    if (beforeLatest >= afterLatest) {
      logger.debug('no new post');
      return;
    }
  }

  const beforePostIDsSet = new Set(Object.keys(beforePosts));
  const newPosts = [] as string[];
  for (const [id, v] of Object.entries(afterPosts)) {
    if (!beforePostIDsSet.has(id) && !v.edited) {
      newPosts.push(id);
    }
  }
  if (newPosts.length == 0) {
    logger.debug('no new posts');
    return;
  }

  const firestore = adminApp.firestore();
  const announceID = change.after.id;

  const devices = await getImmediateNotificationDevices(firestore, announceID);
  if (!devices || devices.size == 0) {
    logger.debug('no devices');
    return;
  }

  const tokensSet = new Set<string>(devices.keys());

  const announceRef = firestore.doc(`announces/${announceID}`);
  const a = (await announceRef.get()).data() as Announce;
  if (!a) {
    logger.warn('missing announce', { announceID });
    return;
  }
  const announceMeta = (
    await announceRef.collection('meta').doc(a.mid).get()
  ).data() as AnnounceMeta;

  if (!announceMeta) {
    logger.warn('missing announce meta', { announceID });
    return;
  }

  const baseMsg = {
    notification: {
      title: announceMeta.name,
    } as Notification,
    data: { announceID, ...(announceMeta.icon && { icon: announceMeta.icon }) },
  };
  if (newPosts.length == 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const postID = newPosts.pop()!;
    const postRef = announceRef.collection('posts').doc(postID);
    const postData = (await postRef.get()).data() as Post;
    if (!postData) {
      logger.warn('missing post', { announceID, postID });
      return;
    }

    baseMsg.notification.body = postData.title || postData.body;
  }

  const msgs = [] as MulticastMessage[];

  const tokens = [...tokensSet] as string[];
  while (tokens.length > 0) {
    msgs.push({ ...baseMsg, tokens: tokens.splice(0, 500) });
  }

  if (msgs.length == 0) {
    logger.debug('no msgs');
    return;
  }

  try {
    await pubMulticastMessages(msgs);
  } catch (err) {
    logger.critical('pubMulticastMessages error', { err });
    throw err;
  }
};
