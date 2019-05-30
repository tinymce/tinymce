const path = require('path');
const inFile = './src/demo/ts/Demo.ts';
const outFile = './scratch/compiles/demo.js';

module.exports = {
  entry: inFile,
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  resolve: {
    symlinks: false,
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  output: {
    filename: path.basename(outFile),
    path: path.resolve(path.dirname(outFile)),
    pathinfo: false
  }
};