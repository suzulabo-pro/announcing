import * as path from 'path';
import analyzeTsConfig from 'ts-unused-exports';
import camelcase from 'camelcase';

const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
const TSCONFIG_JSON_PATH = path.join(ROOT_DIR, 'tsconfig.json');

const allows: Record<string, string[]> = {
  'components.d.ts': ['Components', 'JSX'],
  'stencil.config.ts': ['config'],
  'capacitor.config.ts': ['default'],
  'functions/index.ts': ['httpsCall', 'httpsRequest', 'firestore', 'pubsub'],
};

const matchAllows = (f: string) => {
  for (const [s, l] of Object.entries(allows)) {
    if (f.endsWith(s)) {
      return l;
    }
  }
  return [];
};

export const checkUnusedExports = () => {
  const result = analyzeTsConfig(TSCONFIG_JSON_PATH);

  for (const [f, list] of Object.entries(result)) {
    const p = path.parse(f);
    const allow = matchAllows(f);
    if (p.ext == '.tsx') {
      allow.push(camelcase(p.name, { pascalCase: true }));
    }
    const relPath = path.relative(ROOT_DIR, f);
    let printed = false;
    const printPath = () => {
      if (!printed) {
        console.info(`${relPath}:`);
        printed = true;
      }
    };
    for (const info of list) {
      if (allow?.includes(info.exportName)) {
        //printPath();
        //console.debug(`  allow: ${info.exportName}`);
        continue;
      }
      printPath();
      console.info(`  ${info.exportName}`);
    }
  }
};
