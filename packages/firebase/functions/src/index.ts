import { AppEnv } from '@announcing/shared';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import 'firebase-functions/lib/logger/compat';
import 'source-map-support/register';
import { httpsCallHandler } from './call';
import { firestoreDeleteAnnounce, firestoreUpdateAnnounce } from './firestore/announce';
import { firestoreUpdateImportPosts } from './firestore/import-posts';
import { firestoreNotificationDeviceWrite } from './firestore/notif-devices';
import { firestoreImmediateNotificationWrite } from './firestore/notif-imm';
import {
  httpsGetAnnounceMetaData,
  httpsGetAnnouncePostData,
  httpsGetImageData,
} from './https/get-data';
import { httpsPingImportPosts } from './https/import-posts';
import { pubsubSendNotification } from './pubsub/send-notification';
import { RetryError } from './utils/errors';
import { logger } from './utils/logger';

const adminApp = admin.initializeApp();
const appEnv = new AppEnv().env;

const region = functions.region(appEnv.functionsRegion);

adminApp.firestore().settings({ ignoreUndefinedProperties: true });

export const httpsCall = region.https.onCall(async (data, context) => {
  return httpsCallHandler(data, context, adminApp);
});

type httpsHandler = (
  req: functions.Request,
  res: functions.Response,
  adminApp: ReturnType<typeof admin.initializeApp>,
) => Promise<void>;
const onHttpsRequest = (handler: httpsHandler) => {
  return region.https.onRequest(async (req, res) => {
    await handler(req, res, adminApp);
  });
};

export const getAnnounceMetaData = onHttpsRequest(httpsGetAnnounceMetaData);
export const getAnnouncePostData = onHttpsRequest(httpsGetAnnouncePostData);
export const getImageData = onHttpsRequest(httpsGetImageData);
export const pingImportPosts = onHttpsRequest(httpsPingImportPosts);

export const onFirestoreUpdateAnnounce = region
  .runWith({ failurePolicy: true })
  .firestore.document('announces/{announceID}')
  .onUpdate((change, context) => {
    return firestoreUpdateAnnounce(change, context, adminApp);
  });
export const onFirestoreDeleteAnnounce = region.firestore
  .document('announces/{announceID}')
  .onDelete((qds, context) => {
    return firestoreDeleteAnnounce(qds, context, adminApp);
  });

export const onFirestoreUpdateImportPosts = region
  .runWith({ failurePolicy: true })
  .firestore.document('import-posts/{announceID}')
  .onUpdate((change, context) => {
    try {
      return firestoreUpdateImportPosts(change, context, adminApp);
    } catch (err) {
      if (err instanceof RetryError) {
        throw err;
      }
      logger.error('onFirestoreUpdateImportPosts Error', { err });
      return;
    }
  });

export const onFirestoreNotificationDeviceWrite = region.firestore
  .document('notif-devices/{token}')
  .onWrite((change, context) => {
    return firestoreNotificationDeviceWrite(change, context, adminApp);
  });

export const onFirestoreImmediateNotificationWrite = region.firestore
  .document('notif-imm/{announceID}')
  .onWrite((change, context) => {
    return firestoreImmediateNotificationWrite(change, context, adminApp);
  });

export const onPubsubSendNotification = region
  .runWith({ failurePolicy: true })
  .pubsub.topic('send-notification')
  .onPublish(async (msg, context) => {
    await pubsubSendNotification(msg, context, adminApp);
    return 0;
  });
