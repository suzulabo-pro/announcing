import { copySecrets, packSecrets, SecretsConfig, unpackSecrets } from '@suzulabo/secrets-packer';

const config: SecretsConfig = {
  files: [
    ['App.entitlements', 'capacitor/client/ios/App/App'],
    ['GoogleService-Info.plist', 'capacitor/client/ios/App/App'],
    ['google-services.json', 'capacitor/client/android/app'],
    ['.firebaserc', 'firebase'],
    ['docs-vars.json', 'firebase/docs'],
    ['appenv.env.ts'],
    ['android.custom.properties'],
    ['apple-app-site-association'],
    ['assetlinks.json'],

    ['AppleDistribution.p12'],
    ['Ad_Hoc.mobileprovision'],
    ['Release.mobileprovision'],

    ['release.keystore'],
  ],
  secretsJSONKeys: [
    'APPSTORE_API_KEY',
    'APPSTORE_API_ISSUER',
    'FIREBASE_APP_ID_IOS',
    'FIREBASE_APP_ID_ANDROID',
  ],
};

export const secrets = {
  pack: () => {
    return packSecrets(config);
  },
  unpack: () => {
    return unpackSecrets(config);
  },
  copy: () => {
    return copySecrets(config);
  },
};
