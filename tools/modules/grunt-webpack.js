let { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
let LiveReloadPlugin = require('webpack-livereload-plugin');
let path = require('path');

let create = (name, tsConfig, inputTsFile, outFile) => {
  return {
    watch: true,
    entry: inputTsFile,
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsConfigPathsPlugin({
          baseUrl: '.',
          compiler: 'typescript',
          configFileName: tsConfig
        })
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
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                transpileOnly: true,
                configFileName: tsConfig
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new LiveReloadPlugin(),
      new CheckerPlugin()
    ],
    output: {
      filename: path.basename(outFile),
      path: path.resolve(path.dirname(outFile))
    }
  };
};

let createPlugin = (name) => {
  return create(name, 'tsconfig.plugin.json', `src/plugins/${name}/demo/ts/demo/Demo.ts`, `scratch/demos/plugins/${name}/demo.js`);
};

let createTheme = (name) => {
  return create(name, 'tsconfig.theme.json', `src/themes/${name}/demo/ts/demo/Demos.ts`, `scratch/demos/themes/${name}/demo.js`);
};

module.exports = {
  createPlugin,
  createTheme,
  create
};
