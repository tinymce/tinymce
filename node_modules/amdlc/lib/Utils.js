var fs = require("fs");
var path = require("path");

var fileContentsCache = {};

// mkdirp by James Halliday
function mkdirPSync(p, mode, made) {
	if (mode === undefined) {
		mode = 0777 & (~process.umask());
	}

	if (!made) {
		made = null;
	}

	if (typeof mode === 'string') {
		mode = parseInt(mode, 8);
	}

	p = path.resolve(p);

	try {
		fs.mkdirSync(p, mode);
		made = made || p;
	} catch (err0) {

	switch (err0.code) {
		case 'ENOENT' :
			made = mkdirPSync(path.dirname(p), mode, made);
			mkdirPSync(p, mode, made);
			break;

		// In the case of any other error, just see if there's a dir
		// there already.  If so, then hooray!  If not, then something
		// is borked.
		default:
			var stat;
			try {
				stat = fs.statSync(p);
			} catch (err1) {
				throw err0;
			}

			if (!stat.isDirectory()) {
				throw err0;
			}
			break;
		}
	}

	return made;
}

function findFiles(filePath, baseDir) {
	var files = [];

	// If array of paths or path expressions
	if (filePath instanceof Array) {
		filePath.forEach(function(filePath) {
			Array.prototype.push.apply(files, findFiles(filePath, baseDir));
		});

		return files;
	}

	filePath = path.join(baseDir, filePath);

	if (filePath.indexOf('*') != -1) {
		// Use glob if whildcard pattern
		Array.prototype.push.apply(files, require("glob").sync(filePath));
	} else {
		// Single file
		files.push(filePath);
	}

	return files;
}

function getFileContents(filePath) {
	if (!fileContentsCache[filePath]) {
		fileContentsCache[filePath] = "" + fs.readFileSync(filePath);
	}

	return fileContentsCache[filePath];
}

function createDirForFile(filePath) {
	if (!fs.existsSync(path.dirname(filePath))) {
		fs.mkdirSync(path.dirname(filePath));
	}

	return filePath;
}

function getFileModTime(filePath) {
	return fs.existsSync(filePath) ? fs.statSync(filePath).mtime.getTime() : 0;
}

function toUnixPath(filePath) {
	return filePath.replace(/\\/g, '/');
}

function removeDuplicates(array) {
	var filePaths = [], uniqueArray = [];

	array.forEach(function(module) {
		if (filePaths.indexOf(module.filePath) === -1) {
			filePaths.push(module.filePath);
			uniqueArray.push(module);
		}
	});

	uniqueArray.unshift(0, array.length);
	Array.prototype.splice.apply(array, uniqueArray);
}

function extend(a, b) {
	if (b) {
		for (var name in b) {
			a[name] = b[name];
		}
	}

	return a;
}

exports.mkdirPSync = mkdirPSync;
exports.getFileContents = getFileContents;
exports.createDirForFile = createDirForFile;
exports.getFileModTime = getFileModTime;
exports.toUnixPath = toUnixPath;
exports.removeDuplicates = removeDuplicates;
exports.extend = extend;
exports.findFiles = findFiles;
