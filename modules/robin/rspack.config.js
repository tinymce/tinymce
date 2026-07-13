const { createDemoConfig } = require("../../rspack.shared.config");

module.exports = createDemoConfig({
  pkgDir: __dirname,
  entry: "./src/demo/ts/ephox/robin/demo/WordSelectDemo.ts",
});
