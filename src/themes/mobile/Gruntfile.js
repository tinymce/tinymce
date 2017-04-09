/*eslint-env node */

module.exports = function (grunt) {
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
    }
  });

  grunt.task.loadTasks("../../../node_modules/@ephox/bolt/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-copy/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-eslint/tasks");

  grunt.registerTask("default", ["bolt-init", "bolt-build", "copy", "eslint", "uglify:theme"]);
  grunt.registerTask("standalone", [ "bolt-build", "copy:standalone", "uglify:standalone"]);
};
