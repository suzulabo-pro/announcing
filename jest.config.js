/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transform: {
    '^.+\\.tsx?$': ['esbuild-jest', { sourcemap: true }],
  },
  rootDir: 'test',
  testRegex: '.+\\.test\\.tsx?$',
  resolver: 'jest-node-exports-resolver',
};
