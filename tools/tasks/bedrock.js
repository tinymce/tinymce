var child_process = require('child_process');

var shell = function (cmd) {
  child_process.execSync(cmd, { stdio: [0, 1, 2] });
};

module.exports = function (grunt) {
  grunt.registerMultiTask("bedrock", "Executes bedrock tests", function () {
    var target = grunt.config([this.name, this.target]);
    var options = target.options || {};
    var testdirs = grunt.file.expand(options.testdirs);

    if (options.mode === "manual") {
      shell("bedrock " + [
        '-c ' + options.config,
        '--totalTimeout 300000',
        '--testdirs ' + testdirs.join(' ')
      ].join(' '));
    } else {
      shell("bedrock-auto " + [
        '-b ' + options.browser,
        '-c ' + options.config,
        '--testdirs ' + testdirs.join(' ')
      ].join(' '));
    }
  });
};
