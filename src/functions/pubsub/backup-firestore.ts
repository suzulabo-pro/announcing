import admin from 'firebase-admin';
import { AppEnv, AppError } from '../../shared';
import { EventContext, FirebaseAdminApp } from '../firebase';
import { logger } from '../utils/logger';

const appEnv = new AppEnv().env;

export const pubsubBackupFirestore = async (_context: EventContext, adminApp: FirebaseAdminApp) => {
  const projectID = adminApp.options.projectId;
  if (!projectID) {
    throw new AppError('missing projectID');
  }

  const prefix = appEnv.firestoreBackup.bucketPrefix();

  const client = new admin.firestore.v1.FirestoreAdminClient();
  const databaseName = client.databasePath(projectID, '(default)');

  logger.info('exportDocuments', { prefix });

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: prefix,
    collectionIds: [],
  });
};
