const gulpSvgroup = require('@ephox/svgroup/gulp-svgroup');
const svgroup = require('@ephox/svgroup');
var inject = require('gulp-inject');
var merge = require('merge-stream');
var clean = require('gulp-clean');
var svgo = require('gulp-svgo');
var gulp = require('gulp');

gulp.task('clean', function () {
  return gulp.src(['./dist', './scratch'], {
    read: false,
    allowEmpty: true,
  })
  .pipe(clean());
});

gulp.task('icons', () => {
  const minifiedIcons = gulp.src('src/svg/**/*.svg')
  .pipe(svgo({
    plugins: [{
      removeTitle: true
    }, {
      cleanupIDs: false
    }, {
      removeAttrs:{
        attrs: 'fill'
      }
    }]
  }));

  const iconsJs = minifiedIcons.pipe(gulpSvgroup({
    producer: svgroup.providerProducer,
    options: {
      filename: 'IconsRaw',
      normalizeKeys: false,
      quoteType: 'single',
      quoteKeys: true,
    }
  }))
  .pipe(gulp.dest('scratch'));

  const iconsPreview = minifiedIcons.pipe(gulpSvgroup({
    producer: svgroup.previewProducer,
    options: {
      filename: 'Icons.html',
      title: `Tiny Oxide Theme Icons`,
    }
  }))
  .pipe(gulp.dest('dist/html'));

  return merge(iconsJs, iconsPreview);
});

gulp.task('copy', () => {
  return gulp.src('./src/main/Main.ts')
  .pipe(gulp.dest('dist/ts'));
})

gulp.task('inject', () => {
  return gulp.src('./src/templates/Icons.ts')
  .pipe(inject(gulp.src(['./scratch/IconsRaw']), {
    starttag: '/* start-icon-inject */',
    endtag: '/* end-icon-inject */',
    removeTags: true,
    transform: (path, file) => {
      return file.contents.toString()
    }
  }))
  .pipe(gulp.dest('dist/ts'));
});

gulp.task('injectTinymce', () => {
  return gulp.src('./src/templates/TinymceIcons.js')
  .pipe(inject(gulp.src(['./scratch/IconsRaw']), {
    starttag: '/* start-icon-inject */',
    endtag: '/* end-icon-inject */',
    removeTags: true,
    transform: (path, file) => {
      return file.contents.toString()
    }
  }))
  .pipe(gulp.dest('dist/js'));
});

gulp.task('default', gulp.series('clean', 'icons', 'inject', 'injectTinymce', 'copy'));