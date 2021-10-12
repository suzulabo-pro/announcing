import * as fs from 'fs';
import * as path from 'path';
import { ROOT_DIR, SECRET_DIR, SECRET_FILES } from './config';

export const copySecrets = () => {
  for (const sec of SECRET_FILES) {
    if (!sec.location) {
      continue;
    }
    console.info(`${sec.name} -> ${sec.location}/${sec.name}`);
    fs.copyFileSync(path.join(SECRET_DIR, sec.name), path.join(ROOT_DIR, sec.location, sec.name));
  }
};
