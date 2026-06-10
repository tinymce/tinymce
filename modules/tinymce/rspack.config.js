const path = require("path");
const fs = require("fs");
const fg = require("fast-glob");
const packageData = require("./package.json");
const { TsCheckerRspackPlugin } = require('ts-checker-rspack-plugin');

const escapeHtml = (str) => str.replace(/[&<>"']/g, (m) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[m]);

const generateDemoIndex = (app) => {
  const demoList = fg.sync(['src/**/demo/html/*.html', 'src/**/demo/html/**/*.html'], { cwd: __dirname });
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
      ${sortedDemos[type].map(link => `<li>${type !== 'core' ? `<strong>${escapeHtml(link.split('/')[2])}</strong> - ` : ''}<a href="${escapeHtml(link)}">${escapeHtml(path.basename(link))}</a></li>`).join('')
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

  app.get('/', (_, res) => res.send(html))
};

function create(entries, tsConfig, outDir = ".") {
  const resolvedEntries = Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, path.resolve(__dirname, v)]));
  return {
    context: __dirname,
    entry: resolvedEntries,
    mode: "development",
    devtool: "inline-source-map",
    target: "web",
    plugins: [
      new TsCheckerRspackPlugin({
        async: true,
        devServer: true,
        typescript: {
          build: true,
          configFile: path.resolve(tsConfig),
        }
      })
    ],
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    infrastructureLogging: { level: "log" },
    ignoreWarnings: [/export .* was not found in/],

    resolve: {
      conditionNames: [ 'tiny:source', '...' ],
      extensions: [".ts", ".js"],
      tsConfig: {
        configFile: path.resolve(tsConfig),
        references: "auto",
      },
    },
    watchOptions: {
      ignored: ["**/node_modules/**"]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          resolve: { fullySpecified: false },
        },
        { test: /\.(js|mjs)$/, use: ["source-map-loader"], enforce: "pre" },
        { test: /\.svg$/i, type: "asset/source" },
        { resourceQuery: /raw/, type: "asset/source" },
        {
          test: /\.ts$/,
          use: [
            {
              loader: "string-replace-loader",
              options: {
                test: /EditorManager.ts/,
                multiple: [
                  {
                    search: "@@majorVersion@@",
                    replace: packageData.version.split(".")[0],
                  },
                  {
                    search: "@@minorVersion@@",
                    replace: packageData.version.split(".").slice(1).join("."),
                  },
                  { search: "@@releaseDate@@", replace: packageData.date },
                ],
              },
            },
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: { syntax: "typescript" },
                  target: 'es2022',
                },
                sourceMaps: true
              },
            },
          ],
        },
      ],
    },

    output: {
      filename: "[name]",
      path: path.resolve(outDir),
      publicPath: "/",
    },

    stats: {
      assets: false,
      modulesSpace: 5,
    }
  };
}

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

function findDemos(baseDir, type, demoFile) {
  const typeDir = path.resolve(baseDir, 'src', type);
  return fs.readdirSync(typeDir).filter(name => {
    const demoPath = path.resolve(typeDir, name, 'demo/ts/demo', demoFile);
    return fs.existsSync(demoPath);
  });
}

const plugins = findDemos(__dirname, "plugins", "Demo.ts");
const themes = findDemos(__dirname, "themes", "Demos.ts");
const models = findDemos(__dirname, "models", "Demo.ts");

const config = [
  create(
    {
      "scratch/demos/core/demo.js": "src/core/demo/ts/demo/Demos.ts",
      "scratch/demos/core/cspdemo.js": "src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts",
      ...buildDemoEntries(plugins, "plugins", "Demo.ts", "scratch/demos/"),
      ...buildEntries(plugins, "plugins", "Main.ts", "js/tinymce/"),
      ...buildDemoEntries(models, "models", "Demo.ts", "scratch/demos/"),
      ...buildEntries(models, "models", "Main.ts", "js/tinymce/"),
      ...buildDemoEntries(themes, "themes", "Demos.ts", "scratch/demos/"),
      ...buildEntries(themes, "themes", "Main.ts", "js/tinymce/"),
    },
    "../../tsconfig.demo.json"
  ),
  create(
    {
      "js/tinymce/tinymce.js": "src/core/main/ts/api/Main.ts",
    },
    "../../tsconfig.json"
  )
];

config[0].devServer = {
  port: '3000',
  host: "0.0.0.0",
  allowedHosts: "all",
  static: {
    publicPath: "/",
    directory: __dirname,
  },
  hot: false,
  liveReload: false,
  client: { overlay: { errors: true, warnings: true } },
  setupMiddlewares: (middlewares, devServer) => {
    generateDemoIndex(devServer.app);
    return middlewares;
  },
};

module.exports = config;
