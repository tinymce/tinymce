import * as path from 'path';
import { rollup, type InputOptions, type OutputOptions, type OutputChunk, type OutputAsset } from 'rollup';

const isFunction = (val: any): val is Function => typeof val === 'function';

const isOutputChunk = (output: OutputChunk | OutputAsset): output is OutputChunk => output.hasOwnProperty('map');

const defaultInputOptions: Partial<InputOptions> = {
  cache: null,
  external: [],
  onwarn: null,
  plugins: null,
  treeshake: true
};

const defaultOutputOptions: Partial<OutputOptions> = {
  name: null,
  format: 'es',
  exports: 'auto',
  amd: {
    id: null
  },
  globals: {},
  indent: true,
  strict: true,
  banner: null,
  footer: null,
  intro: null,
  outro: null,
  paths: null,
  generatedCode: {
    constBindings: false
  },
  sourcemap: false,
  sourcemapFile: null,
  interop: 'auto'
};

const defaultOptions = {
  ...defaultInputOptions,
  ...defaultOutputOptions
};

// This is a workaround to get dom-globals to work and not have to bundle the entire module
// TODO find a better way to map dom-globals to their relevant global properties
const patchOptions = (options) => {
  const newOptions = {
    external: [],
    globals: {},
    ...options
  };
  // Make dom-globals an external dep and then map it to the window object
  if (newOptions.external.indexOf('@ephox/dom-globals') === -1) {
    newOptions.external.push('@ephox/dom-globals');
  }
  newOptions.globals['@ephox/dom-globals'] = 'window';
  return newOptions;
};

export const task = (grunt: IGrunt): void => {
  grunt.registerMultiTask('rollup', 'rollup your grunt!', function () {
    const done = this.async();
    const options = patchOptions(this.options(defaultOptions));
    const file = this.files[0];
    const input = file.src[0];
    const plugins = isFunction(options.plugins) ? options.plugins() : options.plugins;

    if (this.files.length > 1) {
      grunt.fail.warn('This task only accepts a single file input.');
    } else if (!file.src || file.src.length === 0) {
      grunt.fail.warn('No entry point specified.');
    } else if (!grunt.file.exists(input)) {
      grunt.fail.warn('Entry point "' + input + '" not found.');
    }

    rollup({
      cache: options.cache,
      input,
      external: options.external,
      plugins,
      context: options.context,
      onwarn: options.onwarn,
      output: {
        generatedCode: {
          constBindings: options.generatedCode.constBindings
        }
      },
      treeshake: options.treeshake
    }).then((bundle) => bundle.generate({
      format: options.format,
      exports: options.exports,
      paths: options.paths,
      name: options.name,
      globals: options.globals,
      indent: options.indent,
      strict: options.strict,
      banner: options.banner,
      footer: options.footer,
      intro: options.intro,
      outro: options.outro,
      inlineDynamicImports: options.inlineDynamicImports,
      sourcemap: options.sourcemap,
      sourcemapFile: options.sourcemapFile
    })).then((result) => {
      const outputs = result.output;
      for (const output of outputs) {
        if (isOutputChunk(output)) {
          if (options.sourcemap === true) {
            const sourceMapOutPath = file.dest + '.map';
            grunt.file.write(sourceMapOutPath, output.map.toString());
            grunt.file.write(file.dest, `${output.code}\n//# sourceMappingURL=${path.basename(sourceMapOutPath)}`);
          } else if (options.sourcemap === 'inline') {
            grunt.file.write(file.dest, `${output.code}\n//# sourceMappingURL=${output.map.toUrl()}`);
          } else {
            grunt.file.write(file.dest, output.code);
          }
        } else {
          grunt.file.write(file.dest, output.source.toString());
        }
      }

      done();
    }).catch((error) => grunt.fail.warn(error));
  });
};
