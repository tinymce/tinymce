/*eslint-env node */

var pluginGrunt = require('../../../tools/modules/plugin-grunt');
var path = require('path');

module.exports = pluginGrunt(path.basename(__dirname));