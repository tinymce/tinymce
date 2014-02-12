var amdCompiler = require("./AmdCompiler");
var path = require("path");
var fs = require("fs");
var cmdline = require("./cmdline");

// Output help if specified or missing arguments
if (cmdline.has('h,help') || cmdline.isEmpty()) {
	console.log([
		"Usage: amdlc [options] <input file/glob pattern> <output file>",
		"",
		"Options:",
		"  --quiet              no output",
		"  --root-ns            root namespace from path resolve",
		"  --basedir            basedir to look for modules for example src/js"
	].join("\n"));

	process.exit(1);
}

var inputFile = cmdline.item(1);
var outputFile = cmdline.item(0);

amdCompiler.compile({
	from: inputFile,
	baseDir: cmdline.get('basedir', true),
	compress: true,
	expose: "public",
	force: true,
	rootNS: cmdline.get('root-ns'),
	verbose: !cmdline.get('quiet'),
	outputSource: outputFile,
	outputMinified: path.join(path.dirname(outputFile), path.basename(outputFile, path.extname(outputFile)) + ".min.js"),
	outputDev: path.join(path.dirname(outputFile), path.basename(outputFile, path.extname(outputFile)) + ".dev.js")
});
