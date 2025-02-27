const fs = require('node:fs');
const path = require('path');
const connect = require('connect');
const liveReload = require('connect-livereload');
const serveStatic = require('serve-static');
const chalk = require("chalk");

module.exports = function (grunt) {
  grunt.registerTask('buildDemos', function() {
    grunt.file.copy('./src/demo/', './build/');
  });

  grunt.registerTask('copyTinymce', function() {
    if (fs.existsSync('../tinymce/js/tinymce/tinymce.min.js')) {
      grunt.file.copy('../tinymce/js/tinymce/', './build/tinymce/');
    } else {
      console.log(chalk.red('Local TinyMCE does not exist. Using cloud version instead'));
      console.log(chalk.yellow('Run yarn build in the repository root to build a local version of TinyMCE'));
      const url = 'https://cdn.tiny.cloud/1/qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc/tinymce/7-dev/tinymce.min.js';
      const html = fs.readFileSync('./build/index.html', 'utf8');
      fs.writeFileSync('./build/index.html', html.replace('/tinymce/tinymce.min.js', url));
    }
  });

  // Generate list of available skins and content css:es to populate select field in index.html
  const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
  grunt.registerTask('buildSkinSwitcher', function() {
    const uiSkins = getDirs(`./build/skins/ui`);
    const contentSkins = getDirs(`./build/skins/content`);
    const data = `uiSkins = ${JSON.stringify(uiSkins)}, contentSkins = ${JSON.stringify(contentSkins)}`;
    const html = fs.readFileSync('./build/index.html', 'utf8');
    fs.writeFileSync('./build/index.html', html.replace('/** ADD_DATA */', data));
  });

  grunt.registerTask('connect', 'Serve the skin and icon demos', function() {
    const port = 4000;
    grunt.log.writeln(`Starting static web server in on http://localhost:${port}`);
    const app = connect();

    app.use(liveReload());
    app.use('/tinymce', serveStatic('./build/tinymce'));
    app.use('/skins', serveStatic('./build/skins'));
    app.use(serveStatic('./build'));

    app.listen(port);
  });
}
