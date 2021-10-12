import * as fs from 'fs';
import JSZip from 'jszip';
import * as path from 'path';
import { SECRET_DIR, SECRET_FILES } from './config';

export const unpackSecrets = async () => {
  const secretValues = process.env['SECRET_VALUES'];
  if (!secretValues) {
    throw 'missing SECRET_VALUES';
  }

  const zip = new JSZip();
  await zip.loadAsync(secretValues, { base64: true });

  if (!fs.existsSync(SECRET_DIR)) {
    fs.mkdirSync(SECRET_DIR);
  }

  for (const sec of SECRET_FILES) {
    const f = zip.file(sec.name);
    if (!f) {
      throw `missing ${sec.name}`;
    }

    const filename = path.join(SECRET_DIR, sec.name);
    const data = await f.async('nodebuffer');
    if (fs.existsSync(filename)) {
      const cur = fs.readFileSync(filename);
      console.warn(`${sec.name} already exist (${data.equals(cur) ? 'same' : 'updated'})`);
      continue;
    }

    console.info(`unpack: ${sec.name}`);
    fs.writeFileSync(filename, data);
  }
};
