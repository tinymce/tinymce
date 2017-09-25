/*eslint-env node */

module.exports = function(grunt) {
  var packageData = grunt.file.readJSON('package.json');

  var driver = 'phantomjs';

  grunt.initConfig({
    pkg: packageData,

    'bedrock-auto': {
      browser: {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/browser/**/*Test.js',
        browser: driver,
        options: {
          stopOnFailure: true
        }
      },
      
      phantomjs: {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/browser/' + (grunt.option('my-dir') !== undefined ? grunt.option('my-dir') : '') + '/**/**Test.js',
        browser: driver,
        options: {
          stopOnFailure: true
        }
      },

      'phantomjs-current': {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/browser/ui/button/ButtonTypeTest.js',
        browser: driver,
        options: {
          stopOnFailure: true
        }
      }
    },

    'bedrock-manual': {
      'behaviours': grunt.option('just') ? {
        config: 'config/bolt/browser.js',
        testfiles: grunt.option('just'),
        browser: driver
      } : {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/behaviour',
        browser: driver
      }
    },

    exec: {
      'test-toggling': {
        cmd: function () {
          return 'node_modules/.bin/bedrock-auto -b phantomjs --files src/test/js/browser/behaviour/TogglingTest.js'
        }
      }
    },

    "bolt-test": {
      "atomic" :{
        config: "config/bolt/atomic.js",
        files: {
          src: [ "src/test/js/atomic/**/**Test.js" ]
        }
      }
    },

    eslint: {
      options: {
        config: ".eslintrc",
        quiet: true
      },

      src: [
        "src"
      ]

    },

    /* 
     * Use the --mydir=api (where api can be any directory under browser) when using watch mode.
     * Can use --mydir= for the whole browser directory
     * Setup: $ watch -n 1 cat scratch/TEST-bedrock-run.xml somewhere else to see the output
     */
    watch: {
      everything: {
        files: ['src/**/*.js'],
        tasks: [

          "bolt-test:atomic",
          'bedrock-auto:phantomjs'
        ],
        options: {
          spawn: false,
          atBegin: true
        }
      },
      current: {
        files: ['src/**/*.js'],
        tasks: [

          "bedrock-auto:phantomjs-current"
        ],
        options: {
          spawn: false,
          atBegin: true
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks('grunt-exec');

  grunt.loadNpmTasks('grunt-parallel');

  grunt.loadNpmTasks('@ephox/bolt');
  grunt.loadNpmTasks('@ephox/bedrock');

  grunt.registerTask('tests', [ 'bolt-test', 'bedrock-auto:phantomjs' ]);
};
