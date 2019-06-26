var gulp = require('gulp');
var connect = require('gulp-connect');
var clean = require('gulp-clean');
var less = require('gulp-less');
var lessAutoprefix = require('less-plugin-autoprefix');
var gulpStylelint = require('gulp-stylelint');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var cp = require('child_process');
const fs = require('fs');
const path = require('path');

var autoprefix = new lessAutoprefix({ browsers: ['IE 11', 'last 2 Safari versions', 'iOS 9.0', 'last 2 Chrome versions', 'Firefox ESR'] });

//
// Lint less files using stylelint
//
gulp.task('lint', function() {
  return gulp.src('./src/less/**/*.less')
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});

//
// Build HTML demos
//
gulp.task('buildDemos', function() {
  return gulp.src(['./src/demo/**/*'])
    .pipe(gulp.dest('./build'));
});

// Generate list of available skins and content css:es to populate select field in index.html
const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
gulp.task('buildSkinSwitcher', (done) => {
  const uiSkins = getDirs(`./build/skins/ui`);
  const contentSkins = getDirs(`./build/skins/content`);
  const data = `uiSkins = ${JSON.stringify(uiSkins)}, contentSkins = ${JSON.stringify(contentSkins)}`;
  const html = fs.readFileSync('./build/index.html', 'utf8');
  fs.writeFileSync('./build/index.html', html.replace('/** ADD_DATA */', data));

  done();
});

//
// Build CSS
//
gulp.task('less', function() {
  return gulp.src('./src/less/skins/**/*.less')
    .pipe(less({
      relativeUrls: true,
      plugins: [autoprefix]
    }))
    .pipe(gulp.dest('./build/skins/'))
});

//
// Minify CSS
//
gulp.task('minifyCss', function() {
  return gulp.src(['./build/skins/**/*.css', '!**/*.min.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ rebase: false }))
    .pipe(header(fs.readFileSync('src/text/license-header.css', 'utf8')))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/skins'))
    .pipe(connect.reload());
});

//
// Copy icon font used by the mobile skin to each skin folder in /build
//
gulp.task('copyFonts', function() {
  let base = './build/skins/ui';

  return fs.readdirSync(base).reduce((stream, skin) => {
    return stream.pipe(gulp.dest(base + '/' + skin + '/fonts/'))
  }, gulp.src('./src/fonts/**'));
});

//
// watch and rebuild CSS for Oxide demos
//
gulp.task('monitor', function (done) {
  connect.server({
    root: './build',
    port: 3000,
    livereload: true
  }, function () { this.server.on('close', done) });

  gulp.watch('./src/**/*').on('change', gulp.series('css'));
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
gulp.task('css', gulp.series('lint', 'less', 'minifyCss'))
gulp.task('build', gulp.series('clean', 'css', 'copyFonts'));
gulp.task('default', gulp.series('build'));

gulp.task('demo-build', gulp.series('css', 'less', 'minifyCss', 'buildDemos', 'buildSkinSwitcher'))
gulp.task('watch', gulp.series('build', 'buildDemos', 'buildSkinSwitcher', 'monitor'));
