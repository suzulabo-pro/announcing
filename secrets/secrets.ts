import { readFileSync } from 'fs';
import { join } from 'path';
import { setSecret, setSecretFromFile } from './gh';

const SECRETS_KEYS = ['_FIREBASE_APP_ID_ANDROID', '_FIREBASE_APP_ID_IOS'] as const;

const SECRET_FILES = [
  ['_FIREBASERC', 'firebase/.firebaserc'],
  ['_APPENV_TS', 'shared/src/appenv.env.ts'],
  ['_ASSETLINKS_JSON', 'client/assetlinks.json'],
  ['_GOOGLE_SERVICES_JSON', 'client/google-services.json'],
  ['_ANDROID_CUSTOM_PROPS', 'client/android.custom.properties'],
  ['_APPLE_APP_SITE_ASSOCIATION', 'client/apple-app-site-association'],
  ['_APP_ENTITLEMENTS', 'client/App.entitlements'],
  ['_GOOGLESERVICE_INFO_PLIST', 'client/GoogleService-Info.plist'],
  ['_PLAY_CONSOLE_ACCOUNT_JSON', 'client/play-console-account.json'],
  ['_ANDROID_UPLOAD_KEYSTORE_JKS_BASE64', 'client/upload-keystore.jks'],
  ['_APPLE_DISTRIBUTION_CERTIFICATE_BASE64', 'secrets/AppleDistribution.p12'],
  ['_APPLE_AD_HOC_PROVISION_PROFILE_BASE64', 'secrets/Ad_Hoc.mobileprovision'],
];

const SECRETS: { [k: string]: string } = JSON.parse(
  readFileSync(join(__dirname, '.secrets.json'), 'utf-8'),
);

const setSecrets = async (dryrun: boolean) => {
  for (const k of SECRETS_KEYS) {
    await setSecret(k, SECRETS[k], dryrun);
  }
  for (const [k, f] of SECRET_FILES) {
    await setSecretFromFile(k, f, dryrun);
  }
};

const main = async () => {
  console.log('checking variavles');
  await setSecrets(true);

  if (!process.argv.includes('--deploy')) {
    return;
  }

  console.log('');
  console.log('deploying secrets');
  await setSecrets(false);

  console.log('');
  console.log('done.');
  console.log('');
  console.log(
    'You may set _FIREBASE_TOKEN, _ANDROID_KEYSTORE_PASSWORD, _ANDROID_KEYSTORE_UPLOAD_KEY_PASSWORD and _APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD manualy',
  );
};

main().catch(err => {
  console.error(err);
});
