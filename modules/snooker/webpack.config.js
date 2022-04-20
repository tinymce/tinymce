const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    detect: './src/demo/ts/ephox/snooker/demo/DetectDemo.ts',
  },
  devtool: 'source-map',
  mode: 'development',
  target: ['web'],

  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsConfigPathsPlugin({
        extensions: ['.ts', '.js']
      }),
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false
        }
      },

      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },

      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            projectReferences: true
          }
        }]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({ async: true })
  ],

  output: {
    filename: '[name]-demo.js',
    path: path.resolve(__dirname, './scratch/compiled')
  }
};
