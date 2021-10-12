import { DocumentChange, EventContext, FirebaseAdminApp, QueryDocumentSnapshot } from '../firebase';
import { deleteAnnounce } from './announces-delete';
import { pushPosts } from './announces-push-posts';
import { archiveImmediateNotification } from './notif-imm-archive';
import { deleteImmediateNotification } from './notif-imm-delete';

export const announcesUpdateHandler = async (
  change: DocumentChange,
  context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  await pushPosts(change, context, adminApp);
};

export const announcesDeleteHandler = async (
  qds: QueryDocumentSnapshot,
  context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  await deleteAnnounce(qds, context, adminApp);
};

export const immediateNotificationWriteHandler = async (
  change: DocumentChange,
  context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  if (change.after) {
    await archiveImmediateNotification(change.after, context, adminApp);
  } else {
    await deleteImmediateNotification(change.before, context, adminApp);
  }
};
