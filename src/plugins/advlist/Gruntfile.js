/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('../../../tools/modules/rollup-patch');

module.exports = function (grunt) {
  grunt.initConfig({
    rollup: {
      options: {
        treeshake: true,
        moduleName: 'advlist',
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          resolve(),
          typescript({
            tsconfig: '../../tsconfig.plugin.json',
            include: [
              '../../**/*.ts'
            ]
          }),
          patcher()
        ]
      },
      plugin: {
        files:[
          {
            dest: 'dist/advlist/plugin.js',
            src: 'src/main/ts/Plugin.ts'
          }
        ]
      },
      demo: {
        files: [
          {
            dest: 'scratch/compiled/demo.js',
            src: 'src/demo/ts/demo/Demo.ts'
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
        }
      },

      "plugin": {
        files: [
          {
            src: "dist/advlist/plugin.js",
            dest: "dist/advlist/plugin.min.js"
          }
        ]
      }
    },

    watch: {
      demo: {
        files: ["src/**/*.ts"],
        tasks: ["rollup:demo"],
        options: {
          livereload: true,
          spawn: false
        }
      }
    }
  });

  grunt.task.loadTasks('../../../node_modules/grunt-rollup/tasks');
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-watch/tasks");

  grunt.registerTask("default", ["rollup", "uglify"]);
};