import * as fs from 'fs';
import * as path from 'path';
import { loadSecretJSON, ROOT_DIR, SECRET_DIR, SECRET_FILES } from './config';

export const copySecrets = () => {
  const secretsJson = loadSecretJSON();

  for (const sec of SECRET_FILES) {
    if (!sec.location) {
      continue;
    }

    const destFile = (() => {
      if (sec.name == 'app-store-key.p8') {
        return path.join(ROOT_DIR, sec.location, `AuthKey_${secretsJson.APPSTORE_API_KEY}.p8`);
      }
      return path.join(ROOT_DIR, sec.location, sec.name);
    })();

    console.info(`${sec.name} -> ${destFile}`);

    if (fs.existsSync(destFile)) {
      console.info('skip');
      continue;
    }

    if (!fs.existsSync(sec.location)) {
      fs.mkdirSync(sec.location);
    }

    fs.copyFileSync(path.join(SECRET_DIR, sec.name), destFile);
  }
};
