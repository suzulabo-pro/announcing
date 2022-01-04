import { _appEnv } from '../../secrets/appenv.env';

interface AppEnvironment {
  readonly firebaseConfig: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly projectId: string;
    readonly storageBucket: string;
    readonly messagingSenderId: string;
    readonly appId: string;
  };
  readonly firestoreBackup: {
    readonly bucketPrefix: () => string;
    readonly schedule: string;
  };
  readonly functionsRegion: string;
  readonly vapidKey: string;
  readonly contact: string;
  sites: {
    readonly console: string;
    readonly client: string;
    readonly docs: string;
  };
}

export class AppEnv {
  constructor(readonly env: AppEnvironment = _appEnv) {}
}
