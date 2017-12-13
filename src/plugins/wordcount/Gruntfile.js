/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('../../../tools/modules/rollup-patch');
var ascii = require('rollup-plugin-ascii');

module.exports = function (grunt) {
  grunt.initConfig({
    rollup: {
      options: {
        treeshake: true,
        moduleName: 'wordcount',
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          resolve(),
          typescript({
            include: [
              '../../**/*.ts'
            ]
          }),
          patcher(),
          ascii()
        ]
      },
      plugin: {
        files:[
          {
            dest: 'dist/wordcount/plugin.js',
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
            src: "dist/wordcount/plugin.js",
            dest: "dist/wordcount/plugin.min.js"
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