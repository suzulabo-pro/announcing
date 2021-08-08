import replace from '@rollup/plugin-replace';
import { Config } from '@stencil/core';
import { OutputTargetWww } from '@stencil/core/internal';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://stenciljs.com/docs/config

declare const process: {
  env: {
    [key: string]: string;
  };
  argv: string[];
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

const isCapacitor = process.env['CAP_BUILD'] != null;
if (isCapacitor) {
  console.log('Capacitor Build');
}

const isDev = process.argv.includes('--dev');

const outputTargetWww: OutputTargetWww = isCapacitor
  ? { type: 'www', dir: 'cap', serviceWorker: null }
  : {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js',
        globPatterns: isDev ? ['index.html'] : ['**/*.{js,html}'],
      },
      dir: isDev ? 'www' : 'www-dist',
      copy: [
        { src: '../../../resources/icon192.png', dest: 'icon192.png' },
        { src: '../../../resources/icon180.png', dest: 'icon180.png' },
        { src: '../assetlinks.json', dest: '.well-known/assetlinks.json' },
        { src: '../apple-app-site-association', dest: '.well-known/apple-app-site-association' },
      ],
    };

export const config: Config = {
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [outputTargetWww],
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
    after: [
      nodePolyfills({
        include: '../../node_modules/**/*.js',
      }),
    ],
  },
  devServer: {
    openBrowser: false,
    port: 3371,
  },
};
