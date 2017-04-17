/*eslint-env node */

module.exports = function (grunt) {
  grunt.initConfig({
    "bolt-init": {
      "core": {
        config_dir: "config/bolt"
      }
    },

    "bolt-build": {
      "core": {
        config_js: "config/bolt/prod.js",
        output_dir: "scratch",
        main: "tinymce.core.api.Main",
        filename: "tinymce",

        generate_inline: true,
        minimise_module_names: true,

        files: {
          src: ["src/main/js/api/Main.js"]
        }
      },

      "jquery-plugin": {
        config_js: "config/bolt/prod.js",
        output_dir: "scratch",
        main: "tinymce.core.JqueryIntegration",
        filename: "jquery.tinymce",

        generate_inline: true,
        minimise_module_names: true,

        files: {
          src: ["src/main/js/JqueryIntegration.js"]
        }
      }
    },

    copy: {
      "core": {
        files: [
          {
            src: "scratch/inline/tinymce.raw.js",
            dest: "dist/tinymce/tinymce.js"
          },

          {
            src: "src/main/text/readme_lang.md",
            dest: "dist/tinymce/langs/readme.md"
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

      "tinymce": {
        files: [
          {
            src: "scratch/inline/tinymce.js",
            dest: "dist/tinymce/tinymce.min.js"
          },

          {
            src: "scratch/inline/jquery.tinymce.js",
            dest: "dist/tinymce/jquery.tinymce.min.js"
          }
        ]
      }
    },

    "globals": {
      options: {
        outputDir: 'dist/globals',
        templateFile: 'src/main/js/api/ResolveGlobal.js'
      }
    }
  });

  grunt.task.loadTasks("../../node_modules/@ephox/bolt/tasks");
  grunt.task.loadTasks("../../node_modules/grunt-contrib-copy/tasks");
  grunt.task.loadTasks("../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../node_modules/grunt-eslint/tasks");
  grunt.task.loadTasks("../../tools/tasks");

  grunt.registerTask("default", ["bolt-init", "bolt-build", "globals", "copy", "eslint", "uglify"]);
};