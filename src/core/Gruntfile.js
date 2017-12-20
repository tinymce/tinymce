/*eslint-env node */

var { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var path = require('path');
const swag = require('@ephox/swag');

module.exports = function (grunt) {
  const scratchDir = path.resolve(__dirname, '../../scratch');
  const tsConfigPath = path.resolve(__dirname, '../../tsconfig.json');
  const tsDemoSourceFile = path.resolve('src/demo/ts/demo/Demos.ts');
  const jsDemoDestFile = path.resolve('scratch/compiled/demo.js');
  const rootPath = '../../';

  grunt.initConfig({
    rollup: {
      options: {
        treeshake: true,
        moduleName: 'tinymce',
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          swag.nodeResolve({
            basedir: __dirname,
            prefixes: {
              'tinymce/core': '../../src/core/dist/globals/tinymce/core',
              'tinymce/ui': '../../lib/ui/main/ts'
            }
          }),
          swag.remapImports()
        ]
      },
      core: {
        files:[
          {
            src: '../../lib/core/src/main/ts/api/Main.js',
            dest: 'dist/tinymce/tinymce.js'
          }
        ]
      }
    },

    uglify: {
      options: {
        output: {
          ascii_only: true,
        },
        ie8: true
      },

      'core': {
        files: [
          {
            src: 'dist/tinymce/tinymce.js',
            dest: 'dist/tinymce/tinymce.min.js'
          },

          {
            src: 'src/main/js/JqueryIntegration.js',
            dest: 'dist/tinymce/jquery.tinymce.min.js'
          }
        ]
      }
    },

    copy: {
      'core': {
        files: [
          {
            src: 'src/main/text/readme_lang.md',
            dest: 'dist/tinymce/langs/readme.md'
          }
        ]
      }
    },

    webpack: {
      options: {
        watch: true
      },
      dev: {
        entry: tsDemoSourceFile,
        //devtool: 'source-map',

        resolve: {
          extensions: ['.ts', '.js'],
          plugins: [
            new TsConfigPathsPlugin({
              baseUrl: rootPath,
              compiler: 'typescript',
              configFileName: tsConfigPath
            })
          ]
        },

        module: {
          rules: [
            {
              test: /\.js$/,
              use: ['source-map-loader'],
              enforce: 'pre'
            },

            {
              test: /\.ts$/,
              use: [
                {
                  loader: 'awesome-typescript-loader',
                  options: {
                    transpileOnly: true,
                    configFileName: tsConfigPath
                  }
                }
              ]
            }
          ]
        },

        plugins: [
          new LiveReloadPlugin(),
          new CheckerPlugin()
        ],

        output: {
          filename: path.basename(jsDemoDestFile),
          path: path.dirname(jsDemoDestFile)
        }
      }
    }
  });

  grunt.task.loadTasks('../../node_modules/grunt-rollup/tasks');
  grunt.task.loadTasks('../../node_modules/grunt-contrib-copy/tasks');
  grunt.task.loadTasks('../../node_modules/grunt-contrib-uglify/tasks');
  grunt.task.loadTasks('../../node_modules/grunt-webpack/tasks');
  grunt.task.loadTasks('../../tools/tasks');

  grunt.registerTask('default', ['rollup', 'copy', 'uglify']);
};