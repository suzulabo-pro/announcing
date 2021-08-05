import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { setSecret, sh } from './util';

const SECRET_KEY = 'BUILD_VALUES';

const SECRETS_KEYS = ['FIREBASE_APP_ID_ANDROID', 'FIREBASE_APP_ID_IOS'] as const;

const SECRET_FILES = [
  ['FIREBASERC', 'firebase/.firebaserc'],
  ['APPENV_TS', 'shared/src/appenv.env.ts'],
  ['ASSETLINKS_JSON', 'client/assetlinks.json'],
  ['GOOGLE_SERVICES_JSON', 'client/google-services.json'],
  ['ANDROID_CUSTOM_PROPS', 'client/android.custom.properties'],
  ['APPLE_APP_SITE_ASSOCIATION', 'client/apple-app-site-association'],
  ['APP_ENTITLEMENTS', 'client/App.entitlements'],
  ['GOOGLESERVICE_INFO_PLIST', 'client/GoogleService-Info.plist'],
  ['PLAY_CONSOLE_ACCOUNT_JSON', 'client/play-console-account.json'],
  ['UPLOAD_KEYSTORE_JKS_BASE64', 'client/upload-keystore.jks'],
  ['APPLE_DISTRIBUTION_P12_BASE64', 'secrets/AppleDistribution.p12'],
  ['AD_HOC_PROVISION_BASE64', 'secrets/Ad_Hoc.mobileprovision'],
] as const;

const parseProvisioningProfile = async (
  secrets: { [k: string]: string },
  prefix: string,
  f: string,
) => {
  const getValue = (keyPash: string) => {
    return sh(
      `security cms -D -i ${f} | xmllint --xpath '${keyPash}/following-sibling::string[position()=1]/text()' -`,
      undefined,
      undefined,
      false,
    );
  };

  const name = await getValue('/plist/dict/key[text()="Name"]');
  secrets[`${prefix}_PROVISION_NAME`] = name;
  const appIdentifer = await getValue(
    '/plist/dict/key[text()="Entitlements"]/following-sibling::dict/key[text()="application-identifier"]',
  );
  secrets[`${prefix}_APPID`] = appIdentifer.split('.').slice(1).join('.'); // remove TERM_ID
};

const buildSecrets = async () => {
  const result: { [k: string]: string } = {};

  const secretsJson: { [k: string]: string } = JSON.parse(
    readFileSync(join(__dirname, '.secrets.json'), 'utf-8'),
  );

  for (const k of SECRETS_KEYS) {
    const v = secretsJson[k];
    if (!v) {
      throw new Error(`${k} is empty`);
    }
    result[k] = v;
    console.log(`${k} ...ok`);
  }

  for (const [k, f] of SECRET_FILES) {
    const v = readFileSync(f, k.endsWith('_BASE64') ? 'base64' : 'utf-8');
    result[k] = v;
    console.log(`${k} ...ok`);

    if (k == 'AD_HOC_PROVISION_BASE64') {
      await parseProvisioningProfile(result, 'AD_HOC', f);
    }
  }

  return result;
};

const deploy = async (dryrun: boolean) => {
  console.log('checking variavles');
  const secrets = await buildSecrets();

  if (dryrun) {
    return;
  }

  console.log('');
  console.log('deploying secrets');

  await setSecret(SECRET_KEY, JSON.stringify(secrets));

  console.log('');
  console.log('done.');
  console.log('');
  console.log(
    'You may set FIREBASE_TOKEN, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEYSTORE_UPLOAD_KEY_PASSWORD and APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD manualy',
  );
};

const extract = () => {
  const secretsJson = process.env['BUILD_VALUES'];
  if (!secretsJson) {
    throw new Error('missing BUILD_VALUES');
  }

  const secrets = JSON.parse(secretsJson) as { [k: string]: string };

  for (const [k, f] of SECRET_FILES) {
    const v = secrets[k];
    if (!v) {
      throw new Error(`missing ${k}`);
    }

    if (k.endsWith('_BASE64')) {
      writeFileSync(f, Buffer.from(v, 'base64'), { flag: 'wx' });
    } else {
      writeFileSync(f, v, { flag: 'wx' });
    }
  }

  const outputKeys = [...SECRETS_KEYS, 'AD_HOC_PROVISION_NAME', 'AD_HOC_APPID'];

  for (const k of outputKeys) {
    const v = secrets[k];
    if (!v) {
      throw new Error(`missing ${k}`);
    }
    console.log(`::set-output name=${k}::${v}`);
  }
};

const main = async () => {
  const cmd = process.argv[2];
  if (cmd == '--extract') {
    extract();
    return;
  }

  await deploy(cmd != '--deploy');
};

main().catch(err => {
  console.error(err);
});
