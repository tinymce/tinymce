// @ts-check

let { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
let LiveReloadPlugin = require('webpack-livereload-plugin');
let path = require('path');

let create = (name, tsConfig, inputTsFile, outFile) => {
  console.log(`creating ${name} webpack config`)
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

let createMany = (entries, tsConfig, outDir) => {
  return {
    watch: true,
    entry: entries,
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
      filename: "[name]/demo.js",
      path: path.resolve(outDir)
    }
  };
};

let buildEntries = (pluginNames, type, demo) => pluginNames.reduce(
  (acc, name) => {
    acc[name] = `src/${type}/${name}/demo/ts/demo/${demo}`;
    return acc;
  }, {}
)

let createPlugin = (name) => {
  return create(name, 'tsconfig.plugin.json', `src/plugins/${name}/demo/ts/demo/Demo.ts`, `scratch/demos/plugins/${name}/demo.js`);
};

let createTheme = (name) => {
  return create(name, 'tsconfig.theme.json', `src/themes/${name}/demo/ts/demo/Demos.ts`, `scratch/demos/themes/${name}/demo.js`);
};

let allPlugins = (plugins) => {
  return createMany(buildEntries(plugins, 'plugins', 'Demo.ts'), 'tsconfig.plugin.json', 'scratch/demos/plugins')
}

let allThemes = (themes) => {
  return createMany(buildEntries(themes, 'themes', 'Demos.ts'), 'tsconfig.theme.json', 'scratch/demos/themes')
}

module.exports = {
  createPlugin,
  createTheme,
  create,
  allPlugins,
  allThemes
};
