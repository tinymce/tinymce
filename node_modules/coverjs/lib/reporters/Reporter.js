"use strict";

var prime = require('prime');

var Reporter = prime({

	constructor: function(object){
		this.object = object;

		this.error = 0;
		this.pass  = 0;
		this.total = 0;

	},

	report: function(){
		var result = '';
		for (var file in this.object){

			var fileReporter = new FileReporter(this.object[file], '<<<', '>>>');

			var fileReport = fileReporter.report();
			var percentage = fileReporter.pass / fileReporter.total * 100;

			this.error += fileReporter.error;
			this.pass  += fileReporter.pass;
			this.total += fileReporter.total;

			result += '+++  ' + result + ' (' + Math.round(percentage) + ') +++ \n\n';
			result += fileReport;
			result += '\n\n\n\n';
		}
		return result;
	}

});

var FileReporter = prime({

	constructor: function(object, open, close){

		this.object = object;
		this.open   = open;
		this.close  = close;

		this.error = 0;
		this.pass  = 0;
		this.total = 0;

	},

	// substitute credits: MooTools
	substitute: function(string, object){
		return string.replace(/\\?\{([^{}]+)\}/g, function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] !== null) ? object[name] : '';
		});
	},

	generateOpen: function(count){
		return this.substitute(this.open, {
			count: count
		});
	},

	generateClose: function(count){
		return this.substitute(this.close, {
			count: count
		});
	},

	report: function(){

		var i, l, k;

		var code = this.object.__code;

		// generate array of all tokens
		var codez = [];
		for (i = 0, l = code.length; i < l; i++){
			codez.push({
				pos: i,
				value: code.slice(i, i + 1)
			});
		}

		// insert new strings that wrap the statements
		for (k in this.object){
			if (k == '__code') continue;

			var count = this.object[k];
			var range = k.split(':');

			this.total++;
			if (count) this.pass++;
			else this.error++;

			for (i = 0, l = codez.length; i < l; i++){

				if (codez[i].pos == range[0]){
					codez.splice(i, 0, {
						pos: -1,
						value: this.generateOpen(count)
					});
					i++;
					continue;
				}

				if (codez[i].pos == range[1]){
					codez.splice(i + 1, 0, {
						pos: -1,
						value: this.generateClose(count)
					});
					i++;
					continue;
				}

			}

		}

		var result = '';
		for (i = 0, l = codez.length; i < l; i++){
			result += codez[i].value;
		}

		return result;

	}

});

Reporter.FileReporter = FileReporter;
module.exports = Reporter;
