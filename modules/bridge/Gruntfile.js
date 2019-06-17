const {
  CheckerPlugin,
  TsConfigPathsPlugin
} = require('awesome-typescript-loader');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');

module.exports = function(grunt) {
  var packageData = grunt.file.readJSON('package.json');
  const tsDemoSourceFile = path.resolve('src/demo/ts/Demo.ts');
  const jsDemoDestFile = path.resolve('scratch/compiled/demo.js');

  grunt.initConfig({
    pkg: packageData,

    shell: {
      command: 'tsc'
    },

    webpack: {
      options: {
        mode: 'development',
        watch: true
      },
      dev: {
        entry: tsDemoSourceFile,
        mode: 'development',
        devtool: 'source-map',

        resolve: {
          extensions: ['.ts', '.js'],
          plugins: [
            new TsConfigPathsPlugin({
              compiler: 'typescript'
            })
          ]
        },

        module: {
          rules: [
            {
              test: /\.ts$/,
              use: [
                {
                  loader: 'awesome-typescript-loader'
                }
              ]
            }
          ]
        },

        plugins: [new LiveReloadPlugin(), new CheckerPlugin()],

        output: {
          filename: path.basename(jsDemoDestFile),
          path: path.dirname(jsDemoDestFile)
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', []);
};
