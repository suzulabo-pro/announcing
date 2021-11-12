import * as fs from 'fs';
import * as path from 'path';
import { ROOT_DIR, SECRET_DIR, SECRET_FILES } from './config';

export const copySecrets = () => {
  for (const sec of SECRET_FILES) {
    if (!sec.location) {
      continue;
    }

    const destFile = path.join(ROOT_DIR, sec.location, sec.name);

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
