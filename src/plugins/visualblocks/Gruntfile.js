/*eslint-env node */
var pluginGrunt = require('../../../tools/modules/plugin-grunt');
var path = require('path');

var extraCopy = {
  copy: {
    "visualblocks_css": {
      files: [
        {
          src: "src/main/css/visualblocks.css",
          dest: "dist/visualblocks/css/visualblocks.css"
        }
      ]
    }
  }
};

module.exports = pluginGrunt(path.basename(__dirname), extraCopy);