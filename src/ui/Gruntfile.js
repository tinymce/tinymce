/*eslint-env node */

module.exports = function (grunt) {
  grunt.initConfig({
    eslint: {
      options: {
        config: "../../.eslintrc"
      },

      src: [
        "src"
      ]
    }
  });

  grunt.task.loadTasks("../../node_modules/grunt-eslint/tasks");

  grunt.registerTask("default", ["eslint"]);
};
