"use strict";

var Reporter = require('./Reporter');
var prime    = require('prime');

var HTMLReporter = prime({

	inherits: Reporter,

	constructor: function(object){
		HTMLReporter.parent.constructor(object);

		// TODO would be cool to use some nicer templating solution for this
		this.head = '' +
			'<!DOCTYPE html>\n' +
			'<html>\n<head>\n' +
			'<meta charset="utf-8">\n' +
			'<title>Coverate Results</title>\n' +
			'<style>\n' +
			'	.error { background: #F8D5D8 }\n' +
			'	.count { font-weight: bold; border-radius: 3px }\n' +
			'	.pass .count { background: #BFFFBF;}' +
			'	.error .count { background: #F8D5D8; color: red}' +
			'</style>\n' +
			'</head>\n<body>\n';

		this.tail = '\n</body>\n</html>';

	},

	report: function(){

		var result = this.head;

		for (var file in this.object){
			var fileReporter = new HTMLFileReporter(this.object[file]);

			var fileReport = fileReporter.report();
			var percentage = fileReporter.pass / fileReporter.total * 100;

			this.error += fileReporter.error;
			this.pass  += fileReporter.pass;
			this.total += fileReporter.total;

			result += '<h1>' + file + ' (' + Math.round(percentage) + '%)</h1>\n\n';
			result += '<pre>' + fileReport + '</pre>';
		}

		return result + this.tail;

	}

});

var HTMLFileReporter = prime({

	inherits: Reporter.FileReporter,

	constructor: function(object){

		var open  = '<span class="{class}" data-count="{count}"><span class="count">{count}</span>';
		var close = '</span>';

		HTMLFileReporter.parent.constructor(object, open, close);

	},

	generateOpen: function(count){
		return this.substitute(this.open, {
			'count': count,
			'class': count ? 'pass' : 'error'
		});
	}

});

HTMLReporter.FileReporter = HTMLFileReporter;
module.exports = HTMLReporter;
