// @ts-check

let { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
let LiveReloadPlugin = require('webpack-livereload-plugin');
let path = require('path');
let fs = require('fs');

let create = (entries, tsConfig, outDir, filename) => {
  return {
    entry: entries,
    mode: 'development',
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
          use: [
            'source-map-loader'
          ],
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
      new LiveReloadPlugin()
    ],
    output: {
      filename: typeof entries === 'string' ? filename : "[name]/" + filename,
      path: path.resolve(outDir)
    }
  };
};

let buildDemoEntries = (pluginNames, type, demo) => pluginNames.reduce(
  (acc, name) => {
    acc[name] = `src/${type}/${name}/demo/ts/demo/${demo}`;
    return acc;
  }, {}
)

let buildEntries = (pluginNames, type, entry) => pluginNames.reduce(
  (acc, name) => {
    acc[name] = `src/${type}/${name}/main/ts/${entry}`;
    return acc;
  }, {}
)

let createPlugin = (name) => {
  return create(`src/plugins/${name}/demo/ts/demo/Demo.ts`, 'tsconfig.plugin.json', `scratch/demos/plugins/${name}/`, 'demo.js');
};

let createTheme = (name) => {
  return create(`src/themes/${name}/demo/ts/demo/Demos.ts`, 'tsconfig.theme.json', `scratch/demos/themes/${name}`, 'demo.js');
};

let allPluginDemos = (plugins) => {
  return create(buildDemoEntries(plugins, 'plugins', 'Demo.ts'), 'tsconfig.plugin.json', 'scratch/demos/plugins', 'demo.js')
}

let allThemeDemos = (themes) => {
  return create(buildDemoEntries(themes, 'themes', 'Demos.ts'), 'tsconfig.theme.json', 'scratch/demos/themes', 'demo.js')
}

let all = (plugins, themes) => {
  return [
    allPluginDemos(plugins),
    allThemeDemos(themes),
    create(`src/core/demo/ts/demo/Demos.ts`, 'tsconfig.json', 'scratch/demos/core/', 'demo.js'),
    create('src/core/main/ts/api/Main.ts', 'tsconfig.json', 'js/tinymce/', 'tinymce.js'),
    create(buildEntries(plugins, 'plugins', 'Plugin.ts'), 'tsconfig.plugin.json', 'js/tinymce/plugins', 'plugin.js'),
    create(buildEntries(themes, 'themes', 'Theme.ts'), 'tsconfig.theme.json', 'js/tinymce/themes', 'theme.js')
  ];
}

let generateDemoIndex = (grunt, app, plugins, themes) => {
  let demoList = grunt.file.expand(['src/**/demo/html/*.html'])
  let sortedDemos = demoList.reduce((acc, link) => {
    const type = link.split('/')[1];

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(link)

    return acc;
  }, {})

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
  `

  app.get('/', (req, res) => res.send(html))
}

module.exports = {
  createPlugin,
  createTheme,
  create,
  all,
  allPluginDemos,
  allThemeDemos,
  generateDemoIndex
};
