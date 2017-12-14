/*eslint-env node */
var themeGrunt = require('../../../tools/modules/theme-grunt');
var path = require('path');

module.exports = themeGrunt(path.basename(__dirname));