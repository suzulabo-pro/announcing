import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: 'announcing-shared-ui',
  taskQueue: 'async',
  outputTargets: [
    { type: 'dist' },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
  plugins: [sass({})],
  devServer: {
    openBrowser: false,
  },
};
