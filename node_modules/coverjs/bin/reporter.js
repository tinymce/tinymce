#! /usr/bin/env node
"use strict";

var reporters = require('../cover').reporters;

var reporter = 'text';

var args = process.argv.slice(2);
for (var i = 0; i < args.length; i++){
	var arg = args[i];

	if (arg == '--reporter' || arg == '-r'){
		reporter = args[++i];
		continue;
	}

	if (arg == '--help' || arg == '-h'){

		var help = '\n\n' +
			'  Usage: coverjs-reporter [options]\n\n' +
			'  Options:\n\n' +
			'  -r --reporter <reporter>  which reporter should be used.\n' +
			'       possible reporters: text, html\n' +
			'\n\n';

		console.log(help);
		process.exit(0);
		break;
	}

}

var Reporter;
switch (reporter){
	case 'text': Reporter = reporters.Reporter;     break;
	case 'html': Reporter = reporters.HTMLReporter; break;
	default:
		console.log(reporter + ' is not a valid reporter. See --help');
		process.exit(1);
		break;
}

var json = '';

process.stdin.resume();

process.stdin.on('data', function(data){
	json += data;
});

process.stdin.on('end', function(){
	report(json);
});

function report(json){

	var data = JSON.parse(json);
	var reporter = new Reporter(data);

	var result = reporter.report();

	console.log(result);

}
