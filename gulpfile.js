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