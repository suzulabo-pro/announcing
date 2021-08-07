const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.build.json',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [
    nodeExternals({
      additionalModuleDirs: [path.resolve(__dirname, '../../node_modules')],
      allowlist: ['@announcing/shared'],
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
