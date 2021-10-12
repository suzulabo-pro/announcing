import * as fs from 'fs';
import JSZip from 'jszip';
import * as path from 'path';
import { SECRET_DIR, SECRET_FILES } from './config';

export const packSecrets = async () => {
  const zip = new JSZip();

  for (const sec of SECRET_FILES) {
    zip.file(sec.name, fs.createReadStream(path.join(SECRET_DIR, sec.name)));
  }

  const packed = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  fs.writeFileSync(path.join(SECRET_DIR, 'SECRET_VALUES.txt'), packed);
};
