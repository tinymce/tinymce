/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('../../tools/modules/rollup-patch');

module.exports = function (grunt) {
  grunt.initConfig({
    rollup: {
      options: {
        treeshake: true,
        moduleName: 'tinymce',
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
          patcher()
        ]
      },
      core: {
        files:[
          {
            src: 'src/main/ts/api/Main.ts',
            dest: 'dist/tinymce/tinymce.js'
          }
        ]
      }/*,
      demo: {
        files: [
          {
            src: 'src/demo/ts/demo/Demos.ts',
            dest: 'scratch/compiled/demo.js'
          }
        ]
      }*/
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

      'plugin': {
        files: [
          {
            src: 'dist/tinymce/tinymce.js',
            dest: 'dist/tinymce/tinymce.min.js'
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

    watch: {
      demo: {
        files: ['src/**/*.ts'],
        tasks: ['rollup:demo'],
        options: {
          livereload: true,
          spawn: false
        }
      }
    },

    'globals': {
      options: {
        outputDir: 'dist/globals',
        templateFile: 'config/GlobalsTemplate.ts'
      }
    }
  });

  grunt.task.loadTasks('../../node_modules/grunt-rollup/tasks');
  grunt.task.loadTasks('../../node_modules/grunt-contrib-copy/tasks');
  grunt.task.loadTasks('../../node_modules/grunt-contrib-uglify/tasks');
  grunt.task.loadTasks('../../tools/tasks');

  grunt.registerTask('default', ['globals', 'rollup', 'copy', 'uglify']);
};