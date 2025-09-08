const path = require("path");
const fs = require("fs");
const fg = require("fast-glob");
const packageData = require("./package.json");

const generateDemoIndex = (app) => {
  const demoList = fg.sync([ 'src/**/demo/html/*.html', 'src/**/demo/html/**/*.html' ], { cwd: __dirname });
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

const modulesDir = path.resolve(__dirname, "../");

const ephoxAliases = Object.fromEntries(
  fs.readdirSync(modulesDir).map((name) => [
    `@ephox/${name}`,
    path.join(modulesDir, name, "src/main/ts/ephox", name, "api/Main.ts")
  ])
);

function create(entries, tsConfig, outDir = ".") {
  const tsConfigPath = path.resolve(tsConfig);
  const resolvedEntries = Object.fromEntries(
    Object.entries(entries).map(([k, v]) => [k, path.resolve(__dirname, v)])
  );
  return {
    stats: {
      logging: "verbose"
    },
    context: __dirname,
    entry: resolvedEntries,
    mode: "development",
    devtool: "inline-source-map",
    target: "web",
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    infrastructureLogging: { level: "log" },
    ignoreWarnings: [/export .* was not found in/],

    resolve: {
      extensions: [".ts", ".js"],
      tsConfig: tsConfigPath,
      alias: {
        ...ephoxAliases
      },
    },
    watchOptions: {
      ignored: ["**/node_modules/**"] // but don’t ignore your workspace packages
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
            // NOTE: Still required? It's not replacing in the EditorManager.ts file anyway with webpack
            // {
            //   loader: "string-replace-loader",
            //   options: {
            //     test: /EditorManager.ts/,
            //     multiple: [
            //       {
            //         search: "@@majorVersion@@",
            //         replace: packageData.version.split(".")[0],
            //       },
            //       {
            //         search: "@@minorVersion@@",
            //         replace: packageData.version.split(".").slice(1).join("."),
            //       },
            //       { search: "@@releaseDate@@", replace: packageData.date },
            //     ],
            //   },
            // },
            {
              loader: "builtin:swc-loader",
              options: {
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
    },

    devServer: {
      port: 'auto',
      host: "0.0.0.0",
      allowedHosts: "all",
      static: {
        publicPath: "/",
        directory: __dirname,
      },
      hot: false,
      liveReload: true,
      historyApiFallback: true,
      client: { overlay: { errors: true, warnings: false } },
      setupMiddlewares: (middlewares, devServer) => {
        generateDemoIndex(devServer.app);
        return middlewares;
      },
    },
  };
}

function buildDemoEntries(typeNames, type, demo, pathPrefix = "") {
  return typeNames.reduce((acc, name) => {
    const tsfile = `src/${type}/${name}/demo/ts/demo/${demo}`;
    if (fs.existsSync(path.resolve(__dirname, tsfile))) {
      acc[`${pathPrefix}${type}/${name}/demo.js`] = tsfile;
    }
    return acc;
  }, {});
}

function buildEntries(typeNames, type, entry, pathPrefix = "") {
  return typeNames.reduce((acc, name) => {
    const fileName = type.replace(/s$/, "") + ".js";
    acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
    return acc;
  }, {});
}

function listDirsSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch { return []; }
}

function detectTypeNames(baseDir, type, demoFile) {
  const typeDir = path.resolve(baseDir, 'src', type);
  return listDirsSafe(typeDir).filter(name => {
    const demoPath = path.resolve(typeDir, name, 'demo/ts/demo', demoFile);
    return fs.existsSync(demoPath);
  });
}

const plugins = detectTypeNames(__dirname, "plugins", "Demo.ts");
const themes = detectTypeNames(__dirname, "themes", "Demos.ts"); // note: themes use Demos.ts
const models = detectTypeNames(__dirname, "models", "Demo.ts");

module.exports = [
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
  ),
];
