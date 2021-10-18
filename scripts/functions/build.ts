import { build, Plugin } from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import rootPackageJSON from '../../package.json';

const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
const FUNCTIONS_DIR = path.join(ROOT_DIR, 'firebase', 'functions');

const packageAlias = new Map([
  ['crypto', undefined],
  ['firebase-functions/lib/logger/compat', 'firebase-functions'],
  ['source-map-support/register', 'source-map-support'],
]);
const importedDefault = ['date-fns'];

const _buildFunctions = async (watch: boolean) => {
  const imported = new Set<string>(importedDefault);

  const externalPackagesPlugin: Plugin = {
    name: 'nodeExternal',
    setup(build) {
      build.onResolve({ filter: new RegExp('^[^.]') }, args => {
        if (packageAlias.has(args.path)) {
          const s = packageAlias.get(args.path);
          if (s) {
            imported.add(s);
          }
        } else {
          imported.add(args.path);
        }
        return { external: true };
      });
    },
  };

  await build({
    entryPoints: [`src/functions/index.ts`],
    outfile: `${FUNCTIONS_DIR}/dist/bundle.js`,
    bundle: true,
    treeShaking: true,
    watch: watch
      ? {
          onRebuild: error => {
            if (error) {
              console.error(error);
            } else {
              console.info('build succeeded');
            }
          },
        }
      : false,
    platform: 'node',
    target: ['node14'],
    sourcemap: 'inline',
    plugins: [externalPackagesPlugin],
  });

  if (watch) {
    return;
  }

  // generate package.json
  const sorted = [...imported].sort();

  const rootDependencies = rootPackageJSON.dependencies as { [k: string]: string };

  const packageJSON = {
    name: 'announcing-functions',
    engines: {
      node: '14',
    },
    main: 'dist/bundle.js',

    dependencies: Object.fromEntries(
      sorted.map(k => {
        const v = rootDependencies[k];
        if (!v) {
          throw `missing dependencies: ${k}`;
        }
        return [k, v];
      }),
    ),
  };

  const json = JSON.stringify(packageJSON, undefined, 2);
  console.log(json);

  fs.writeFileSync(`${FUNCTIONS_DIR}/package.json`, json);
};

export const buildFunctions = () => {
  return _buildFunctions(false);
};
export const buildFunctionsWatch = () => {
  return _buildFunctions(true);
};
