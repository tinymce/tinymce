/*eslint-env node */

module.exports = function (grunt) {
  grunt.option('stack', true);
  grunt.initConfig({
    "bolt-init": {
      "theme": {
        config_dir: "config/bolt"
      }
    },

    "bolt-build": {
      "theme": {
        config_js: "config/bolt/prod.js",
        output_dir: "scratch",
        main: "tinymce.themes.mobile.Theme",
        filename: "theme",

        generate_inline: true,
        minimise_module_names: true,

        files: {
          src: ["src/main/js/Theme.js"]
        }
      }
    },

    "bedrock-manual": {
      "all": {
        config: "config/bolt/browser.js",
        testfiles: "src/test/js/browser/**/*Test.js",
        projectdir: "../../..",
        browser: "chrome",
        options: {
          stopOnFailure: true
        }
      }
    },

    "bedrock-auto": {
      phantomjs: {
        config: 'config/bolt/browser.js',
        testfiles: 'src/test/js/phantom/**/*Test.js',
        projectdir: '../../..',
        browser: 'phantomjs',
        options: {
          stopOnFailure: true
        }
      },

      "chrome": {
        config: "config/bolt/browser.js",
        testfiles: "src/test/js/browser/**/*Test.js",
        projectdir: "../../..",
        browser: "chrome",
        options: {
          stopOnFailure: true
        }
      }
    },

    "bolt-test": {
      "atomic" :{
        config: "config/bolt/atomic.js",
        files: {
          src: [ "src/test/js/atomic/smooth/*Test.js" ]
        }
      }
    },

    copy: {
      "theme": {
        files: [
          {
            src: "scratch/inline/theme.raw.js",
            dest: "dist/inline/theme.js"
          }
        ]
      },

      "standalone": {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['src/main/css/**'],
            dest: 'deploy-local/css',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/main/icons/**'],
            dest: 'deploy-local/icons',
            filter: 'isFile'
          },
          {
            src: "../../../js/tinymce/tinymce.min.js",
            dest: "deploy-local/js/tinymce.min.js"
          },
          {
            src: "../../../js/tinymce/plugins/lists/plugin.min.js",
            dest: "deploy-local/js/plugins/lists/plugin.min.js"
          },
          {
            src: "scratch/inline/theme.js",
            dest: "deploy-local/js/mobile_theme.js"
          },
          {
            src: "index.html",
            dest: "deploy-local/index.html"
          }

        ]
      }
    },

    eslint: {
      options: {
        config: "../../../.eslintrc"
      },

      src: [
        "src"
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

      "standalone": {
        files: [
          {
            src: "deploy-local/js/mobile_theme.js",
            dest: "deploy-local/js/mobile_theme.min.js"
          }
        ]
      },

      "theme": {
        files: [
          {
            src: "scratch/inline/theme.js",
            dest: "dist/inline/theme.min.js"
          }
        ]
      }
    },
    less: {
      development: {
        options: {
          plugins : [ new (require('less-plugin-autoprefix'))({browsers : [ "last 2 versions" ]}) ],
          compress: true,
          yuicompress: true,
          sourceMap: true,
          optimization: 2
        },
        files: {
          "src/main/css/mobile.css": "src/main/css/app/mobile-less.less" // destination file and source file
        }
      }
    },
    watch: {
      styles: {
        files: ['src/main/css/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true,
          atBegin: true
        }
      },
      build: {
        files: ['src/**/**.js'],
        tasks: [ 'bolt-build' ]
      },
      tests: {
        files: ['src/**/**.js'],
        tasks: [ 'bolt-test:atomic', 'bedrock-auto:phantomjs' ]
      }
    }
  });

  grunt.task.loadTasks("../../../node_modules/@ephox/bolt/tasks");
  grunt.task.loadTasks("../../../node_modules/@ephox/bedrock/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-copy/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-eslint/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-less/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-watch/tasks");

  grunt.registerTask("default", ["bolt-init", "bolt-build", "copy", "eslint", "uglify:theme"]);
  grunt.registerTask("atomic-tests", ["bolt-build", "bolt-test:atomic"]);
  grunt.registerTask("phantom-tests", ["bedrock-auto:phantomjs"]);
  grunt.registerTask("chrome-tests", ["bedrock-auto:chrome"]);
  grunt.registerTask("tests", ["bolt-test:atomic", "bedrock-auto:phantomjs", "bedrock-auto:chrome"]);
  grunt.registerTask("browser-tests", ["bedrock-manual"]);
  grunt.registerTask("standalone", [ "bolt-build", "copy:standalone", "uglify:standalone"]);
};
