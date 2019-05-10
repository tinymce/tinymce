var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var lessAutoprefix = require('less-plugin-autoprefix');
var gulpStylelint = require('gulp-stylelint');
var variablesOutput = require('less-plugin-variables-output');
var concat = require('gulp-concat');
var fileinclude = require('gulp-file-include');
var header = require('gulp-header');
var shell = require('gulp-shell');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');

var autoprefix = new lessAutoprefix({ browsers: ['IE 11', 'last 2 Safari versions', 'iOS 9.0', 'last 2 Chrome versions', 'Firefox ESR'] });
var exportLessVariablesToJson = new variablesOutput({ filename: 'build/skin-tool/less-variables.json' });

//
// Lint less files using stylelint
//
gulp.task('lint', function() {
  return gulp.src('./src/less/**/*.less')
    .pipe(gulpStylelint({
      failAfterError: false,
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});

//
// Build CSS
//
gulp.task('less', function() {
  return gulp.src('./src/less/skins/**/*.less')
    .pipe(less({
      relativeUrls: true,
      plugins: [autoprefix, exportLessVariablesToJson]
    }))
    .pipe(gulp.dest('./build/skins/'))
});

//
// Minify CSS
//
gulp.task('minify-css', function() {
  return gulp.src(['./build/skins/**/*.css', '!**/*.min.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ rebase: false }))
    .pipe(header(fs.readFileSync('src/text/license-header.css', 'utf8')))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/skins'));
});

//
// watch and rebuild CSS for oxide demos (TODO move to oxide-test-data)
//
gulp.task('copyFilesTheme', function() {
  return gulp.src(['./src/less/theme/**'])
    .pipe(gulp.dest('./build/skin-tool/theme/'));
});

gulp.task('serve', function () {
  gulp.watch('./src/**/*.less', gulp.series('lint', 'copyFilesTheme', 'minify-css'));
});


//
// clean builds
//
gulp.task('clean', function () {
  return gulp.src('./build', {
    read: false,
    allowEmpty: true,
  })
  .pipe(clean());
});

//
// Build project and watch LESS file changes
//
gulp.task('build', gulp.series('clean', 'lint', 'less', 'minify-css'));
gulp.task('default', gulp.series('build'));

gulp.task('watch', gulp.series('build', 'copyFilesTheme', 'serve'));