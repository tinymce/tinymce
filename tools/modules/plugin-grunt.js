/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('./rollup-patch');
var { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var path = require('path');
var fs = require('fs');

module.exports = (name, copy) => grunt => {
  const tsConfigPath = path.resolve(__dirname, '../../tsconfig.plugin.json');
  const rootPath = '../../../';
  const tsPluginSourceFile = 'src/main/ts/Plugin.ts';
  const jsPluginDestFile = 'dist/' + name + '/plugin.js';
  const jsPluginDestFileMin = 'dist/' + name + '/plugin.min.js';
  const tsDemoSourceFile = path.resolve('src/demo/ts/demo/Demo.ts');
  const jsDemoDestFile = path.resolve('scratch/compiled/demo.js');

  var config = {
    rollup: {
      options: {
        treeshake: false,
        moduleName: name,
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          resolve(),
          typescript({
            tsconfig: tsConfigPath,
            check: false,
            include: [
              'src/main/ts/**/*.ts',
              '../../core/dist/globals/tinymce/core/**/*.ts'
            ]
          }),
          patcher()
        ]
      },
      plugin: {
        files:[
          {
            src: tsPluginSourceFile,
            dest: jsPluginDestFile
          }
        ]
      }
    },

    uglify: {
      options: {
        beautify: {
          ascii_only: true,
          screw_ie8: false
        },

        compress: {
          screw_ie8: false
        },
        report: 'gzip'
      },

      "plugin": {
        files: [
          {
            src: jsPluginDestFile,
            dest: jsPluginDestFileMin
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
        devtool: 'source-map',

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
    },

    "bedrock-manual": {
      "all": {
        config: "config/bolt/browser.js",
        // Exclude webdriver tests
        testfiles: "src/test/js/browser/**/*Test.js",
        projectdir: "../../..",
        options: {
          stopOnFailure: true
        }
      }
    }
  };

  grunt.initConfig(Object.assign({}, config, copy ? copy : {}))

  if (copy) {
    grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-copy/tasks'));
  }

  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-rollup/tasks'));
  grunt.task.loadTasks(path.join(__dirname, "../../node_modules/@ephox/bedrock/tasks"));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-uglify/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-webpack/tasks'));

  grunt.registerTask("default", ["rollup", "uglify"].concat(copy ? ['copy'] : []));
};