var iconPackager = require('@ephox/oxide-icons-tools').iconPackager;
var clean = require('gulp-clean');
var gulp = require('gulp');

gulp.task('icon-packager', function () {
  return gulp.src('src/svg/**/*.svg')
    .pipe(iconPackager({
      name: 'default'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return gulp.src('./dist', {
    read: false,
    allowEmpty: true,
  }).pipe(clean());
});

gulp.task('default', gulp.series('clean', 'icon-packager'));
module.exports = function (grunt) {
  grunt.loadTasks('./tasks');

  grunt.initConfig({
    // Clean specified directories
    clean: {
      dist: ['./dist'],
    },
    // Minify CSS files
    cssmin: {
      options: {
        rebase: false,
        sourceMap: true,
      },
      target: {
        files: [{
          expand: true,
          cwd: './build/skins',
          src: ['**/*.css', '!**/*.min.css'],
          dest: './dist',
          ext: '.min.css',
          extDot: 'last'
        }]
      }
    },
    // Watch files for changes and run tasks
    watch: {
      less: {
        files: './src/**/*.less',
        tasks: ['compileLess', 'cssmin']
      },
      html: {
        files: './src/demo/*.html',
        options: {
          livereload: true
        }
      },
      build: {
        files: './build/**/*.*',
        options: {
          livereload: true
        }
      }
    },
  });

  // load local grunt tasks
  require('load-grunt-tasks')(grunt);
  // load all grunt tasks from the parent config
  require('load-grunt-tasks')(grunt, {
    config: '../../package.json',
    pattern: ['grunt-*']
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
