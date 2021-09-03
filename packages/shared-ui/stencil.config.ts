import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: 'announcing-shared-ui',
  taskQueue: 'async',
  outputTargets: [{ type: 'dist' }],
  plugins: [sass({})],
  rollupPlugins: {
    after: [
      // https://github.com/ionic-team/rollup-plugin-node-polyfills/issues/17
      nodePolyfills({
        include: '../../node_modules/**/*.js',
      }),
    ],
  },
  devServer: {
    openBrowser: false,
  },
};
