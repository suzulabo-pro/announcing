import * as path from 'path';
import { build } from 'esbuild';

const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));

build({
  entryPoints: [`${ROOT_DIR}/src/functions/index.ts`],
  outfile: `${ROOT_DIR}/firebase/functions/dist/bundle.js`,
  bundle: true,
  platform: 'node',
  target: ['node14'],
  sourcemap: 'inline',
  external: ['firebase-functions'],
}).catch(err => {
  console.error(err);
  process.exit(1);
});
