var child_process = require('child_process');
var path = require('path');
var fs = require('fs');

var shell = function (cmd) {
    child_process.execSync(cmd, {stdio: [0, 1, 2]});
};

module.exports = function(grunt) {
	grunt.registerMultiTask("bedrock", "Executes bedrock tests", function() {
		var target = grunt.config([this.name, this.target]);
		var options = target.options || {};

		var params = [
			'-c ' + options.config,
			'--testdirs ' + options.testdirs.join(' ')
		].join(' ');

		shell("bedrock " + params);
	});
};
