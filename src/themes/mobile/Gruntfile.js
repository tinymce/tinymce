/*eslint-env node */

module.exports = function (grunt) {
  var fs = require('fs');

  var packageData = grunt.file.readJSON('package.json');
  var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');

  var changelog = fs.readFileSync('./changelog.txt', 'UTF-8');

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
          src: [ 'src/test/js/atomic/smooth/*Test.js' ]
        }
      }
    },

    copy: {
      'dist-mobile-theme': {
        files: [
          /* Other theme.js is handled by uglify */
          {
            src: 'scratch/inline/theme.raw.js',
            dest: 'dist/themes/beta-mobile/theme.js'
          }
        ]
      },

      'dist-mobile-css': {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['src/main/css/*.css'],
            dest: 'dist/skins/lightgray/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/main/icons/tinymce-mobile.woff'],
            dest: 'dist/skins/icons/',
            filter: 'isFile'
          }
        ]
      },

      'standalone': {
        files: [
          {
            cwd: '../../../js/tinymce',
            src: '**/*',
            dest: 'deploy-local/',
            expand: true
          },
          {
            cwd: 'dist',
            src: '**/*',
            dest: 'deploy-local',
            expand: true
          },
          {
            cwd: 'src/resources/html',
            src: '*.html',
            dest: 'deploy-local',
            expand: true
          }
        ]
      }
    },

    replace: {
      'mobile-version': {
        options: {
          patterns: [
            {
              match: 'MOBILE_THEME_VERSION',
              replacement: BUILD_VERSION
            }
          ]
        },
        files: [
          {
            src: 'scratch/inline/theme.js',
            dest: 'scratch/inline/theme.js'
          },
          {
            src: 'scratch/inline/theme.raw.js',
            dest: 'scratch/inline/theme.raw.js'
          }
        ]
      },

      'mobile-changelog': {
        options: {
          patterns: [
            {
              match: 'MOBILE_THEME_CHANGELOG',
              replacement: changelog
            }
          ]
        },
        files: [
          {
            src: 'deploy-local/index.html',
            dest: 'deploy-local/index.html'
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
            dest: 'dist/themes/beta-mobile/theme.min.js'
          }
        ]
      }
    },
    less: {
      development: {
        options: {
          plugins : [ new (require('less-plugin-autoprefix'))({browsers : [ 'last 2 versions', /* for phantom */'safari >= 4' ]}) ],
          compress: true,
          yuicompress: true,
          sourceMap: true,
          optimization: 2
        },
        files: {
          'src/main/css/skin.mobile.css': 'src/main/css/app/mobile-less.less' // destination file and source file
        }
      }
    },
    watch: {
      styles: {
        files: ['src/main/css/**/*.less', 'src/**/*.js'], // which files to watch
        tasks: ['dist' ],
        options: {
          nospawn: false,
          atBegin: true
        }
      }
    }
  });

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('dist/version.txt', BUILD_VERSION);
  });

  grunt.task.loadTasks('../../../node_modules/@ephox/bolt/tasks');
  grunt.task.loadTasks('../../../node_modules/@ephox/bedrock/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-copy/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-uglify/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-eslint/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-less/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-contrib-watch/tasks');
  grunt.task.loadTasks('../../../node_modules/grunt-replace/tasks');

  grunt.registerTask('copy-dist', ['copy:dist-mobile-theme', 'copy:dist-mobile-css']);
  grunt.registerTask('build-dist', [ 'bolt-init', 'bolt-build', 'replace:mobile-version', 'version' ]);
  grunt.registerTask('minify-dist', [ 'uglify:theme' ]);

  // TODO: Re-enable eslint
  grunt.registerTask('dist', ['build-dist', 'less', 'copy-dist', /*'eslint',*/ 'minify-dist']);

  grunt.registerTask('atomic-tests', ['bolt-build', 'bolt-test:atomic']);
  grunt.registerTask('phantom-tests', ['bedrock-auto:phantomjs']);
  grunt.registerTask('chrome-tests', ['bedrock-auto:chrome']);
  grunt.registerTask('tests', ['bolt-test:atomic', 'bedrock-auto:phantomjs', 'bedrock-auto:chrome']);
  grunt.registerTask('browser-tests', ['bedrock-manual']);

  grunt.registerTask('standalone', [ 'dist', 'copy:standalone', 'replace:mobile-changelog']);

  grunt.registerTask('default', ['dist']);
};
