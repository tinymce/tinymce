var iconPackager = require('@ephox/oxide-icons-tools').iconPackager;

module.exports = function (grunt) {
  grunt.loadTasks('./tasks');

  grunt.initConfig({
    // Clean specified directories
    clean: {
      dist: ['./dist'],
    }
  });

  // load local grunt tasks
  require('load-grunt-tasks')(grunt);
  // load all grunt tasks from the parent config
  require('load-grunt-tasks')(grunt, {
    config: '../../package.json',
    pattern: ['grunt-*']
  });
  grunt.registerTask('icon-packager', function () {
    return grunt.src('src/svg/**/*.svg')
      .pipe(iconPackager({
        name: 'default'
      }))
      .pipe(grunt.dest('dist'));
  });

  grunt.reg('clean', function () {
    return grunt.src('./dist', {
      read: false,
      allowEmpty: true,
    }).pipe(clean());
  });

  grunt.registerTask("build", [
    "clean",
    "stylelint",
    "compileLess",
    "cssmin",
    "generateJsSkins"
  ]);
  grunt.registerTask('default', ['clean', 'icon-packager']);
};
