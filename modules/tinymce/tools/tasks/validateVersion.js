/* eslint-env node */

var fs = require('fs');
var path = require('path');
var package = require(path.join(__dirname, '../../package.json'));

module.exports = function (grunt) {
  grunt.registerTask("validateVersion", "Check that version number in changelog and package.json match", function () {
    var changelog = fs.readFileSync(path.join(__dirname, '../../changelog.txt'));
    var changelogVersion = /Version ([0-9.]+)/.exec(changelog)[1];

    if (package.version !== changelogVersion) {
      grunt.fail.fatal(
        'Latest changelog version ' + changelogVersion +
        ' and package.json version ' + package.version +
        ' does not match.'
      );
    }
  });
};
