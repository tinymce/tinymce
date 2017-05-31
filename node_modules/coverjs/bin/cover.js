#! /usr/bin/env node
"use strict";

var fs         = require('fs');
var mkdirp     = require('mkdirp');
var path       = require('path');
var Async      = require('Supersonic').Async;
var Queue      = require('Supersonic').Queue;
var colors     = require('colors');
var pack       = require('../package.json');
var Instrument = require('../lib/Instrument');

// options
var files = [];
var dir;
var recursive = false;
var excludes = [];
var template;
var result;

var args = process.argv.slice(2);
if (!args.length) args.push('--help');

for (var i = 0; i < args.length; i++){
	var arg = args[i];

	if (arg == '--version' || arg == '-v'){
		console.log(pack.version);
		process.exit(0);
		break;
	}

	if (arg == '--output' || arg == '-o'){
		dir = args[++i];
		continue;
	}

	if (arg == '--recursive' || arg == '-r'){
		recursive = true;
		continue;
	}

	if (arg == '--exclude' || arg == '-e'){
		excludes.push(args[++i]);
		continue;
	}

	if (arg == '--template' || arg == '-t'){
		template = args[++i];
		continue;
	}

	if (arg == '--result'){
		result = args[++i];
		continue;
	}

	if (arg == '--help' || arg == '-h'){

		var help = '\n\n' +
			'  Usage: coverjs [options] <files>\n\n' +
			'  Options:\n\n' +
			'    -h, --help                   output usage information\n' +
			'    -v, --version                output version information\n' +
			'    -o, --output <directory>     directory to output the instrumented files\n' +
			'    -r, --recursive              recurse in subdirectories\n' +
			'    -x, --exclude <directories>  exclude these directories\n' +
			'    -t, --template <template>    which template should be used which exports the __$coverObject variable\n' +
			'        --result <file>          if --template option is node, also a result file should be given where the output is written to.' +
			'\n\n';

		console.log(help);
		process.exit(0);
		break;

	}

	files.push(arg);

}

// normalize dir
if (!dir){
	console.warn('the --output option is required');
	process.exit(1);
} else {
	dir = path.normalize(dir);
}

// normalize exclude files/directories
excludes.map(function(dir){
	return path.normalize(dir);
});

// async flow
var flow = new Async();

// return a function which executes a series of actions
var processFile = function(file, outFile){

	file = path.normalize(file);

	var ext = path.extname(file);
	if (fs.statSync(file).isFile() && ext && ext != '.js'){
		console.warn('ERROR:'.red.inverse + ' ' + file + ' is not a JavaScript file');
		return;
	}

	return function(ready){

		var queue = new Queue();

		var code, instrumented;

		queue.push(function(next, finish){

			fs.stat(file, function(err, stat){
				if (err) console.warn(('ERROR:').red.invert + ('Could not open ' + file).red);
				else if (stat.isFile()){

					next();

				} else if (recursive && stat.isDirectory()){

					console.warn(('Recursing into ' + file).yellow);

					fs.readdir(file, function(err, files){
						if (err) throw err;

						files.forEach(function(_file){

							var __file = path.normalize(file + '/' + _file);
							if (_file.indexOf('.') !== 0 && _file != '..' && _file != '.' && excludes.indexOf(__file) == -1){

								var fn = processFile(file + '/' + _file, outFile + '/' + _file);
								if (fn) flow.push(fn);

							}
						});

						finish(false);
					});

				} else if (stat.isDirectory()){

					console.warn('ERROR: '.red.inverse + ' ' + file + ' is a directory, maybe use the --recursive option');
					finish(false);

				} else {
					console.warn('ERROR: '.red.inverse + ' ' + file + ' is not a file nor a directory');
					finish(false);
				}
			});

		}).push(function(next, finish){

			// read the file

			fs.readFile(file, function(err, data){
				if (err){
					console.warn(('ERROR:').red.inverse + (' Could not open ' + file).red);
					finish(false);
				} else {
					code = data + '';
					next();
				}
			});

		}).push(function(next){

			// instrument the code

			console.warn(('instrumenting ' + file).blue);
			var instrument = new Instrument(code, {
				template: template,
				result: result && path.resolve(result),
				name: file
			});
			instrumented   = instrument.instrument();

			next();

		}).push(function(next){

			// create the target directory

			var newDir = path.dirname(outFile);
			mkdirp.sync(newDir, 511);
			next();

		}).push(function(next){

			// and write the file

			fs.writeFile(outFile, instrumented, function(err){
				if (err) throw err;
				next();
			});

		});

		queue.invoke(function(log){
			if (log !== false) console.warn(('READY:').green.inverse + (' ' + file + ' has been instrumented').green);
			ready();
		});

	};

};

files.forEach(function(file){

	var fn = processFile(file, path.join(dir, path.basename(file)));
	if (fn) flow.push(fn);

});

flow.invoke(function(){
	console.warn(('READY:').green.inverse + (' Instrumented code has been written to ' + dir).green);
});

