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
  Sec('docs-vars.json', 'firebase/docs'),
  Sec('appenv.env.ts'),
  Sec('android.custom.properties'),
  Sec('apple-app-site-association'),
  Sec('assetlinks.json'),

  Sec('AppleDistribution.p12'),
  Sec('Ad_Hoc.mobileprovision'),
  Sec('Release.mobileprovision'),
];
