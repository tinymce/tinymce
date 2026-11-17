const fs = require('node:fs');
const path = require('node:path');
const { default: DtsCreator } = require('typed-css-modules');

module.exports = function(grunt) {

  grunt.registerTask('generateClassDefinitions', function() {

    const done = this.async();
    let creator = new DtsCreator();

    const directory = './build';

    // build/custom-properties holds generateCustomProperties output, not skins
    const files = fs.readdirSync(directory, {
      recursive: true,
    }).filter(file => !file.startsWith('custom-properties' + path.sep));

    let processed = 0;

    files.forEach(file => {
      if (file.endsWith('.css')) {
        creator.create(path.join(directory, file)).then(content => {
          let result = 'export interface Classes {\n';
          content.tokens.forEach((token) => {
            result += `  "${token}": string;\n`;
          });
          result += '};\n';
          fs.writeFileSync(path.join(directory, file.replace('.css', '.ts')), result);
          processed++;
        }).catch(err => {
          grunt.log.error(`Error creating CSS module for ${file}:`, err);
          return done(false)
        });
      }
    });
    if(processed === files.length) {
      done();
    }
  })
}
