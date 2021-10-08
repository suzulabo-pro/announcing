import { sh } from './sh';

const commands: [string, string][] = [
  ['lint', 'eslint --ext .ts,.tsx src'],
  ['ts-check', 'tsc --noEmit'],
  ['shared-web.start', 'stencil build --dev --watch --config scripts/shared-web/stencil.config.ts'],
  [
    'console.start',
    'stencil build --dev --watch --serve --config scripts/console/stencil.config.ts',
  ],
  ['console.build', 'stencil build --config scripts/console/stencil.config.ts'],
];

const commandsMap = new Map(commands);

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
  console.info(`> ${script}`);
  console.info();
  await sh(script);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
