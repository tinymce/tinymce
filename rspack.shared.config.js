const path = require("path");
const { TsCheckerRspackPlugin } = require("ts-checker-rspack-plugin");

const createDemoConfig = ({
  pkgDir,
  entry,
  staticDir = "src/demo/html",
  tsConfig = path.resolve(pkgDir, "tsconfig.json"),
  outDir = path.resolve(pkgDir, "scratch/compiled"),
  outputFilename,
  publicPath = "/",
  devtool = "source-map",
  // Extra `module.rules` inserted before the TypeScript rule.
  moduleRules = [],
  // Extra loaders run on `.ts` files before swc-loader (e.g. string replacement).
  tsPreLoaders = [],
  optimization = { splitChunks: false },
  // `false` disables the dev server; an object is merged over the defaults.
  devServer,
  // Anything else (stats, ignoreWarnings, watchOptions, infrastructureLogging, …)
  // is spread onto the config verbatim.
  ...overrides
} = {}) => {
  const moduleName = path.basename(pkgDir);
  const rawEntry = entry ?? `./src/demo/ts/ephox/${moduleName}/demo/Demo.ts`;
  const isMultiEntry = typeof rawEntry === "object";
  // Resolve entry paths against the package so callers can pass plain
  // (non-`./`-prefixed) paths without rspack treating them as module requests.
  const resolveEntry = (v) => path.resolve(pkgDir, v);
  const resolvedEntry = isMultiEntry
    ? Object.fromEntries(Object.entries(rawEntry).map(([k, v]) => [k, resolveEntry(v)]))
    : resolveEntry(rawEntry);
  const resolvedTsConfig = path.resolve(tsConfig);

  const builtDevServer = {
    port: "3000",
    host: "0.0.0.0",
    allowedHosts: "all",
    static: { directory: path.resolve(pkgDir, staticDir) },
    open: false,
    hot: false,
    ...devServer,
  };

  return {
    context: pkgDir,
    entry: resolvedEntry,
    mode: "development",
    devtool,
    target: "web",
    plugins: [
      new TsCheckerRspackPlugin({
        async: true,
        devServer: true,
        typescript: {
          build: true,
          configFile: resolvedTsConfig,
        },
      }),
    ],
    optimization,
    resolve: {
      conditionNames: ["tiny:source", "..."],
      extensions: [".ts", ".js"],
      tsConfig: {
        configFile: resolvedTsConfig,
        references: "auto",
      },
    },
    module: {
      rules: [
        { test: /\.js$/, resolve: { fullySpecified: false } },
        { test: /\.(js|mjs)$/, use: ["source-map-loader"], enforce: "pre" },
        ...moduleRules,
        {
          test: /\.ts$/,
          use: [
            ...tsPreLoaders,
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: { parser: { syntax: "typescript" }, target: "es2022" },
                sourceMaps: true,
              },
            },
          ],
        },
      ],
    },
    output: {
      filename: outputFilename ?? (isMultiEntry ? "[name]-demo.js" : "demo.js"),
      path: path.resolve(outDir),
      publicPath,
    },
    ...(devServer === false ? {} : { devServer: builtDevServer }),
    ...overrides,
  };
};

module.exports = { createDemoConfig };
