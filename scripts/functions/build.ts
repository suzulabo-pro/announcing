import { build } from 'esbuild';

const _buildFunctions = async (watch: boolean) => {
  return build({
    entryPoints: [`src/functions/index.ts`],
    outfile: `firebase/functions/dist/bundle.js`,
    bundle: true,
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
    external: ['firebase-functions'],
  });
};

export const buildFunctions = () => {
  return _buildFunctions(false);
};
export const buildFunctionsWatch = () => {
  return _buildFunctions(true);
};
