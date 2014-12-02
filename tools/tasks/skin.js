/**
 * Task for creating a skin.dev.less files for each of the skin directories located in the path. It will automatically import
 * the used less files based on the JS components found in the importFrom file. It will look for -x-less JSDoc comments and include
 * these into the output less file.
 */

var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {
	/**
	 * Compiles a less file with imports for all the specified paths.
	 */
	function compileLessFile(paths, lessFilePath) {
		var lessImportCode = "";

		paths.forEach(function(filePath) {
			lessImportCode += '@import "' + filePath + '";\n';
		});

		fs.writeFileSync(lessFilePath, lessImportCode);
	}

	/**
	 * Parses the JS doc comments for -x-less items and include returns them as an array.
	 */
	function parseLessDocs(filePath) {
		var matches, docCommentRegExp = /\/\*\*([\s\S]+?)\*\//g, lessFiles = [];
		var source = grunt.file.read(filePath).toString();

		for (matches = docCommentRegExp.exec(source); matches; matches = docCommentRegExp.exec(source)) {
			var docComment = matches[1];

			var lessMatch = /\@\-x\-less\s+(.+)/g.exec(docComment);
			if (lessMatch) {
				lessFiles.push(lessMatch[1]);
			}
		}

		return lessFiles;
	}

	grunt.registerMultiTask("skin", "Creates skin less files out of registred UI components.", function() {
		var options = grunt.config([this.name, this.target]).options;

		fs.readdirSync(options.path).forEach(function(dirName) {
			var skinDirPath = path.join(options.path, dirName);

			if (fs.statSync(skinDirPath).isDirectory()) {
				var lessFiles = options.prepend || [];

				if (options.importFrom) {
					lessFiles = lessFiles.concat(parseLessDocs(options.importFrom));
				}

				if (options.append) {
					lessFiles = lessFiles.concat(options.append);
				}

				compileLessFile(lessFiles, path.join(skinDirPath, 'skin' + (options.ext || '.dev.less')));
			}
		});
	});
};
