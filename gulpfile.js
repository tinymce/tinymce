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

// windows doesn't add the lib subfolder to global prefixes
const lib = process.platform === 'win32' ? '' : 'lib/';

const browserSyncPath = `./scratch/tools/${lib}node_modules/browser-sync`;
const backstopJsPath = `./scratch/tools/${lib}node_modules/backstopjs`;

const browserSync = (() => {
  let browserSyncInstance;
  return () => {
    // must be lazy loaded otherwise browser-sync is required to run _any_ gulp task
    browserSyncInstance = browserSyncInstance || require(browserSyncPath).create();
    return browserSyncInstance;
  }
})();

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
// Compiling CSS for runtime demo (can this be combined with the above without depending on browsersync?)
//
gulp.task('less-serve', function() {
  return gulp.src('./src/less/skins/**/*.less')
    .pipe(less({
      relativeUrls: true,
      plugins: [autoprefix, exportLessVariablesToJson]
    }).on('error', function(err) {
      console.error(err.message);
      browserSync().notify(err.message, 5000); // Display error in the browser
      this.emit('end'); // Prevent gulp from catching the error and exiting the watch process
    }))
    .pipe(gulp.dest('./build/skins/'))
    .pipe(browserSync().stream());
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
  return gulp.src(['./src/demo/skin-tool/*.less', './src/demo/skin-tool/*.css', './src/demo/skin-tool/*.js'])
    .pipe(gulp.dest('./build/skin-tool'));
});

gulp.task('copyFilesC', function() {
  return gulp.src(['./src/less/theme/**'])
    .pipe(gulp.dest('./build/skin-tool/theme/'));
});

gulp.task('copyFilesD', function() {
  return gulp.src(['./src/demo/editor-demos/*.js'])
    .pipe(gulp.dest('./build/editor-demos/'));
});

//
// Concat icon packs and copy iconManager
//
gulp.task('setupIconManager', function() {
  return gulp.src([ 'src/demo/iconManager.js', './node_modules/@tinymce/oxide-icons-*/dist/icons/*/icons.js', './scratch/icons/**/dist/icons/*/icons.js' ])
    .pipe(concat('iconManager.js'))
    .pipe(gulp.dest('./build'));
});

const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
gulp.task('buildSkinSwitcher', (done) => {
  const uiSkins = getDirs('./build/skins/ui');
  const contentSkins = getDirs('./build/skins/content');
  const data = `uiSkins = ${JSON.stringify(uiSkins)}, contentSkins = ${JSON.stringify(contentSkins)}`;
  const html = fs.readFileSync('./build/index.html', 'utf8');
  fs.writeFileSync('./build/index.html', html.replace('/** ADD_DATA */', data));

  done();
});

gulp.task('copyFiles', gulp.series('copyFilesA', 'copyFilesB', 'copyFilesC', 'copyFilesD', 'setupIconManager'));

//
// Browsersync
//
gulp.task('serve', function() {
  browserSync().init({
    server: './build',
    ghostMode: false, // prevent scrolls and clicks between browsers
    open: false // Don't open a browser by default.
  });

  gulp.watch('./src/**/*.less', gulp.series('lint', 'copyFilesC', 'less-serve', 'minify-css'));
  gulp.watch('./src/demo/**/*.html', gulp.series('buildHtml', 'copyFiles', 'buildSkinSwitcher'));
  gulp.watch(['./src/demo/**/*.css', './src/demo/**/*.js'], gulp.series('buildHtml', 'copyFiles'));
  gulp.watch('./build/**/*.*').on('change', browserSync().reload);
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

const testDeps = ['backstopjs'];
const demoDeps = ['browser-sync'];
const iconPacks = [
  '@ephox/oxide-icons-material',
  '@ephox/oxide-icons-jam'
];

const installTools = (modules, prefix = '--prefix ./scratch/tools') => shell.task(`npm install -g --no-package-lock --no-save ${prefix} ${modules.join(' ')}`);

// cheating a bit, adding the registry to the prefix param
gulp.task('getInternal', installTools(iconPacks, '--prefix ./scratch/icons --registry http://nexus:8081/repository/npm-group/'));

gulp.task('getDemoDeps', installTools(demoDeps));

gulp.task('getTestDeps', installTools(testDeps.concat(demoDeps)));

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

const runBackstopCommand = (command) => {
  const runner = require('./tools/tasks/run_backstop');
  return (done) => {
    // must be lazy loaded otherwise backstop is required to run _any_ gulp task
    const backstop = require(backstopJsPath);
    runner(backstop, browserSync(), done, command)
  }
}

gulp.task('backstop:test', gulp.series('getTestDeps', runBackstopCommand('test')));

gulp.task('backstop:approve', gulp.series('getTestDeps', runBackstopCommand('approve')));

gulp.task('backstop:reference', gulp.series('getTestDeps', runBackstopCommand('reference')));

//
// clean all the things
//
gulp.task('clean', gulp.series('cleanBuild', 'cleanTmp'));

//
// Build project and watch LESS file changes
//
gulp.task('build', gulp.series('clean', 'buildHtml', 'lint', 'less', 'minify-css', 'copyFiles', 'setupIconManager', 'buildSkinSwitcher'));
gulp.task('default', gulp.series('build', 'getDemoDeps', 'serve'));
