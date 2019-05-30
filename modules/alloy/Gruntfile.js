const LiveReloadPlugin = require('webpack-livereload-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const swag = require('@ephox/swag');



let create = (inFile, outFile) => {
  return {
    entry: inFile,
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    resolve: {
      symlinks: false,
      extensions: ['.ts', '.js'],
      plugins: [
        new TsConfigPathsPlugin({})
      ]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new LiveReloadPlugin()
    ],
    output: {
      filename: path.basename(outFile),
      path: path.resolve(path.dirname(outFile)),
      pathinfo: false
    }
  };
};


module.exports = function (grunt) {
  var packageData = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: packageData,

    shell: {
      command: 'tsc'
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      plugin: ['src/**/*.ts']
    },

    'webpack-dev-server': {
      options: {
        webpack: [
          create('./src/demo/ts/ephox/alloy/demo/Demos.ts', 'scratch/compiled/demo.js')
        ],
        inline: false,
        port: 3003,
        host: '0.0.0.0',
        disableHostCheck: true
      },
      start: { }
    },

    rollup: {
      options: {
        treeshake: true,
        name: 'plugin',
        format: 'iife',
        banner: '(function () {',
        footer: 'plugin();})()',
        onwarn: swag.onwarn,
        plugins: [
          swag.nodeResolve({
            basedir: __dirname
          }),
          swag.remapImports()
        ]
      }
    },

    watch: {
      skins: {
        files: ['src/**/*'],
        tasks: ['rollup'],
        options: {
          spawn: false
        }
      }
    }

  });


  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('@ephox/swag');
  // grunt.loadNpmTasks('grunt-webpack');


  grunt.registerTask('dev', ['webpack-dev-server']);
};