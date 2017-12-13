/*eslint-env node */
var pluginGrunt = require('../../../tools/modules/plugin-grunt');
var path = require('path');

var extraCopy = {
  copy: {
    "emoticons": {
      files: [
        {
          src: "scratch/inline/plugin.raw.js",
          dest: "dist/emoticons/plugin.js"
        },

        {
          flatten: true,
          expand: true,
          cwd: "src/main/img",
          src: "*.gif",
          dest: "dist/emoticons/img/"
        }
      ]
    }
  }
};

module.exports = pluginGrunt(path.basename(__dirname), extraCopy);