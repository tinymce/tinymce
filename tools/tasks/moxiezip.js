var fs = require("fs");
var path = require("path");
var ZipWriter = require('moxie-zip').ZipWriter;

module.exports = function(grunt) {
	grunt.registerMultiTask("moxiezip", "Creates zip files.", function() {
		var target = grunt.config([this.name, this.target]);
		var archive = new ZipWriter();
		var done = this.async();
		var options = target.options || {}, excludePaths = {};

		options.baseDir = (options.baseDir || '').replace(/\\/g, '/');

		function addExcludes(excludes) {
			if (Array.isArray(excludes)) {
				excludes.forEach(function(excludePath) {
					excludePaths[path.resolve(excludePath)] = true;
				});
			}
		}

		function filterZipPath(zipFilePath) {
			if (options.pathFilter) {
				return options.pathFilter(zipFilePath);
			}

			return zipFilePath;
		}

		function process(filePath, zipFilePath) {
			var args, stat = fs.statSync(filePath);

			if (excludePaths[path.resolve(filePath)]) {
				return;
			}

			zipFilePath = zipFilePath || filePath;
			filePath = filePath.replace(/\\/g, '/');
			zipFilePath = zipFilePath.replace(/\\/g, '/');
			zipFilePath = filterZipPath(zipFilePath);

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

		if (options.concat) {
			options.concat.forEach(function(pair) {
				var chunks;

				chunks = grunt.file.expand(pair.src).map(function(src) {
					return grunt.file.read(src);
				});

				pair.dest.forEach(function(zipFilePath) {
					zipFilePath = filterZipPath(zipFilePath);
					archive.addData(path.join(options.baseDir, zipFilePath), chunks.join('\r\n'));
				});
			});
		}

		if (target.options.excludes) {
			addExcludes(grunt.file.expand(target.options.excludes));
		}

		this.files.forEach(function(filePair) {
			filePair.src.forEach(function(src) {
				process(src);
			});
		});

		if (options.onBeforeSave) {
			options.onBeforeSave(archive);
		}

		grunt.file.mkdir(path.dirname(options.to));

		archive.saveAs(options.to, function() {
			grunt.log.ok('Created zip file:', options.to);
			done();
		});
	});
};
