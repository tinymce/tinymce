var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var lessAutoprefix = require('less-plugin-autoprefix');
var gulpStylelint = require('gulp-stylelint');
var browserSync = require('browser-sync').create();
var variablesOutput = require('less-plugin-variables-output');
var concat = require('gulp-concat');
var fileinclude = require('gulp-file-include');
var shell = require('gulp-shell');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
const runBackstopCommand = require('./tools/tasks/run_backstop');

var autoprefix = new lessAutoprefix({ browsers: ['IE 11', 'last 2 Safari versions', 'iOS 9.0', 'last 2 Chrome versions', 'Firefox ESR'] });
var exportLessVariablesToJson = new variablesOutput({filename: 'build/skin/less-variables.json'});

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
      plugins: [autoprefix, exportLessVariablesToJson]
    }).on('error', function(err) {
      console.error(err.message);
      browserSync.notify(err.message, 5000); // Display error in the browser
      this.emit('end'); // Prevent gulp from catching the error and exiting the watch process
    }))
    .pipe(gulp.dest('./build/skins/'))
    .pipe(browserSync.stream());
});

//
// Minify CSS
//
gulp.task('minify-css', function() {
  return gulp.src(['./build/skins/oxide*/*.css', '!**/*.min.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ rebase: false }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/skins'));
});

//
// Build HTML
//
gulp.task('buildHtml', function() {
  // Build HTML
  return gulp.src(['./src/demo/**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./build'));
});

//
// Copy Files
//
gulp.task('copyFilesA', function() {
  return gulp.src(['./src/demo/styles.css', './src/demo/scripts.js'])
    .pipe(gulp.dest('./build'));
});

gulp.task('copyFilesB', function() {
  return gulp.src(['./src/demo/skin/*.less', './src/demo/skin/*.css', './src/demo/skin/*.js'])
    .pipe(gulp.dest('./build/skin'));
});

gulp.task('copyFilesC', function() {
  return gulp.src(['./src/less/theme/**'])
    .pipe(gulp.dest('./build/skin/theme/'));
});

gulp.task('copyFilesD', function() {
  return gulp.src(['./src/demo/editors/*.js'])
    .pipe(gulp.dest('./build/editors/'));
});

//
// Concat icon packs and copy iconManager
//
gulp.task('setupIconManager', function() {
  return gulp.src([ 'src/demo/iconManager.js', './node_modules/@ephox/oxide-icons-*/dist/js/TinymceIcons.js' ])
    .pipe(concat('iconManager.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('copyFiles', gulp.series('copyFilesA', 'copyFilesB', 'copyFilesC', 'copyFilesD', 'setupIconManager'));

//
// Browsersync
//
gulp.task('serve', function() {
  browserSync.init({
    server: './build',
    ghostMode: false, // prevent scrolls and clicks between browsers
    open: false // Don't open a browser by default.
  });

  gulp.watch('./src/**/*.less', gulp.series('lint', 'copyFilesC', 'less', 'minify-css'));
  gulp.watch('./src/demo/**/*.html', gulp.series('buildHtml', 'copyFiles'));
  gulp.watch(['./src/demo/**/*.css', './src/demo/**/*.js'], gulp.series('buildHtml', 'copyFiles'));
  gulp.watch('./build/**/*.*').on('change', browserSync.reload);
});

//
// clean builds
//
gulp.task('cleanBuild', function () {
  return gulp.src('./build', {
    read: false,
    allowEmpty: true,
  })
  .pipe(clean());
});


const packages = [
  '@ephox/oxide-icons-material',
  '@ephox/oxide-icons-jam'
];
gulp.task('getInternal',
  shell.task('npm install ' + packages.join(' ') + ' --no-save --registry http://nexus:8081/repository/npm-group/')
);

//
// clean tmp
//
gulp.task('cleanTmp', function () {
  return gulp.src('./tmp', {
    read: false,
    allowEmpty: true,
  })
  .pipe(clean());
});

gulp.task('backstop:test', (done) => {
  return runBackstopCommand(browserSync, done, 'test');
});

gulp.task('backstop:approve', (done) => {
  return runBackstopCommand(browserSync, done, 'approve');
});

gulp.task('backstop:reference', (done) => {
  return runBackstopCommand(browserSync, done, 'reference');
});


//
// clean all the things
//
gulp.task('clean', gulp.series('cleanBuild', 'cleanTmp'));

//
// Build project and watch LESS file changes
//
gulp.task('build', gulp.series('clean', 'buildHtml', 'lint', 'less', 'minify-css', 'copyFiles', 'setupIconManager'));
gulp.task('default', gulp.series('build', 'serve'));
