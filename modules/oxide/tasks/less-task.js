const less = require('less');
const fs = require('node:fs');
const path = require('path');
const LessPluginPresetEnv = require('less-plugin-preset-env');

const presetEnv = new LessPluginPresetEnv({
  browsers: ['last 2 Safari versions', 'last 2 iOS major versions', 'last 2 Chrome versions', 'Firefox ESR'],
  grid: 'no-autoplace'
});

module.exports = function (grunt) {

  // Read package data and set build version
  grunt.registerTask('compileLess', 'Compile LESS files', function() {
    const done = this.async();
    const opts = {
      relativeUrls: true,
      math: 'always',
      plugins: [ presetEnv ],
      paths: ['./src/less/skins'] // Define the path(s) where LESS should look for files
    };

    const files = grunt.file.expand({cwd: './src/less/skins'}, '**/*.less');
    let processed = 0;

    files.forEach(function(file) {
      const srcPath = path.join('./src/less/skins', file);
      const destPath = path.join('./build/skins/', file.replace(/\.less$/, '.css'));
      opts.filename = srcPath; // Set the filename option

      fs.readFile(srcPath, 'utf8', function(err, data) {
        if (err) {
          grunt.log.error(err);
          return done(false);
        }

        less.render(data, opts).then(function(output) {
          grunt.file.write(destPath, output.css);
          processed++;

          if (processed === files.length) {
            done();
          }
        }, function(err) {
          grunt.log.error(err);
          done(false);
        });
      });
    });
  });
}
