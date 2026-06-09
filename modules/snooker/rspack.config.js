const { createDemoConfig } = require("../../rspack.shared.config");

module.exports = createDemoConfig({
  pkgDir: __dirname,
  entry: {
    detect: "./src/demo/ts/ephox/snooker/demo/DetectDemo.ts",
  },
});
