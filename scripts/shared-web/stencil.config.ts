import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import * as path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));

export const config: Config = {
  namespace: 'announcing-shared-ui',
  srcDir: `${ROOT_DIR}/src/shared-web`,
  taskQueue: 'async',
  outputTargets: [],
  plugins: [sass({})],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
};
