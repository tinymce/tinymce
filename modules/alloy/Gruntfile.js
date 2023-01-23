const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const swag = require('@ephox/swag');

const create = (inFile, outFile) => {
  const tsConfig = "tsconfig.json";

  return {
    entry: inFile,
    devtool: 'source-map',
    mode: 'development',
    target: ['web'],
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    resolve: {
      symlinks: false,
      extensions: ['.ts', '.js'],
      plugins: [
        new TsConfigPathsPlugin({
          configFile: tsConfig,
          extensions: ['.ts', '.js']
        }),
      ]
    },
    ignoreWarnings: [
      // suppress type re-export warnings caused by `transpileOnly: true`
      // See https://github.com/TypeStrong/ts-loader#transpileonly
      /export .* was not found in/
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /\.js$|\.ts$/,
          use: ['@ephox/swag/webpack/remapper']
        },
        {
          test: /\.ts$/,
          use: [{
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              projectReferences: true,
              configFile: tsConfig,
              compilerOptions: {
                declarationMap: false
              }
            }
          }]
        }
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({ async: true })
    ],
    output: {
      filename: path.basename(outFile),
      path: path.resolve(path.dirname(outFile)),
      pathinfo: false
    }
  };
};


module.exports = (grunt) => {
  const packageData = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: packageData,

    shell: {
      command: 'tsc'
    },

    'webpack-dev-server': {
      demos: create('./src/demo/ts/ephox/alloy/demo/Demos.ts', 'scratch/compiled/demo.js'),
      options: {
        devServer: {
          port: 3003,
          host: '0.0.0.0',
          allowedHosts: 'all',
          hot: false,
          liveReload: false,
          static: {
            publicPath: '/',
            directory: path.join(__dirname, '/src/demo')
          },
        }
      }
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

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: "../../package.json",
    pattern: ['grunt-*', '@ephox/bedrock', '@ephox/swag']
  });

  grunt.registerTask('dev', ['webpack-dev-server']);
};
