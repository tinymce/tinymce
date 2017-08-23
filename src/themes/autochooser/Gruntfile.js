/*eslint-env node */

module.exports = function (grunt) {
  var fs = require('fs');
  var version = fs.readFileSync('../mobile/version.txt', "UTF-8");

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
        main: "tinymce.themes.autochooser.Theme",
        filename: "theme",

        generate_inline: true,
        minimise_module_names: true,

        files: {
          src: ["src/main/js/Theme.js"]
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
            src: ['../mobile/src/main/css/**'],
            dest: 'deploy-local/skins/lightgray',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: ['../mobile/src/main/icons/**'],
            dest: 'deploy-local/skins/icons',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: false,
            cwd: '../../skins/lightgray/dist/lightgray',
            src: ['**/**'],
            dest: 'deploy-local/skins/lightgray'
          },
          {
            src: "../../../js/tinymce/tinymce.min.js",
            dest: "deploy-local/tinymce.min.js"
          },
          {
            src: "../../../js/tinymce/plugins/lists/plugin.min.js",
            dest: "deploy-local/plugins/lists/plugin.min.js"
          },
          {
            src: "../../../js/tinymce/plugins/autolink/plugin.min.js",
            dest: "deploy-local/plugins/autolink/plugin.min.js"
          },
          {
            src: "../../../js/tinymce/plugins/autosave/plugin.min.js",
            dest: "deploy-local/plugins/autosave/plugin.min.js"
          },
          {
            src: "scratch/inline/theme.js",
            dest: "deploy-local/themes/autochooser/theme.js"
          },
          {
            src: "index.html",
            dest: "deploy-local/index.html"
          },
          {
            src: "index-bootstrap.html",
            dest: "deploy-local/index-bootstrap.html"
          }
          
        ]
      }
    },

    replace: {
      "standalone": {
        options: {
          patterns: [
            {
              match: 'MOBILE_THEME_VERSION',
              replacement: version.trim()
            }
          ]
        },
        files: [
          {
            src: "deploy-local/themes/autochooser/theme.js",
            dest: "deploy-local/themes/autochooser/theme.js"
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
            src: "deploy-local/themes/autochooser/theme.js",
            dest: "deploy-local/themes/autochooser/theme.min.js"
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
    }
  });

  grunt.task.loadTasks("../../../node_modules/@ephox/bolt/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-copy/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-eslint/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-replace/tasks");

  grunt.registerTask("default", ["bolt-init", "bolt-build", "copy", "eslint", "uglify:theme"]);
  grunt.registerTask("standalone", [ "bolt-build", "copy:standalone", "replace:standalone", "uglify:standalone"]);
};
