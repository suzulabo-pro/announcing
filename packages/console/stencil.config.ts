import replace from '@rollup/plugin-replace';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://stenciljs.com/docs/config

declare const process: {
  env: {
    [key: string]: string;
  };
};

const buildSrc = () => {
  {
    // GitHub Actions
    const sha = process.env['GITHUB_SHA'];
    const ref = process.env['GITHUB_REF'];
    if (sha && ref) {
      return `${ref.split('/').pop()}/${sha.substr(0, 7)}`;
    }
  }
  return 'local build';
};

const buildRepo = () => {
  {
    // GitHub Actions
    const server = process.env['GITHUB_SERVER_URL'];
    const repo = process.env['GITHUB_REPOSITORY'];
    if (server && repo) {
      return `${server}/${repo}`;
    }
  }
  return 'local build';
};

export const config: Config = {
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: '../../icon192.png', dest: 'icon192.png' },
        { src: '../../icon180.png', dest: 'icon180.png' },
      ],
    },
  ],
  plugins: [
    sass({}),
    replace({
      __BUILD_SRC__: buildSrc(),
      __BUILD_REPO__: buildRepo(),
      __BUILT_TIME__: new Date().getTime().toString(),
      preventAssignment: true,
    }),
  ],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
  devServer: {
    openBrowser: false,
    port: 3370,
  },
};
