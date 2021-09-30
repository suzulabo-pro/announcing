import { DocumentSnapshot, EventContext, FirebaseAdminApp } from '../firebase';
import { ImmediateNotification } from '../utils/datatypes';

export const deleteImmediateNotification = async (
  ds: DocumentSnapshot,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const imm = ds.data() as ImmediateNotification;
  const { announceID, archives } = imm;
  if (!archives) {
    return;
  }

  const firestore = adminApp.firestore();
  while (archives.length > 0) {
    const ids = archives.splice(0, 500);
    const batch = firestore.batch();
    for (const id of ids) {
      batch.delete(firestore.doc(`notif-imm/${announceID}/archives/${id}`));
    }
    await batch.commit();
  }
};
