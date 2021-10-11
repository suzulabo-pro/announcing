import { startDevProxy } from './dev-proxy/dev-proxy';
import { buildFunctions, buildFunctionsWatch } from './functions/build';
import { Cmd, ParallelRun, runScript, ScriptEntries, SequentialRun } from './scripts';
import { copySecrets } from './secrets/copy';
import { packSecrets } from './secrets/pack';
import { unpackSecrets } from './secrets/unpack';

const entries: ScriptEntries = [
  // hello
  ['hello', Cmd('echo hello')],

  // checking
  ['lint', Cmd('eslint --ext .ts,.tsx src')],
  ['ts-check', Cmd('tsc --noEmit')],

  // functions
  ['functions.build', buildFunctions],
  ['functions.build.watch', buildFunctionsWatch],

  // firebase
  [
    'firebase.serve',
    Cmd('firebase emulators:start --import=./emu-data --export-on-exit', 'firebase'),
  ],
  ['firebase.start', new ParallelRun(['functions.build.watch', 'firebase.serve'])],
  ['firebase.docs', Cmd('docsify serve docs', 'firebase')],

  [
    'firebase.deploy',
    new SequentialRun([
      'lint',
      'functions.build',
      'console.build',
      'client.build',
      'ts-check',
      Cmd('cp -a dist/console/www-dist firebase/console'),
      Cmd('cp -a dist/client/www-dist firebase/client'),
      Cmd('firebase deploy', 'firebase'),
    ]),
  ],

  // console
  [
    'console.start',
    Cmd('stencil build --dev --watch --serve --config scripts/console/stencil.config.ts'),
  ],
  ['console.build', Cmd('stencil build --config scripts/console/stencil.config.ts')],

  // client
  [
    'client.start',
    Cmd('stencil build --dev --watch --serve --config scripts/client/stencil.config.ts'),
  ],
  ['client.build', Cmd('stencil build --config scripts/client/stencil.config.ts')],

  // client capacitor
  ['client.cap.build', Cmd('CAP_BUILD=y stencil build --config scripts/client/stencil.config.ts')],
  [
    'client.cap.build.dev',
    Cmd('CAP_BUILD=y stencil build --dev --config scripts/client/stencil.config.ts'),
  ],
  ['client.cap.sync', Cmd('cap sync', 'capacitor/client')],
  ['client.cap.copy', Cmd('cap copy', 'capacitor/client')],
  ['client.cap.dev.update', new SequentialRun(['client.cap.build.dev', 'client.cap.copy'])],

  // secrets
  ['secrets.copy', copySecrets],
  ['secrets.pack', packSecrets],
  ['secrets.unpack', unpackSecrets],

  // dev-proxy
  ['dev-proxy.start', startDevProxy],

  // utilities
  ['android.open', Cmd('cap open android', 'capacitor/client')],
  ['ios.open', Cmd('cap open ios', 'capacitor/client')],
  ['ios.openurl', Cmd('xcrun simctl openurl booted')],
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
