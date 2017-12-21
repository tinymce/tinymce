const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader')
const path = require('path');

module.exports = {
  entry: {
    picker: './src/demo/ts/ephox/snooker/demo/PickerDemo.ts',
    pickerRtl: './src/demo/ts/ephox/snooker/demo/PickerDemoRtl.ts',
    detect: './src/demo/ts/ephox/snooker/demo/DetectDemo.ts',
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