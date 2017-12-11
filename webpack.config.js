const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader')
const path = require('path');

module.exports = {
  entry: './src/demo/ts/ephox/robin/demo/WordSelectDemo.ts',
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
    filename: 'demo.js',
    path: path.resolve(__dirname, './scratch/compiled')
  }
};