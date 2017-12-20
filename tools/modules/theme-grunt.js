/*eslint-env node */

var { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var path = require('path');
const swag = require('@ephox/swag');

module.exports = (name, copy) => grunt => {
  const tsConfigPath = path.resolve(__dirname, '../../tsconfig.theme.json');
  const rootPath = '../../../';
  const jsThemeDestFile = 'dist/' + name + '/theme.js';
  const jsThemeDestFileMin = 'dist/' + name + '/theme.min.js';
  const tsDemoSourceFile = path.resolve('src/demo/ts/demo/Demos.ts');
  const jsDemoDestFile = path.resolve('scratch/compiled/demo.js');

  var config = {
    rollup: {
      options: {
        treeshake: true,
        moduleName: name,
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          swag.nodeResolve({
            basedir: __dirname,
            prefixes: {
              'tinymce/core': '../../lib/globals/tinymce/core',
              'tinymce/ui': '../../lib/ui/src/main/ts'
            }
          }),
          swag.remapImports()
        ]
      },
      theme: {
        files:[
          {
            src: `../../../lib/themes/${name}/src/main/ts/Theme.js`,
            dest: jsThemeDestFile
          }
        ]
      }
    },

    uglify: {
      options: {
        output: {
          ascii_only: true
        },
        ie8: true
      },

      "theme": {
        files: [
          {
            src: jsThemeDestFile,
            dest: jsThemeDestFileMin
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

  grunt.initConfig(config)

  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-rollup/tasks'));
  grunt.task.loadTasks(path.join(__dirname, "../../node_modules/@ephox/bedrock/tasks"));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-uglify/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-webpack/tasks'));

  grunt.registerTask("default", ["rollup", "uglify"]);
};