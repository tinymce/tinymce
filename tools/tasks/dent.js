var child_process = require('child_process');
var path = require('path');

var shell = function (cmd) {
    child_process.execSync(cmd, {stdio: [0, 1, 2]});
};

module.exports = function(grunt) {
	grunt.registerMultiTask("dent", "Executes dent each directory", function() {
		var target = grunt.config([this.name, this.target]);
		var options = target.options || {};
		var dirs = options.dirs || [];
		var startDir = process.cwd();

		dirs.forEach(function (dentDir, i) {
			grunt.log.writeln('\nRunning dent in: ' + dentDir);
			process.chdir(path.join(startDir, dentDir));
			shell("dent");
		});

		process.chdir(startDir);
	});
};
