import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Build } from '@stencil/core';
import { FirebaseApp, FirebaseError, initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import { getMessaging, getToken, isSupported, Messaging } from 'firebase/messaging';
import nacl from 'tweetnacl';
import { Announce, AppEnv, AppError, bs62, Lang, RegisterNotificationParams } from '../../shared';
import { FirestoreHelper } from '../../shared-web';
import { PostNotificationRecievedEvent } from './datatypes';

const devonly_setEmulator = (functions: Functions, firestore: Firestore) => {
  if (!Build.isDev || Capacitor.getPlatform() != 'web') {
    return;
  }
  console.log('useEmulator');

  connectFunctionsEmulator(functions, location.hostname, parseInt(location.port));
  connectFirestoreEmulator(firestore, location.hostname, parseInt(location.port));
};

class CapNotification {
  private token?: string;

  constructor() {
    void PushNotifications.addListener('pushNotificationReceived', notification => {
      console.debug('pushNotificationReceived', JSON.stringify(notification, null, 2));

      void LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: notification.title || '',
            body: notification.body || '',
            extra: notification.data,
          },
        ],
      });
    });
    void PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.debug('pushNotificationActionPerformed', JSON.stringify(notification, null, 2));

      this.dispatchPostNotificationRecieved(notification.notification.data);
    });
    void LocalNotifications.addListener('localNotificationActionPerformed', notification => {
      console.debug('localNotificationActionPerformed', JSON.stringify(notification, null, 2));

      this.dispatchPostNotificationRecieved(notification.notification.extra);
    });
  }

  private dispatchPostNotificationRecieved(data?: any) {
    const announceID = data?.announceID;
    if (!announceID || typeof announceID != 'string') {
      return;
    }

    const event = new PostNotificationRecievedEvent({ announceID });
    window.dispatchEvent(event);
  }

  async checkNotifyPermission(ask: boolean) {
    {
      const result = await PushNotifications.checkPermissions();

      switch (result.receive) {
        case 'denied':
        case 'granted':
          return result.receive;
        default:
          if (!ask) {
            return 'default';
          }
      }
    }

    {
      const result = await PushNotifications.requestPermissions();
      switch (result.receive) {
        case 'denied':
        case 'granted':
          return result.receive;
        default:
          return 'default';
      }
    }
  }

  async messageToken() {
    if (this.token) {
      return this.token;
    }

    const p = (() => {
      let resolve!: (v: string) => void;
      let reject!: (r: any) => void;
      const promise = new Promise<string>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
      return { promise, resolve, reject };
    })();

    const handlers = [
      await PushNotifications.addListener('registration', v => {
        p.resolve(v.value);
      }),
      await PushNotifications.addListener('registrationError', reason => {
        p.reject(reason);
      }),
    ];

    try {
      const status = await this.checkNotifyPermission(true);
      if (status != 'granted') {
        return;
      }
      await PushNotifications.register();
      this.token = await p.promise;
      return this.token;
    } finally {
      handlers.forEach(v => v.remove());
    }
  }
}

export class AppFirebase {
  private functions: Functions;
  private firestore: Firestore;
  private firestoreHelper: FirestoreHelper;

  private messaging?: Messaging;
  private capNotification?: CapNotification;

  constructor(private appEnv: AppEnv, private firebaseApp?: FirebaseApp) {
    if (!this.firebaseApp) {
      this.firebaseApp = initializeApp(this.appEnv.env.firebaseConfig);
    }

    this.functions = getFunctions(this.firebaseApp, this.appEnv.env.functionsRegion);
    this.firestore = getFirestore(this.firebaseApp);
    this.firestoreHelper = new FirestoreHelper(this.firestore);

    if (Capacitor.isNativePlatform()) {
      this.capNotification = new CapNotification();
    }

    devonly_setEmulator(this.functions, this.firestore);
  }

  async init() {
    try {
      await enableMultiTabIndexedDbPersistence(this.firestore);
    } catch (err) {
      console.warn('enablePersistence', err);
    }

    if (!this.capNotification) {
      try {
        if (await isSupported()) {
          this.messaging = getMessaging(this.firebaseApp);
        }
      } catch (err) {
        console.warn('create messaging', err);
      }
    }
  }

  private async callFunc<
    RequestData = { method: string; [k: string]: any },
    ResponseData = unknown,
  >(params: RequestData): Promise<ResponseData> {
    const f = httpsCallable<RequestData, ResponseData>(this.functions, 'httpsCall');
    const res = await f(params);
    return res.data;
  }

  async getAnnounce(id: string, temporary?: boolean) {
    return this.firestoreHelper.listenAndGet<Announce>(
      `announces/${id}`,
      (oldData, newData) => {
        if (oldData && newData) {
          return oldData.uT.toMillis() != newData.uT.toMillis();
        }
        return true;
      },
      temporary,
    );
  }

  private async messageToken() {
    if (this.capNotification) {
      return this.capNotification.messageToken();
    }

    if (!this.messaging) {
      return;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
    const token = await getToken(this.messaging, {
      vapidKey: this.appEnv.env.vapidKey,
      serviceWorkerRegistration,
    });

    return token;
  }

  async checkNotifyPermission(ask: boolean) {
    if (this.capNotification) {
      return this.capNotification.checkNotifyPermission(ask);
    }

    if (!this.messaging) {
      return 'unsupported';
    }

    if (Notification == null || Notification.permission == null) {
      return 'unsupported';
    }

    const permission = Notification.permission;
    switch (permission) {
      case 'granted':
      case 'denied':
        return permission;
      case 'default':
        if (!ask) {
          return permission;
        }
    }

    try {
      const token = await this.messageToken();
      if (token) {
        return 'granted';
      } else {
        return 'denied';
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code == 'messaging/permission-blocked') {
          return 'denied';
        }
      }
      throw err;
    }
  }

  async registerMessaging(signSecKey: string, lang: Lang, announces: string[]) {
    const token = await this.messageToken();
    if (!token) {
      throw new AppError("can't get token");
    }

    const reqTime = new Date().toISOString();
    const signBody = [reqTime, token, ...announces].join('\0');
    const secKey = bs62.decode(signSecKey);
    const sign = bs62.encode(nacl.sign.detached(new TextEncoder().encode(signBody), secKey));
    const signKey = bs62.encode(nacl.sign.keyPair.fromSecretKey(secKey).publicKey);

    const params: RegisterNotificationParams = {
      method: 'RegisterNotification',
      reqTime,
      token: token,
      signKey,
      sign,
      lang,
      announces,
    };

    await this.callFunc<RegisterNotificationParams, void>(params);
  }
}
