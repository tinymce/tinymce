const path = require("path");
const { TsCheckerRspackPlugin } = require("ts-checker-rspack-plugin");

const createDemoConfig = ({ pkgDir, entry, open = "demo.html" }) => {
  const moduleName = path.basename(pkgDir);
  const resolvedEntry = entry ?? `./src/demo/ts/ephox/${moduleName}/demo/Demo.ts`;
  const isMultiEntry = typeof resolvedEntry === "object";
  const openPages = (Array.isArray(open) ? open : [open]).map((page) => `/${page}`);

  return {
    context: pkgDir,
    entry: resolvedEntry,
    mode: "development",
    devtool: "source-map",
    target: "web",
    plugins: [
      new TsCheckerRspackPlugin({
        async: true,
        typescript: {
          build: true,
          configFile: path.resolve(pkgDir, "tsconfig.json"),
        },
      }),
    ],
    optimization: { splitChunks: false },
    resolve: {
      conditionNames: ["tiny:source", "..."],
      extensions: [".ts", ".js"],
      tsConfig: {
        configFile: path.resolve(pkgDir, "tsconfig.json"),
        references: "auto",
      },
    },
    module: {
      rules: [
        { test: /\.js$/, resolve: { fullySpecified: false } },
        { test: /\.(js|mjs)$/, use: ["source-map-loader"], enforce: "pre" },
        {
          test: /\.ts$/,
          use: [
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
      filename: isMultiEntry ? "[name]-demo.js" : "demo.js",
      path: path.resolve(pkgDir, "scratch/compiled"),
      publicPath: "/",
    },
    devServer: {
      port: '3000',
      host: "0.0.0.0",
      allowedHosts: "all",
      static: { directory: path.resolve(pkgDir, "src/demo/html") },
      open: openPages,
      hot: false,
    },
  };
};

module.exports = { createDemoConfig };
