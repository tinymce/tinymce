var fs = require("fs");
var assert = require("assert");

module.exports["path separator can be used by exclude"] = function(next) {

	jake.mkdirP("./test/tmp/one/two/three");
	jake.mkdirP("./test/tmp/one/exclude");

	fs.writeFileSync("./test/tmp/one/two/three/file.txt", "hello");
	fs.writeFileSync("./test/tmp/one/exclude/file.txt", "world");

	var fileList = new jake.FileList();

	fileList.include("test/tmp/one/**/*.txt");
	assert.equal(fileList.toArray().length, 2);

	fileList.exclude("tmp/one/exclude");
	assert.equal(fileList.toArray().length, 1);

	next();
};