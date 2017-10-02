/*eslint-env node */

module.exports = function (grunt) {
  grunt.option('stack', true);
  grunt.initConfig({
    'bolt-init': {
      'theme': {
        config_dir: 'config/bolt'
      }
    },

    'bolt-build': {
      'theme': {
        config_js: 'config/bolt/prod.js',
        output_dir: 'scratch',
        main: 'tinymce.themes.mobile.Theme',
        filename: 'theme',

        generate_inline: true,
        minimise_module_names: true,

        files: {
          src: ['src/main/js/Theme.js']
        }
      }
    },

    'bedrock-manual': {
      'all': {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/browser/**/*Test.js',
        projectdir: '../../..',
        browser: 'chrome',
        options: {
          stopOnFailure: true
        }
      }
    },

    'bedrock-auto': {
      phantomjs: {
        config: 'config/bolt/browser.js',
        testfiles: [
          // NOTE: This one is temperamental on phantom with focus.
          // 'src/test/js/browser/ui/SerialisedLinkTest.js',
          'src/test/js/phantom/**/*Test.js',
          'src/test/js/browser/ui/ButtonsTest.js',
          'src/test/js/browser/features/**/*Test.js'
        ],
        projectdir: '../../..',
        browser: 'phantomjs',
        options: {
          stopOnFailure: true
        }
      },

      'chrome': {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/browser/**/*Test.js',
        projectdir: '../../..',
        browser: 'chrome',
        options: {
          stopOnFailure: true
        }
      }
    },

    'bolt-test': {
      'atomic' :{
        config: 'config/bolt/atomic.js',
        files: {
          src: [ 'src/test/js/atomic/**/*Test.js' ]
        }
      }
    },

    copy: {
      'theme': {
        files: [
          {
            src: 'scratch/inline/theme.raw.js',
            dest: 'dist/mobile/theme.js'
          }
        ]
      }
    },

    eslint: {
      options: {
        config: '../../../.eslintrc'
      },

      src: [
        'src'
      ]
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

      'theme': {
        files: [
          {
            src: 'scratch/inline/theme.js',
            dest: 'dist/mobile/theme.min.js'
          }
        ]
      }
    },

    watch: {
      styles: {
        files: ['src/**/*.js'], // which files to watch
        tasks: ['dist', 'bolt-test:atomic', 'bedrock-auto:phantomjs' ],
        options: {
          nospawn: false,
          atBegin: true
        }
      }
    }
  });

  grunt.task.loadTasks('../../../node_modules/@ephox/bolt/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-copy/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-uglify/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-eslint/tasks');

  grunt.registerTask('default', ['bolt-init', 'bolt-build', 'copy', 'uglify']);
};
