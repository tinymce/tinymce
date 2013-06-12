/**
 * Various build tools for Jake.
 */

/*jshint smarttabs:true, undef:true, node:true, latedef:true, curly:true, bitwise:true */
"use strict";

var fs = require("fs");
var path = require("path");
var child_process = require("child_process");

function extend(a, b) {
	if (b) {
		for (var name in b) {
			a[name] = b[name];
		}
	}

	return a;
}

function getFileModTime(filePath) {
	return fs.existsSync(filePath) ? fs.statSync(filePath).mtime.getTime() : 0;
}

function setFileModTime(filePath, time) {
	return fs.utimesSync(filePath, new Date(time), new Date(time));
}

exports.uglify = function(options) {
	var UglifyJS = require("uglify-js");
	var filePaths = [];

	options = extend({
		mangle : true,
		toplevel : false,
		no_functions : false,
		ascii_only: true
	}, options);

	var toFileModTime = getFileModTime(options.to);
	var fromFileModTime = 0;

	// Combine JS files
	if (options.from instanceof Array) {
		options.from.forEach(function(filePath) {
			if (options.sourceBase) {
				filePath = path.join(options.sourceBase, filePath);
			}

			filePaths.push(filePath);

			fromFileModTime = Math.max(fromFileModTime, getFileModTime(filePath));
		});
	} else {
		filePaths.push(options.from);
		fromFileModTime = getFileModTime(options.from);
	}

	if (options.force === true || fromFileModTime !== toFileModTime) {
		var result = UglifyJS.minify(filePaths, {
		});

		fs.writeFileSync(options.to, result.code);
		setFileModTime(options.to, fromFileModTime);
	}
};

exports.less = function (options) {
	var source = "", lastMod = 0, less = require('less');

	var sourceFile = options.from;
	var outputFile = options.toCss;

	options = extend({
		compress: true,
		yuicompress: true,
		optimization: 1,
		silent: false,
		paths: [],
		color: true,
		strictImports: false
	}, options);

	var parser = new less.Parser({
		paths: [options.baseDir || path.dirname(sourceFile)],
		filename: path.basename(sourceFile),
		optimization: options.optimization,
		strictImports: options.strictImports
	});

	// Parse one or multiple files
	if (sourceFile instanceof Array) {
		sourceFile.forEach(function(sourceFile) {
			lastMod = Math.max(lastMod, getFileModTime(path.join(options.baseDir, sourceFile)));
		});

		if (options.force !== true && lastMod === getFileModTime(outputFile)) {
			return;
		}

		sourceFile.forEach(function(sourceFile) {
			source += fs.readFileSync(path.join(options.baseDir, sourceFile), 'utf-8').toString().replace(/^\uFEFF/g, '');
		});

		if (options.toLess) {
			var lessImportCode = "";

			sourceFile.forEach(function(sourceFile) {
				lessImportCode += '@import "' + sourceFile + '";\n';
			});

			fs.writeFileSync(options.toLess, lessImportCode);
		}
	} else {
		lastMod = getFileModTime(sourceFile);
		if (options.force !== true && lastMod === getFileModTime(outputFile)) {
			return;
		}

		source = fs.readFileSync(sourceFile).toString();
	}

	parser.parse(source, function (err, tree) {
		if (err) {
			less.writeError(err, options);
			return;
		}

		fs.writeFileSync(outputFile, tree.toCSS({
			compress: options.compress,
			yuicompress: options.yuicompress
		}));

		setFileModTime(outputFile, lastMod);
	});
};

exports.yuidoc = function (sourceDir, outputDir, options) {
	var Y = require('yuidocjs');

	if (!(sourceDir instanceof Array)) {
		sourceDir = [sourceDir];
	}

	options = extend({
		paths: sourceDir,
		outdir: outputDir,
		time: false
	}, options);

	var starttime = new Date().getTime();
	var json = (new Y.YUIDoc(options)).run();

	var builder = new Y.DocBuilder(options, json);
	builder.compile(function() {
		var endtime = new Date().getTime();

		if (options.time) {
			Y.log('Completed in ' + ((endtime - starttime) / 1000) + ' seconds' , 'info', 'yuidoc');
		}
	});
};

