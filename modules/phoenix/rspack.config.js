const { createDemoConfig } = require("../../rspack.shared.config");

module.exports = createDemoConfig({
  pkgDir: __dirname,
  entry: {
    latin: "./src/demo/ts/ephox/phoenix/demo/LatinDemo.ts",
    reuse: "./src/demo/ts/ephox/phoenix/demo/ReuseDemo.ts",
    search: "./src/demo/ts/ephox/phoenix/demo/SearchDemo.ts",
  },
  open: ["LatinDemo.html", "ReuseDemo.html", "SearchDemo.html"],
});
