const fs = require('node:fs');

module.exports = function (grunt) {

  grunt.registerTask('generateJsSkins', function(){
    const done = this.async();
    const opts = {
      relativeUrls: true,
      paths: ['./build/skins'] // Define the path(s) where LESS should look for files
    };
    const files = grunt.file.expand({cwd: './build/skins' }, '**/*.min.css');
    let processed = 0;
    files.forEach(function(file) {
      const srcPath = './build/skins/' + file;
      const destPath = './build/skins/' + file.replace(/\.min.css$/, '.js');
      opts.filename = srcPath; // Set the filename option

      fs.readFile(srcPath, 'utf8', function(err, data) {
        if (err) {
          grunt.log.error(err);
          return done(false);
        }

        const fileLines = data.split("\n");
        // Check if the minified CSS file has more than 2 lines
        // Line 1: The minified CSS content
        // Line 2: The sourcemap comment, eg: (/*# sourceMappingURL=content.min.css.map */)
        if (fileLines.length > 2) {
          grunt.fail.fatal(`Failed to create JS resource for ${srcPath}. Expected minified CSS contains ${fileLines.length} lines instead of the expected 2 or fewer.`);
        }
        const content = `tinymce.Resource.add('${file.replace(/\.min.css$/, '.css')}', \`${fileLines[0]}\`)`
        grunt.file.write(destPath, content);
        processed++;

        if (processed === files.length) {
          done();
        };
      });
    });
  });
}
