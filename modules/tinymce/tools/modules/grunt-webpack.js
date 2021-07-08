let { TsConfigPathsPlugin } = require('awesome-typescript-loader');
let LiveReloadPlugin = require('webpack-livereload-plugin');
let path = require('path');
let fs = require('fs');

const packageData = require("../../package.json");

let create = (entries, tsConfig, outDir, filename) => {
  return {
    entry: entries,
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    resolve: {
      symlinks: false,
      extensions: ['.ts', '.js'],
      plugins: [
        // We need to use the awesome typescript loader config paths since the one for ts-loader doesn't resolve aliases correctly
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
                experimentalWatchApi: true
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

let buildDemoEntries = (pluginNames, type, demo) => pluginNames.reduce(
  (acc, name) => {
    var tsfile = `src/${type}/${name}/demo/ts/demo/${demo}`;
    if (fs.existsSync(tsfile)) { acc[name] = tsfile; }
    return acc;
  }, {}
);

let buildEntries = (pluginNames, type, entry) => pluginNames.reduce(
  (acc, name) => {
    acc[name] = `src/${type}/${name}/main/ts/${entry}`;
    return acc;
  }, {}
);

let createPlugin = (name) => {
  return create(`src/plugins/${name}/demo/ts/demo/Demo.ts`, 'tsconfig.plugin.json', `scratch/demos/plugins/${name}/`, 'demo.js');
};

let createTheme = (name) => {
  return create(`src/themes/${name}/demo/ts/demo/Demos.ts`, 'tsconfig.theme.json', `scratch/demos/themes/${name}`, 'demo.js');
};

let allPluginDemos = (plugins) => {
  return create(buildDemoEntries(plugins, 'plugins', 'Demo.ts'), 'tsconfig.plugin.json', 'scratch/demos/plugins', 'demo.js')
};

let allThemeDemos = (themes) => {
  return create(buildDemoEntries(themes, 'themes', 'Demos.ts'), 'tsconfig.theme.json', 'scratch/demos/themes', 'demo.js')
};

let all = (plugins, themes) => {
  return [
    allPluginDemos(plugins),
    allThemeDemos(themes),
    create(`src/core/demo/ts/demo/Demos.ts`, 'tsconfig.json', 'scratch/demos/core/', 'demo.js'),
    create('src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts', 'tsconfig.json', 'scratch/demos/core/', 'cspdemo.js'),
    create('src/core/main/ts/api/Main.ts', 'tsconfig.json', 'js/tinymce/', 'tinymce.js'),
    create(buildEntries(plugins, 'plugins', 'Main.ts'), 'tsconfig.plugin.json', 'js/tinymce/plugins', 'plugin.js'),
    create(buildEntries(themes, 'themes', 'Main.ts'), 'tsconfig.theme.json', 'js/tinymce/themes', 'theme.js')
  ];
};

let generateDemoIndex = (grunt, app, plugins, themes) => {
  let demoList = grunt.file.expand(['src/**/demo/html/*.html', 'src/**/demo/html/**/*.html']);
  let sortedDemos = demoList.reduce((acc, link) => {
    const type = link.split('/')[1];

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(link);

    return acc;
  }, {});

  let lists = Object.keys(sortedDemos).map(
    type => `
    <h2>${type}</h2>
    <ul>
      ${sortedDemos[type].map(
        link => `<li>${type !== 'core' ? `<strong>${link.split('/')[2]}</strong> - ` : ''}<a href="${link}">${path.basename(link)}</a></li>`).join('')
      }
    </ul>`
  ).join('');
  let html = `
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
  create,
  all,
  allPluginDemos,
  allThemeDemos,
  generateDemoIndex
};
