import { PubSub } from '@google-cloud/pubsub';
import {
  BatchResponse,
  EventContext,
  FirebaseAdminApp,
  MulticastMessage,
  PubSubMessage,
} from '../firebase';
import { logger } from '../utils/logger';

export const pubMulticastMessages = async (msgs: MulticastMessage[]) => {
  const pubsub = new PubSub();
  const topic = pubsub.topic('send-notification', {
    batching: { maxMessages: 100, maxMilliseconds: 50 },
  });
  for (const mmsg of msgs) {
    logger.debug('multicastMsg', mmsg);
    void topic.publishJSON({ mmsg });
  }
  await topic.flush();
};

export const pubsubSendNotification = async (
  msg: PubSubMessage,
  _context: EventContext,
  adminApp: FirebaseAdminApp,
) => {
  const handleResponse = async (bs: BatchResponse, tokens: string[]) => {
    if (bs.failureCount == 0) {
      return;
    }

    const firestore = adminApp.firestore();
    const batch = firestore.batch();
    let update = false;
    bs.responses.forEach((res, i) => {
      if (res.success) {
        return;
      }

      const token = tokens[i];
      const err = res.error;
      logger.warn('send error', { ...err, token });
      if (err && err.code == 'messaging/registration-token-not-registered') {
        batch.delete(firestore.doc(`notif-devices/${token}`));
        update = true;
      }
    });
    if (update) {
      try {
        await batch.commit();
      } catch (err) {
        logger.error('update error', { err });
      }
    }
  };

  const messaging = adminApp.messaging();
  {
    const mmsg = msg.json.mmsg as MulticastMessage;
    if (mmsg) {
      logger.debug('sendMulticast', mmsg);
      const res = await messaging.sendMulticast(mmsg);
      await handleResponse(res, mmsg.tokens);
      return;
    }
  }

  logger.warn('no msgs', msg.json);
};
