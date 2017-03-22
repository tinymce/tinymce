var child_process = require('child_process');


var shell = function (cmd) {
  child_process.execSync(cmd, { stdio: [0, 1, 2] });
};

module.exports = function (grunt) {
  grunt.registerMultiTask("bedrock", "Executes bedrock tests", function () {
    var target = grunt.config([this.name, this.target]);
    var options = target.options || {};
    var testsDirs = options.testdirs.filter(function (dirPath) {
      return grunt.file.exists(dirPath);
    });

    var params = [
      '-c ' + options.config,
      '--testdirs ' + testsDirs.join(' ')
    ].join(' ');

    shell("bedrock " + params);
  });
};
