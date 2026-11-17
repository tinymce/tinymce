const less = require('less');
const fs = require('node:fs');
const path = require('path');

const { lessOptions } = require('../tools/less-options');

module.exports = function (grunt) {

  // Read package data and set build version
  grunt.registerTask('compileLess', 'Compile LESS files', function() {
    const done = this.async();
    const opts = lessOptions(['./src/less/skins']);

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
