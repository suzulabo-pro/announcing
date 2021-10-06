require('esbuild')
  .build({
    entryPoints: ['src/functions/index.ts'],
    outfile: 'firebase/functions/dist/bundle.js',
    bundle: true,
    platform: 'node',
    target: ['node14'],
    sourcemap: 'inline',
    external: ['firebase-functions'],
  })
  .catch(() => process.exit(1));
