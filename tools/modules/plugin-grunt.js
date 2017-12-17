/*eslint-env node */

var patcher = require('./rollup-patch');
var prefixResolve = require('./prefix-resolve');
var cachedResolve = require('./cached-resolve');
var { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var path = require('path');
var fs = require('fs');

module.exports = (name, copy) => grunt => {
  const tsConfigPath = path.resolve(__dirname, '../../tsconfig.plugin.json');
  const rootPath = '../../../';
  const resolvedRootPath = path.resolve(rootPath);
  const tsPluginSourceFile = 'src/main/ts/Plugin.ts';
  const jsPluginDestFile = 'dist/' + name + '/plugin.js';
  const jsPluginDestFileMin = 'dist/' + name + '/plugin.min.js';
  const tsDemoSourceFile = path.resolve('src/demo/ts/demo/Demo.ts');
  const jsDemoDestFile = path.resolve('scratch/compiled/demo.js');
  const scratchDir = path.resolve(__dirname, '../../scratch');

  var config = {
    rollup: {
      options: {
        treeshake: true,
        moduleName: name,
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          prefixResolve(),
          cachedResolve(),
          patcher()
        ]
      },
      plugin: {
        files:[
          {
            src: `../../../lib/plugins/${name}/src/main/ts/Plugin.js`,
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

      'plugin': {
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
    }
  };

  grunt.initConfig(Object.assign({}, config, copy ? copy : {}))

  if (copy) {
    grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-copy/tasks'));
  }

  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-rollup/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/@ephox/bedrock/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-uglify/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-webpack/tasks'));

  grunt.registerTask('default', ['rollup', 'uglify'].concat(copy ? ['copy'] : []));
};