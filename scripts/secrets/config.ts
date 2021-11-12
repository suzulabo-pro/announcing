import * as fs from 'fs';
import * as path from 'path';

export const SECRETS_KEYS = ['APPSTORE_API_KEY', 'APPSTORE_API_ISSUER'] as const;
type SECRETS_KEYS_UNION = typeof SECRETS_KEYS[number];

export const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
export const SECRET_DIR = path.join(ROOT_DIR, 'secrets');

class SecretFile {
  constructor(public name: string, public location?: string) {}
}

const Sec = (name: string, locaction?: string) => {
  return new SecretFile(name, locaction);
};

export const SECRET_FILES: SecretFile[] = [
  Sec('secrets.json'),

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

  Sec('app-store-key.p8', 'private_keys'),
];

export const loadSecretJSON = () => {
  const secretsJson: Record<SECRETS_KEYS_UNION, string> = JSON.parse(
    fs.readFileSync(path.join(SECRET_DIR, 'secrets.json'), 'utf-8'),
  );

  return secretsJson;
};
