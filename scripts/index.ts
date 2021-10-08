import { buildFunctions, buildFunctionsWatch } from './functions/build';
import { sh } from './sh';

type ScriptFunction = () => Promise<unknown>;
type ScriptInfo = { cmd?: string; func?: ScriptFunction; cwd?: string };

const commands: [string, string | ScriptInfo | string[]][] = [
  ['lint', 'eslint --ext .ts,.tsx src'],
  ['ts-check', 'tsc --noEmit'],

  ['functions.build', { func: buildFunctions }],
  ['functions.build.watch', { func: buildFunctionsWatch }],

  [
    'firebase.serve',
    {
      cmd: 'firebase emulators:start --import=./emu-data --export-on-exit',
      cwd: 'firebase',
    },
  ],
  ['firebase.start', ['functions.build.watch', 'firebase.serve']],

  ['shared-web.start', 'stencil build --dev --watch --config scripts/shared-web/stencil.config.ts'],

  [
    'console.start',
    'stencil build --dev --watch --serve --config scripts/console/stencil.config.ts',
  ],
  ['console.build', 'stencil build --config scripts/console/stencil.config.ts'],
];

const commandsMap = new Map(commands);

const exec = async (script: string | ScriptInfo | string[]) => {
  if (typeof script == 'string') {
    console.info(`> ${script}`);
    console.info();
    await sh(script);
    return;
  }

  if (Array.isArray(script)) {
    await Promise.all([
      script.map(v => {
        const s = commandsMap.get(v);
        if (!s) {
          throw new Error(`invalid command: ${v}`);
        }
        return exec(s);
      }),
    ]);
    return;
  }

  if (script.cmd) {
    console.info(`> ${script.cmd}`);
    console.info();
    await sh(script.cmd, script);
  } else if (script.func) {
    console.info();
    await script.func();
  } else {
    throw new Error();
  }
};

const main = async () => {
  const cmd = process.argv[2];
  if (!cmd) {
    throw 'no command';
  }

  const script = commandsMap.get(cmd);
  if (!script) {
    throw 'invalid command';
  }

  console.info(`> ${cmd}`);

  await exec(script);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
