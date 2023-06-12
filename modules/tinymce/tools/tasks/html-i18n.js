const fs = require('fs');
const path = require('path');
const util = require('util');

const resourceBase = 'tinymce.html-i18n';

const instances = {
  'help-keynav': {
    srcDir: 'src/plugins/help/i18n/keynav',
    outputDir: 'src/plugins/help/main/js/i18n/keynav'
  }
};

const findFiles = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir) : [];

const createTinyMCEJs = (translation, resourceName) =>
  `tinymce.Resource.add('${resourceName}',\n${util.inspect(translation)});`

const generate = (grunt, srcDir, outputDir, resourcePrefix) => {
  findFiles(srcDir).forEach((file) => {
    const langCode = file.replace(path.extname(file), '');
    const translation = fs.readFileSync(path.join(srcDir, file), 'utf8');
    const content = createTinyMCEJs(translation, `${resourcePrefix}.${langCode}`);
    grunt.file.write(path.join(outputDir, `${langCode}.js`), content);
  });
};

module.exports = function (grunt) {
  grunt.registerTask("html-i18n", "Register html translation files", function () {
    Object.entries(instances).forEach(([ identifier, { srcDir, outputDir } ]) => {
      grunt.log.writeln(`Generating ${identifier} translation files`);
      generate(grunt, srcDir, outputDir, `${resourceBase}.${identifier}`);
    });
  });
}
