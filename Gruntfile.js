/*eslint-env node */

module.exports = function(grunt) {
  var packageData = grunt.file.readJSON('package.json');
  // var changelogLine = grunt.file.read('changelog.txt').toString().split('\n")[0];
  // var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');
  // packageData.date = /^Version [^\(]+\(([^\)]+)\)/.exec(changelogLine)[1];

  grunt.initConfig({
    pkg: packageData,

    'bedrock-auto': {
      'behaviours': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/behaviour',
        browser: 'chrome'
      }
      // "advlink-plugin": {
      //   config_js: "config/bolt/prod.js",
      //   output_dir: "scratch/advlink",
      //   main: "tinymce.plugins.advlink.Plugin",
      //   filename: "plugin",

      //   generate_inline: true,
      //   minimise_module_names: true,

      //   files: {
      //     src: ["src/main/js/tinymce/plugins/advlink/Plugin.js"]
      //   }
      // },

      // "silver-theme": {
      //   config_js: "config/bolt/prod.js",
      //   output_dir: "scratch/silver",
      //   main: "tinymce.themes.silver.Theme",
      //   filename: "theme",

      //   generate_inline: true,
      //   minimise_module_names: true,

      //   files: {
      //     src: ['src/main/js/tinymce/themes/silver/Theme.js']
      //   }
      // }
    },

    'bedrock-manual': {
      'behaviours': {
        config: 'config/bolt/browser.js',
        testdir: 'src/test/js/browser/behaviour',
        browser: 'chrome'
      }
      // "advlink-plugin": {
      //   config_js: "config/bolt/prod.js",
      //   output_dir: "scratch/advlink",
      //   main: "tinymce.plugins.advlink.Plugin",
      //   filename: "plugin",

      //   generate_inline: true,
      //   minimise_module_names: true,

      //   files: {
      //     src: ["src/main/js/tinymce/plugins/advlink/Plugin.js"]
      //   }
      // },

      // "silver-theme": {
      //   config_js: "config/bolt/prod.js",
      //   output_dir: "scratch/silver",
      //   main: "tinymce.themes.silver.Theme",
      //   filename: "theme",

      //   generate_inline: true,
      //   minimise_module_names: true,

      //   files: {
      //     src: ['src/main/js/tinymce/themes/silver/Theme.js']
      //   }
      // }
    },

    copy: {
      // "everything": {
      //   files: [
      //     {
      //       src: "scratch/advlink/inline/plugin.js",
      //       dest: "/home/morgan/work/tiny/tinymce/js/tinymce/plugins/advlink/plugin.js"
      //     },

      //     {
      //       src: "scratch/silver/inline/theme.js",
      //       dest: "/home/morgan/work/tiny/tinymce/js/tinymce/themes/silver/theme.js"
      //     }
      //   ]
      // }
    },

    watch: {
      everything: {
        files: ['src/**/*.js'],
        tasks: [

          'bedrock-auto:behaviours'
        ],
        options: {
          spawn: false
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);




  grunt.loadNpmTasks('@ephox/bolt');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('@ephox/bedrock');
};
