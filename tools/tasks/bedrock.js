var child_process = require('child_process');
var path = require('path');
var fs = require('fs');

var shell = function (cmd) {
    child_process.execSync(cmd, {stdio: [0, 1, 2]});
};

var validateTestDirs = function (testdirs) {
	testdirs.forEach(function (dir) {
		var dirPath = path.join(dir + '/../..');
		var libPath = dirPath + '/lib';

		if (!fs.existsSync(libPath)) {
			throw new Error(
				'\n"' + libPath + '" is not a directory, did you dent? \n\n' +
				'Run this to dent: \n' +
				'  grunt dent\n\n');
		}
	});
};

module.exports = function(grunt) {
	grunt.registerMultiTask("bedrock", "Executes bedrock tests", function() {
		var target = grunt.config([this.name, this.target]);
		var options = target.options || {};

		validateTestDirs(options.testdirs);

		var params = [
			'-c ' + options.config,
			'--testdirs ' + options.testdirs.join(' ')
		].join(' ');

		shell("bedrock " + params);
	});
};
