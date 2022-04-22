const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const packageData = require('../../package.json');

let create = (entries, tsConfig, outDir = '.') => {
  const tsConfigPath = path.resolve(tsConfig);
  const resolvedEntries = Object.entries(entries).reduce((acc, entry) => {
    acc[entry[0]] = path.resolve('./' + entry[1]);
    return acc;
  }, {});
  return {
    entry: resolvedEntries,
    mode: 'development',
    devtool: 'inline-source-map',
    target: 'web',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    infrastructureLogging: {
      level: 'log'
    },
    ignoreWarnings: [
      // suppress type re-export warnings caused by `transpileOnly: true`
      // See https://github.com/TypeStrong/ts-loader#transpileonly
      /export .* was not found in/
    ],
    resolve: {
      extensions: [ '.ts', '.js' ],
      plugins: [
        new TsConfigPathsPlugin({
          configFile: tsConfigPath,
          extensions: [ '.ts', '.js' ]
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
          test: /\.(js|mjs)$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        },
        {
          test: /\.(svg)$/i,
          type: 'asset/source'
        },
        {
          resourceQuery: /raw/,
          type: 'asset/source'
        },
        {
          test: /\.(js|mjs|ts)$/,
          use: [ '@ephox/swag/webpack/remapper' ]
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
                configFile: tsConfigPath,
                transpileOnly: true,
                projectReferences: true
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // See https://github.com/TypeStrong/ts-loader#usage-with-webpack-watch
      new webpack.WatchIgnorePlugin({
        paths: [
          // Ignore generated .js, .map and .d.ts output files
          /tinymce\/modules\/.*\/lib\/.*\.(js|map|d\.ts)$/,
          // Something seems to trigger that node module package.json files change when they
          // haven't, so lets just ignore them entirely
          /node_modules\/.*\/package\.json$/
        ]
      }),
    ],
    output: {
      filename: '[name]',
      path: path.resolve(outDir),
      pathinfo: false
    },
    stats: {
      assets: false,
      modulesSpace: 5
    }
  };
};

const buildDemoEntries = (typeNames, type, demo, pathPrefix = '') => typeNames.reduce(
  (acc, name) => {
    const tsfile = `src/${type}/${name}/demo/ts/demo/${demo}`;
    if (fs.existsSync(tsfile)) { acc[`${pathPrefix}${type}/${name}/demo.js`] = tsfile; }
    return acc;
  }, {}
);

const buildEntries = (typeNames, type, entry, pathPrefix = '') => typeNames.reduce(
  (acc, name) => {
    const fileName = type.replace(/s$/, '') + '.js';
    acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
    return acc;
  }, {}
);

const all = (plugins, themes, models) => {
  return [
    create({
      'scratch/demos/core/demo.js': 'src/core/demo/ts/demo/Demos.ts',
      'scratch/demos/core/cspdemo.js': 'src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts',
      ...buildDemoEntries(plugins, 'plugins', 'Demo.ts', 'scratch/demos/'),
      ...buildEntries(plugins, 'plugins', 'Main.ts', 'js/tinymce/'),
      ...buildDemoEntries(models, 'models', 'Demo.ts', 'scratch/demos/'),
      ...buildEntries(models, 'models', 'Main.ts', 'js/tinymce/'),
      ...buildDemoEntries(themes, 'themes', 'Demos.ts', 'scratch/demos/'),
      ...buildEntries(themes, 'themes', 'Main.ts', 'js/tinymce/'),
    }, '../../tsconfig.demo.json'),
    // Note: This can't use the demo tsconfig as it is the core package
    create({
      'js/tinymce/tinymce.js': 'src/core/main/ts/api/Main.ts'
    }, '../../tsconfig.json')
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
  all,
  generateDemoIndex
};
