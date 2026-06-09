const { createDemoConfig } = require("../../rspack.shared.config");

module.exports = createDemoConfig({
  pkgDir: __dirname,
  entry: "./src/demo/ts/ephox/alloy/demo/Demos.ts",
  staticDir: "src/demo",
});
