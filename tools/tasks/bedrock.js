var child_process = require('child_process');

var shell = function (cmd, args, callback) {
  var child = child_process.spawn(cmd, args, { stdio: [process.stdin, process.stdout, 'ignore'] });
  child.on('close', function (code) {
    callback();
  });
};

module.exports = function (grunt) {
  grunt.registerMultiTask("bedrock", "Executes bedrock tests", function () {
    var target = grunt.config([this.name, this.target]);
    var options = target.options || {};
    var testdirs = grunt.file.expand(options.testdirs);
    var done = this.async();

    if (options.mode === "manual") {
      shell(
        "bedrock",
        [
          '-c', options.config,
          '--testdirs'
        ].concat(testdirs),
        done
      );
    } else {
      shell(
        "bedrock-auto",
        [
          '-b', options.browser,
          '-c', options.config,
          '--totalTimeout 300000',
          '--singleTimeout 300000',
          '--testdirs'
        ].concat(testdirs),
        done
      );
    }
  });
};
