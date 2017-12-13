/*eslint-env node */
var pluginGrunt = require('../../../tools/modules/plugin-grunt');
var path = require('path');

var extraCopy = {
  copy: {
    "logo": {
      files: [
        {
          flatten: true,
          expand: true,
          cwd: "src/main/img",
          src: "logo.png",
          dest: "dist/help/img/"
        }
      ]
    }
  }
};

module.exports = pluginGrunt(path.basename(__dirname), extraCopy);