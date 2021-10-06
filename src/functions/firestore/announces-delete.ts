import { Announce } from '../../shared';
import { EventContext, FirebaseAdminApp, QueryDocumentSnapshot } from '../firebase';

export const deleteAnnounce = async (
  qds: QueryDocumentSnapshot,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const id = qds.id;
  const announceData = qds.data() as Announce;

  const posts = Object.keys(announceData.posts).map(v => `announces/${id}/posts/${v}`);
  const pathes = [...posts, `announces/${id}/meta/${announceData.mid}`, `notif-imm/${id}`];

  const firestore = adminApp.firestore();

  while (pathes.length > 0) {
    const c = pathes.splice(0, 500);
    const batch = firestore.batch();
    for (const p of c) {
      batch.delete(firestore.doc(p));
    }
    await batch.commit();
  }
};
