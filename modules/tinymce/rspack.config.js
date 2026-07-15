const path = require("path");
const fs = require("fs");
const fg = require("fast-glob");
const packageData = require("./package.json");
const { createDemoConfig } = require("../../rspack.shared.config");

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

// Injects the package version/date into EditorManager.ts at build time.
const versionReplaceLoader = {
  loader: "string-replace-loader",
  options: {
    test: /EditorManager.ts/,
    multiple: [
      { search: "@@majorVersion@@", replace: packageData.version.split(".")[0] },
      { search: "@@minorVersion@@", replace: packageData.version.split(".").slice(1).join(".") },
      { search: "@@releaseDate@@", replace: packageData.date },
    ],
  },
};

// Options shared by both the demo bundle and the core tinymce.js bundle. These
// generalize the shared `createDemoConfig` factory to tinymce's needs: named
// output chunks, the version-replace loader, svg/raw asset handling, and the
// extra build tuning the large tinymce graph relies on.
const tinymceOptions = {
  pkgDir: __dirname,
  devtool: "inline-source-map",
  outputFilename: "[name]",
  outDir: __dirname,
  publicPath: "/",
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  moduleRules: [
    { test: /\.svg$/i, type: "asset/source" },
    { resourceQuery: /raw/, type: "asset/source" },
  ],
  tsPreLoaders: [versionReplaceLoader],
  infrastructureLogging: { level: "log" },
  ignoreWarnings: [/export .* was not found in/],
  watchOptions: { ignored: ["**/node_modules/**"] },
  stats: { assets: false, modulesSpace: 5 },
};

const plugins = findDemos(__dirname, "plugins", "Demo.ts");
const themes = findDemos(__dirname, "themes", "Demos.ts");
const models = findDemos(__dirname, "models", "Demo.ts");

const config = [
  createDemoConfig({
    ...tinymceOptions,
    tsConfig: "../../tsconfig.demo.json",
    entry: {
      "scratch/demos/core/demo.js": "src/core/demo/ts/demo/Demos.ts",
      "scratch/demos/core/cspdemo.js": "src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts",
      ...buildDemoEntries(plugins, "plugins", "Demo.ts", "scratch/demos/"),
      ...buildEntries(plugins, "plugins", "Main.ts", "js/tinymce/"),
      ...buildDemoEntries(models, "models", "Demo.ts", "scratch/demos/"),
      ...buildEntries(models, "models", "Main.ts", "js/tinymce/"),
      ...buildDemoEntries(themes, "themes", "Demos.ts", "scratch/demos/"),
      ...buildEntries(themes, "themes", "Main.ts", "js/tinymce/"),
    },
    devServer: {
      liveReload: false,
      static: { publicPath: "/", directory: __dirname },
      client: { overlay: { errors: true, warnings: true } },
      setupMiddlewares: (middlewares, devServer) => {
        generateDemoIndex(devServer.app);
        return middlewares;
      },
    },
  }),
  createDemoConfig({
    ...tinymceOptions,
    tsConfig: "../../tsconfig.json",
    entry: {
      "js/tinymce/tinymce.js": "src/core/main/ts/api/Main.ts",
    },
    devServer: false,
  }),
];

module.exports = config;
