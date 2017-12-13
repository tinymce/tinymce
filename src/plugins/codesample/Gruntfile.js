/*eslint-env node */


var pluginGrunt = require('../../../tools/modules/plugin-grunt');
var path = require('path');

var extraCopy = {
  copy: {
    "prism_css": {
      files: [
        {
          src: "src/main/css/prism.css",
          dest: "dist/codesample/css/prism.css"
        }
      ]
    }
  }
};

module.exports = pluginGrunt(path.basename(__dirname), extraCopy);