import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import 'firebase-functions/lib/logger/compat';
import 'source-map-support/register';
import { AppEnv } from '../shared';
import { httpsCallHandler } from './call';
import {
  announcesDeleteHandler,
  announcesUpdateHandler,
  immediateNotificationWriteHandler,
} from './firestore';
import { httpsRequestHandler } from './https';
import { pubsubImportPostsFetch } from './pubsub/import-posts-fetch';
import { pubsubSendNotification } from './pubsub/send-notification';

const adminApp = admin.initializeApp();
const appEnv = new AppEnv().env;

const region = functions.region(appEnv.functionsRegion);

adminApp.firestore().settings({ ignoreUndefinedProperties: true });

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

const pubsubBuilder = region.pubsub;

export const pubsub = {
  sendNotification: pubsubBuilder.topic('send-notification').onPublish(async (msg, context) => {
    await pubsubSendNotification(msg, context, adminApp);
    return 0;
  }),
  importPostsFetch: pubsubBuilder.topic('import-posts-fetch').onPublish(async (msg, context) => {
    await pubsubImportPostsFetch(msg, context, adminApp);
    return 0;
  }),
};
