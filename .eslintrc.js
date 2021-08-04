module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        project: ['tsconfig.json', '*/**/tsconfig.json'],
      },
      settings: {
        react: {
          version: '17.0.1',
        },
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@stencil/recommended',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        '@stencil/decorators-style': 'off',
        '@stencil/required-jsdoc': 'off',
        '@stencil/strict-boolean-conditions': 'off',
        '@typescript-eslint/no-floating-promises': 'error',

        'require-await': 'off',
        '@typescript-eslint/require-await': 'warn',
      },
    },
  ],
};
