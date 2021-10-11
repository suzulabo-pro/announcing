import * as path from 'path';

export const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
export const SECRET_DIR = path.join(ROOT_DIR, 'secrets');

class SecretFile {
  constructor(public name: string, public location?: string) {}
}

const Sec = (name: string, locaction?: string) => {
  return new SecretFile(name, locaction);
};

export const SECRET_FILES: SecretFile[] = [
  Sec('App.entitlements', 'capacitor/client/ios/App/App'),
  Sec('GoogleService-Info.plist', 'capacitor/client/ios/App/App'),
  Sec('google-services.json', 'capacitor/client/android/app'),
  Sec('.firebaserc', 'firebase'),
  Sec('appenv.env.ts'),
  Sec('apple-app-site-association'),
  Sec('assetlinks.json'),
];
