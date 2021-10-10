import { startDevProxy } from './dev-proxy/dev-proxy';
import { buildFunctions, buildFunctionsWatch } from './functions/build';
import { ParallelRun, runScript, ScriptEntries, SequentialRun } from './scripts';
import { copySecrets } from './secrets/copy';

const entries: ScriptEntries = [
  // checking
  ['lint', 'eslint --ext .ts,.tsx src'],
  ['ts-check', 'tsc --noEmit'],

  // functions
  ['functions.build', buildFunctions],
  ['functions.build.watch', buildFunctionsWatch],

  // firebase
  [
    'firebase.serve',
    {
      cmd: 'firebase emulators:start --import=./emu-data --export-on-exit',
      cwd: 'firebase',
    },
  ],
  ['firebase.start', new ParallelRun(['functions.build.watch', 'firebase.serve'])],
  ['firebase.docs', { cmd: 'docsify serve docs', cwd: 'firebase' }],

  [
    'firebase.deploy',
    new SequentialRun([
      'lint',
      'functions.build',
      'console.build',
      'client.build',
      'ts-check',
      { cmd: 'cp -a dist/console/www-dist firebase/console' },
      { cmd: 'cp -a dist/client/www-dist firebase/client' },
      { cmd: 'firebase deploy --force' },
    ]),
  ],

  // console
  [
    'console.start',
    'stencil build --dev --watch --serve --config scripts/console/stencil.config.ts',
  ],
  ['console.build', 'stencil build --config scripts/console/stencil.config.ts'],

  // client
  ['client.start', 'stencil build --dev --watch --serve --config scripts/client/stencil.config.ts'],
  ['client.build', 'stencil build --config scripts/client/stencil.config.ts'],

  // client capacitor
  ['client.cap.build', 'CAP_BUILD=y stencil build --config scripts/client/stencil.config.ts'],
  [
    'client.cap.build.dev',
    'CAP_BUILD=y stencil build --dev --config scripts/client/stencil.config.ts',
  ],
  [
    'client.cap.sync',
    {
      cmd: 'cap sync',
      cwd: 'capacitor/client',
    },
  ],
  [
    'client.cap.copy',
    {
      cmd: 'cap copy',
      cwd: 'capacitor/client',
    },
  ],

  ['secrets.copy', copySecrets],

  // dev-proxy
  ['dev-proxy.start', startDevProxy],

  // utilities
  [
    'ios.openurl',
    {
      cmd: 'xcrun simctl openurl booted',
    },
  ],
];

const main = async () => {
  const name = process.argv[2];
  if (!name) {
    throw 'no script';
  }

  const args = process.argv.slice(3);

  await runScript(entries, name, args);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
