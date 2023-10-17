#!/usr/bin/env node
const fs = require('fs');
const { configure } = require('esbd');

const tinyPlugin = {
  name: 'tiny',
  setup(build) {
    // Sizzle is imported very strangly it exports a function but is imported as a * module the types require that type of import
    // So this hack simply replaces that at compile time until we properly fix this
    build.onLoad({ filter: /\/SizzleFind.[tj]s$/ }, async (args) => {
      const text = await fs.promises.readFile(args.path, 'utf8');
      return {
        contents: text.replace(/import \* as Sizzle/g, 'import Sizzle'),
        loader: 'ts'
      };
    });
  },
};

configure({
  absWorkingDir: __dirname,
  entryPoints: ['./modules/tinymce/src/core/demo/html/full_demo.html'],
  publicPath: '/public',
  outdir: './scratch',
  plugins: [
    tinyPlugin
  ],
  loader: {
    '.svg': 'text'
  },
});
