/*eslint-env node */

module.exports = function(grunt) {
  var packageData = grunt.file.readJSON('package.json');

  var driver = 'phantomjs';

  grunt.initConfig({
    pkg: packageData,

    'bedrock-auto': {
      'behaviours': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/behaviour',
        browser: driver
      },
      'api': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/api',
        browser: driver
      },
      'events': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/events',
        browser: driver
      },
      'position': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/position',
        browser: driver
      },
      'ui': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/ui',
        browser: driver
      },

      browser: {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser',
        browser: driver,
        options: {
          stopOnFailure: true
        }
      }
    },

    'bedrock-manual': {
      'behaviours': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/behaviour',
        browser: driver

      }
    },

    watch: {
      everything: {
        files: ['src/**/*.js'],
        tasks: [

          'bedrock-auto:browser'
        ],
        options: {
          spawn: false
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-parallel');

  grunt.loadNpmTasks('@ephox/bolt');
  grunt.loadNpmTasks('@ephox/bedrock');
};