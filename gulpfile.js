var verifyComposition = require('@ephox/oxide-icons-tools/oxide-verify-composition');
var svgo = require('@ephox/oxide-icons-tools/oxide-svgo');
var eventStream = require('event-stream');
var ts = require('gulp-typescript');
var inject = require('gulp-inject');
var rename = require("gulp-rename");
var clean = require('gulp-clean');
var cat = require('gulp-cat');
var path = require('path');
var gulp = require('gulp');


gulp.task('clean', function () {
  return gulp.src(['./dist', './scratch'], {
    read: false,
    allowEmpty: true,
  })
  .pipe(clean());
});

gulp.task('minify', function () {
  return gulp.src('src/svg/**/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('scratch/minifiedSvgs'));
});

gulp.task('verifyComposition', function () {
  return gulp.src('src/svg/**/*.svg')
  .pipe(verifyComposition())
  .pipe(cat());
});

gulp.task('IconsHtml', function () {
  return gulp.src('./src/templates/Icons.html')
  .pipe(svgHtmlInjector())
  .pipe(gulp.dest('dist/html'));
});

gulp.task('TinymceIcons', function () {
  return gulp.src('./src/templates/TinymceIcons.js')
  .pipe(svgJsInjector())
  .pipe(gulp.dest('dist/js'));
});

gulp.task('IconsTs', function () {
  var populated = gulp.src('./src/templates/Icons.ts').pipe(svgJsInjector());
  return eventStream.merge(
    populated.pipe(ts({ module: 'commonjs', "lib": ["es2015"] })).pipe(rename('IconsCjs.js')),
    populated.pipe(ts({ module: 'es2015', "declaration": true, "lib": ["es2015"] }))
  ).pipe(gulp.dest('dist/js'));
});

gulp.task('Main', function () {
  return gulp.src('./src/templates/Main.ts')
    .pipe(ts({ module: 'es2015', "declaration": true, "lib": ["es2015"] }))
    .pipe(gulp.dest('dist/js'));
});

function svgJsInjector () {
  return inject(gulp.src(['./scratch/minifiedSvgs/*.svg']), {
    starttag: '/* start-icon-inject */',
    endtag: '/* end-icon-inject */',
    removeTags: true,
    transform: function (filepath, file) {
      var name = path.parse(file.basename).name;
      var content = file.contents.toString();
      return `  '${name}': '${content}',\n`;
    }
  });
}

function svgHtmlInjector () {
  return inject(gulp.src(['./scratch/minifiedSvgs/*.svg']), {
    starttag: '<!-- start-icon-inject -->',
    endtag: '<!-- end-icon-inject -->',
    removeTags: true,
    transform: function (filepath, file) {
      var name = path.parse(file.basename).name;
      var content = file.contents.toString();
      return `  <article title="${name}">\n    ${content}\n  </article>\n\n`;
    }
  });
}

gulp.task('inject', gulp.parallel(['IconsHtml', 'IconsTs', 'TinymceIcons']));

gulp.task('default', gulp.series('clean', 'minify', 'verifyComposition', 'Main', 'inject'));