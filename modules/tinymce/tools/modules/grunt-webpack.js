const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');
const fs = require('fs');

const packageData = require("../../package.json");

let create = (entries, tsConfig, outDir, filename) => {
  return {
    entry: entries,
    mode: 'development',
    devtool: 'source-map',
    target: ['web', 'es5'],
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    resolve: {
      symlinks: false,
      extensions: ['.ts', '.js'],
      plugins: [
        new TsConfigPathsPlugin({
          configFile: tsConfig,
          extensions: ['.ts', '.js']
        })
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
          test: /\.(svg)$/i,
          type: 'asset/source'
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'string-replace-loader',
              options: {
                test: /EditorManager.ts/,
                multiple: [
                  {
                    search: '@@majorVersion@@',
                    replace: packageData.version.split('.')[0],
                  },
                  {
                    search: '@@minorVersion@@',
                    replace: packageData.version.split('.').slice(1).join('.'),
                  },
                  {
                    search: '@@releaseDate@@',
                    replace: packageData.date,
                  }
                ]
              }
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                compilerOptions: {
                  declarationMap: false
                },
                configFile: tsConfig,
                projectReferences: true
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new LiveReloadPlugin()
    ],
    output: {
      filename: typeof entries === 'string' ? filename : "[name]/" + filename,
      path: path.resolve(outDir),
      pathinfo: false
    }
  };
};

const buildDemoEntries = (typeNames, type, demo) => typeNames.reduce(
  (acc, name) => {
    const tsfile = `src/${type}/${name}/demo/ts/demo/${demo}`;
    if (fs.existsSync(tsfile)) { acc[name] = tsfile; }
    return acc;
  }, {}
);

const buildEntries = (typeNames, type, entry) => typeNames.reduce(
  (acc, name) => {
    acc[name] = `src/${type}/${name}/main/ts/${entry}`;
    return acc;
  }, {}
);

const createPlugin = (name) => {
  return create(`src/plugins/${name}/demo/ts/demo/Demo.ts`, 'tsconfig.plugin.json', `scratch/demos/plugins/${name}/`, 'demo.js');
};

const createTheme = (name) => {
  return create(`src/themes/${name}/demo/ts/demo/Demos.ts`, 'tsconfig.theme.json', `scratch/demos/themes/${name}`, 'demo.js');
};

const createModel = (name) => {
  return create(`src/models/${name}/demo/ts/demo/Demo.ts`, 'tsconfig.model.json', `scratch/demos/models/${name}`, 'demo.js');
};

const allPluginDemos = (plugins) => {
  return create(buildDemoEntries(plugins, 'plugins', 'Demo.ts'), 'tsconfig.plugin.json', 'scratch/demos/plugins', 'demo.js')
};

const allThemeDemos = (themes) => {
  return create(buildDemoEntries(themes, 'themes', 'Demos.ts'), 'tsconfig.theme.json', 'scratch/demos/themes', 'demo.js')
};

const allModelDemos = (models) => {
  return create(buildDemoEntries(models, 'models', 'Demo.ts'), 'tsconfig.model.json', 'scratch/demos/models', 'demo.js')
};

const all = (plugins, themes, models) => {
  return [
    allPluginDemos(plugins),
    allThemeDemos(themes),
    allModelDemos(models),
    create(`src/core/demo/ts/demo/Demos.ts`, 'tsconfig.json', 'scratch/demos/core/', 'demo.js'),
    create('src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts', 'tsconfig.json', 'scratch/demos/core/', 'cspdemo.js'),
    create('src/core/main/ts/api/Main.ts', 'tsconfig.json', 'js/tinymce/', 'tinymce.js'),
    create(buildEntries(plugins, 'plugins', 'Main.ts'), 'tsconfig.plugin.json', 'js/tinymce/plugins', 'plugin.js'),
    create(buildEntries(themes, 'themes', 'Main.ts'), 'tsconfig.theme.json', 'js/tinymce/themes', 'theme.js'),
    create(buildEntries(models, 'models', 'Main.ts'), 'tsconfig.model.json', 'js/tinymce/models', 'model.js')
  ];
};

const generateDemoIndex = (grunt, app, plugins, themes, models) => {
  const demoList = grunt.file.expand(['src/**/demo/html/*.html', 'src/**/demo/html/**/*.html']);
  const sortedDemos = demoList.reduce((acc, link) => {
    const type = link.split('/')[1];

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(link);

    return acc;
  }, {});

  const lists = Object.keys(sortedDemos).map(
    type => `
    <h2>${type}</h2>
    <ul>
      ${sortedDemos[type].map(
      link => `<li>${type !== 'core' ? `<strong>${link.split('/')[2]}</strong> - ` : ''}<a href="${link}">${path.basename(link)}</a></li>`).join('')
    }
    </ul>`
  ).join('');
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Demos</title>
  </head>
  <body>
    ${lists}
  </body>
  </html>
  `;

  app.get('/', (req, res) => res.send(html))
};

module.exports = {
  createPlugin,
  createTheme,
  createModel,
  create,
  all,
  allPluginDemos,
  allThemeDemos,
  allModelDemos,
  generateDemoIndex
};
