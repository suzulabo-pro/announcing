import * as functions from 'firebase-functions';
import 'firebase-functions/lib/logger/compat';
import 'source-map-support/register';
import { AppEnv } from '../shared';
import { httpsCallHandler } from './call';
import { getFirestore, initializeApp } from './firebase';
import {
  announcesDeleteHandler,
  announcesUpdateHandler,
  immediateNotificationWriteHandler,
} from './firestore';
import { httpsRequestHandler } from './https';
import { pubsubBackupFirestore } from './pubsub/backup-firestore';
import { pubsubExternalAnnounceFetch } from './pubsub/external-announce-fetch';
import { pubsubSendNotification } from './pubsub/send-notification';

const adminApp = initializeApp();
const appEnv = new AppEnv().env;

const region = functions.region(appEnv.functionsRegion);

getFirestore(adminApp).settings({ ignoreUndefinedProperties: true });

export const httpsCall = region.https.onCall((data, context) => {
  return httpsCallHandler(data, context, adminApp);
});

export const httpsRequest = region.https.onRequest((req, res) => {
  return httpsRequestHandler(req, res, adminApp);
});

export const firestore = {
  announcesUpdate: region.firestore
    .document('announces/{announceID}')
    .onUpdate((change, context) => {
      return announcesUpdateHandler(change, context, adminApp);
    }),
  announcesDelete: region.firestore.document('announces/{announceID}').onDelete((qds, context) => {
    return announcesDeleteHandler(qds, context, adminApp);
  }),
  immediateNotificationWrite: region.firestore
    .document('notif-imm/{announceID}')
    .onWrite((change, context) => {
      return immediateNotificationWriteHandler(change, context, adminApp);
    }),
};

const pubsubBuilder = region.runWith({ failurePolicy: { retry: {} } }).pubsub;

export const pubsub = {
  sendNotification: pubsubBuilder.topic('send-notification').onPublish(async (msg, context) => {
    await pubsubSendNotification(msg, context, adminApp);
    return 0;
  }),
  externalAnnounceFetch: pubsubBuilder
    .topic('external-announce-fetch')
    .onPublish(async (msg, context) => {
      await pubsubExternalAnnounceFetch(msg, context, adminApp);
      return 0;
    }),
  backupFirestore: region.pubsub
    .schedule(appEnv.firestoreBackup.schedule)
    .timeZone(appEnv.firestoreBackup.timeZone)
    .onRun(async context => {
      await pubsubBackupFirestore(context, adminApp);
      return 0;
    }),
};
