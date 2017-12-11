const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader')
const path = require('path');

module.exports = {
  entry: {
    latin: './src/demo/ts/ephox/phoenix/demo/LatinDemo.ts',
    reuse: './src/demo/ts/ephox/phoenix/demo/ReuseDemo.ts',
    search: './src/demo/ts/ephox/phoenix/demo/SearchDemo.ts'
  },
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsConfigPathsPlugin({
        baseUrl: '.',
        compiler: 'typescript'
      }),
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },

      {
        test: /\.ts$/,
        use: ['awesome-typescript-loader']
      }
    ]
  },

  plugins: [
    new CheckerPlugin()
  ],

  output: {
    filename: '[name]-demo.js',
    path: path.resolve(__dirname, './scratch/compiled')
  }
};