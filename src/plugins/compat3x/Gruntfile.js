/*eslint-env node */

module.exports = function (grunt) {
  grunt.initConfig({
    copy: {
      "plugin": {
        files: [
          { expand: true, cwd: 'src/main', src: ['img/**'], dest: 'dist/compat3x' },
          { expand: true, cwd: 'src/main', src: ['css/**'], dest: 'dist/compat3x' },
          { expand: true, cwd: 'src/main/js', src: ['utils/**', 'plugin.js', 'tiny_mce_popup.js'], dest: 'dist/compat3x' }
        ]
      }
    },

    uglify: {
      options: {
        output: {
          ascii_only: true
        },
        ie8: true
      },

      "plugin": {
        files: [
          {
            src: "src/main/js/plugin.js",
            dest: "dist/compat3x/plugin.min.js"
          }
        ]
      }
    }
  });

  grunt.task.loadTasks("../../../../node_modules/grunt-contrib-copy/tasks");
  grunt.task.loadTasks("../../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../../node_modules/grunt-eslint/tasks");

  grunt.registerTask("default", ["copy", 'uglify']);
};