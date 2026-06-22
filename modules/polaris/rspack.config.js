const { createDemoConfig } = require("../../rspack.shared.config");

module.exports = createDemoConfig({
  pkgDir: __dirname,
  entry: "./src/main/ts/ephox/polaris/api/Main.ts",
});
