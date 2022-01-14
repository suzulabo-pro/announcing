/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: 'test',
  testRegex: '.+\\.test\\.tsx?$',
  resolver: 'jest-node-exports-resolver',
  transform: {
    '^.+\\.tsx?$': ['esbuild-jest', { sourcemap: true }],
  },
};
