import * as fs from 'fs';
import * as path from 'path';
import { ROOT_DIR, SECRET_DIR, SECRET_FILES } from './constants';

export const copySecrets = () => {
  for (const [src, dest] of SECRET_FILES) {
    console.info(`${src} -> ${dest}`);
    fs.copyFileSync(path.join(SECRET_DIR, src), path.join(ROOT_DIR, dest));
  }
};