exports.jshint = function (options) {
	var jshint = require('jshint').JSHINT, exclude;

	function removeComments(str) {
		str = str || "";
		str = str.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, "");
		str = str.replace(/\/\/[^\n\r]*/g, ""); // Everything after '//'

		return str;
	}

	options = options || {};

	var color = function(s, c){
		return (color[c].toLowerCase()||'') + s + color.reset;
	};

	color.reset = '\u001b[39m';
	color.red = '\u001b[31m';
	color.yellow = '\u001b[33m';
	color.green = '\u001b[32m';

	if (fs.existsSync(".jshintrc")) {
		options = extend(JSON.parse(removeComments("" + fs.readFileSync(".jshintrc"))), options);
	}

	if (options.exclude) {
		exclude = options.exclude;
		delete options.exclude;
	}

	function process(filePath) {
		var stat = fs.statSync(filePath);

		// Don't hint on minified files
		if (/\.min\.js$/.test(filePath)) {
			return;
		}

		if (exclude && exclude.indexOf(filePath) != -1) {
			return;
		}

		if (/\.js$/.test(filePath)) {
			if (!jshint(fs.readFileSync(filePath).toString(), options)) {
				// Print the errors
				console.log(color('Errors in file ' + filePath, 'red'));
				var out = jshint.data(),
				errors = out.errors;
				Object.keys(errors).forEach(function(error){
					error = errors[error];

					if (error) {
						console.log('line: ' + error.line + ':' + error.character+ ' -> ' + error.reason );
						console.log(color(error.evidence,'yellow'));
					}
				});
			}
		}
	}

	var patterns = options.patterns;
	delete options.patterns;
	patterns.forEach(function(filePath) {
		require("glob").sync(filePath).forEach(process);
	});
};

exports.zip = function (options) {
	var ZipWriter = require('moxie-zip').ZipWriter;
	var archive = new ZipWriter();

	function process(filePath, zipFilePath) {
		var args, stat = fs.statSync(filePath);

		zipFilePath = zipFilePath || filePath;
		filePath = filePath.replace(/\\/g, '/');
		zipFilePath = zipFilePath.replace(/\\/g, '/');

		if (options.pathFilter) {
			args = {filePath: filePath, zipFilePath: zipFilePath};
			options.pathFilter(args);
			zipFilePath = args.zipFilePath;
		}

		if (options.exclude) {
			for (var i = 0; i < options.exclude.length; i++) {
				var pattern = options.exclude[i];

				if (pattern instanceof RegExp) {
					if (pattern.test(filePath)) {
						return;
					}
				} else {
					if (filePath === pattern) {
						return;
					}
				}
			}
		}

		if (stat.isFile()) {
			var data = fs.readFileSync(filePath);

			if (options.dataFilter) {
				args = {filePath: filePath, zipFilePath: zipFilePath, data: data};
				options.dataFilter(args);
				data = args.data;
			}

			archive.addData(path.join(options.baseDir, zipFilePath), data);
		} else if (stat.isDirectory()) {
			fs.readdirSync(filePath).forEach(function(fileName) {
				process(path.join(filePath, fileName), path.join(zipFilePath, fileName));
			});
		}
	}

	options.baseDir = (options.baseDir || '').replace(/\\/g, '/');

	options.from.forEach(function(filePath) {
		if (filePath instanceof Array) {
			process(filePath[0], filePath[1]);
		} else {
			process(filePath);
		}
	});

	archive.saveAs(options.to);
};

exports.compileAmd = function (options) {
	//options.verbose = true;
	require("amdlc").compile(options);
};

exports.parseLessDocs = function (filePath) {
	var matches, docCommentRegExp = /\/\*\*([\s\S]+?)\*\//g, lessFiles = [];
	var source = fs.readFileSync(filePath).toString();

	for (matches = docCommentRegExp.exec(source); matches; matches = docCommentRegExp.exec(source)) {
		var docComment = matches[1];

		var lessMatch = /\@\-x\-less\s+(.+)/g.exec(docComment);
		if (lessMatch) {
			lessFiles.push(lessMatch[1]);
		}
	}

	return lessFiles;
};

exports.getReleaseDetails = function (filePath) {
	var firstLine = ("" + fs.readFileSync(filePath)).split('\n')[0];

	return {
		version: /^Version ([0-9xabrc.]+)/.exec(firstLine)[1],
		releaseDate: /^Version [^\(]+\(([^\)]+)\)/.exec(firstLine)[1]
	};
};

exports.instrumentFile = function(options) {
	var Instrument = require('coverjs').Instrument;
	var source = "" + fs.readFileSync(options.from);

	fs.writeFileSync(options.to, new Instrument(source, {
		name: options.from
	}).instrument());
};
