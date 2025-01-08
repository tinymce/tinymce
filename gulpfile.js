'use strict';

var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const connect = require("gulp-connect");

gulp.task('tinymce:minify', function () {
  return gulp.src([
    './js/tinymce/tinymce.min.js',
    './js/tinymce/plugins/autolink/plugin.min.js',
    './js/tinymce/plugins/autoresize/plugin.min.js',
    './js/tinymce/plugins/lists/plugin.min.js',
    './js/tinymce/plugins/image/plugin.min.js',
    './js/tinymce/plugins/nonbreaking/plugin.min.js',
    './js/tinymce/plugins/visualchars/plugin.min.js',
    './js/tinymce/plugins/charmap/plugin.min.js',
    './js/tinymce/plugins/emoticons/plugin.min.js',
    './js/tinymce/plugins/link/plugin.min.js',
    './js/tinymce/plugins/code/plugin.min.js',
    './js/tinymce/themes/silver/theme.min.js',
    './js/tinymce/icons/default/icons.min.js',
    './js/tinymce/icons/teamup_icons/icons.js',
    './teamuplinknewtab/dist/teamuplinknewtab/plugin.min.js',
    './js/tinymce/langs/en_GB.js',
    './js/tinymce/langs/cs.js',
    './js/tinymce/langs/da.js',
    './js/tinymce/langs/de.js',
    './js/tinymce/langs/es.js',
    './js/tinymce/langs/fi.js',
    './js/tinymce/langs/fr.js',
    './js/tinymce/langs/hr.js',
    './js/tinymce/langs/it.js',
    './js/tinymce/langs/hu.js',
    './js/tinymce/langs/ja_JP.js',
    './js/tinymce/langs/nl.js',
    './js/tinymce/langs/nb.js',
    './js/tinymce/langs/pl.js',
    './js/tinymce/langs/pt_PT.js',
    './js/tinymce/langs/ro.js',
    './js/tinymce/langs/ru_RU.js',
    './js/tinymce/langs/sk.js',
    './js/tinymce/langs/sl.js',
    './js/tinymce/langs/sr.js',
    './js/tinymce/langs/sv.js',
    './js/tinymce/langs/tr.js',
    './js/tinymce/langs/zh_CN.js',
    './js/tinymce/langs/zh_TW.js'
  ])
    .pipe(concat('tinymce.full.js'))
    .pipe(minify())
    .pipe(gulp.dest('./js/tinymce/'));
});

gulp.task('tinymce:style-theme-oxide', function () {
  return gulp.src(['./modules/oxide/build/skins/**/*.css', '!**/*.min.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ rebase: false }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js/tinymce/skins'))
    .pipe(connect.reload());
});

gulp.task('tinymce:minify-oxide', function () {
  return gulp.src(['./js/tinymce/skins/**/*.css'])
    .pipe(cleanCSS({ rebase: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js/tinymce/skins'))
    .pipe(connect.reload());
});
