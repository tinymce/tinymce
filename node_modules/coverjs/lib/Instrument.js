"use strict";

var fs        = require('fs');
var esprima   = require('esprima');
var escodegen = require('escodegen');

// create coverage line

var id = 0;

var Instrument = function(code, options){

	if (!options) options = {};

	this.code = code + '';
	this.name = (options.name || (id++).toString(36)) + '';

	var quotedName = this.quotedName = JSON.stringify(this.name);
	var quotedCode = this.quotedCode = JSON.stringify(this.code);

	this.ranges = [];

	var template = options.template || 'global';
	var tpls = __dirname + '/../templates/' + template;
	var headTemplate = fs.readFileSync(tpls + 'Head.js').toString();
	var tailTemplate = fs.readFileSync(tpls + 'Tail.js').toString();

	if (template == 'node' && options.result){
		headTemplate = headTemplate.replace(/\{result\}/g, options.result);
		tailTemplate = tailTemplate.replace(/\{result\}/g, options.result);
	}

	this.headCode = headTemplate +
		'__$coverInit(' + quotedName + ', ' + quotedCode + ');\n';

	this.rangesCode = '';

	this.tailCode = tailTemplate;

};

Instrument.prototype = {

	// Short method to instrument the code

	instrument: function(){
		this.parse();
		this.walk();
		return this.generate();
	},

	// generate AST with esprima

	parse: function(){
		return (this.ast = esprima.parse(this.code, {
			range: true
		}));
	},

	// generate new instrumented code from AST

	generate: function(){
		this._generateInitialRanges();
		return this.headCode + this.rangesCode + escodegen.generate(this.ast) + this.tailCode;
	},

	_generateInitialRanges: function(){
		for (var i = 0, l = this.ranges.length; i < l; i++){
			var range = this.ranges[i];
			this.rangesCode += '__$coverInitRange(' + this.quotedName + ', "' + range[0] + ':' + range[1] + '");\n';
		}
	},

	// Modify AST by injecting extra instrumenting code

	walk: function(){
		this._walk(this.ast);
		return this.ast;
	},

	_walk: function(ast, index, parent){

		// iterator variables
		var i, l, k;

		switch (index){
			case 'body':
			case 'consequent':
				if (Array.isArray(ast)){
					for (i = 0, l = ast.length; i < l; i++){
						var range = ast[i * 2].range;
						ast.splice(i * 2, 0, this._statementCallAST(range));
						this.ranges.push(range);
					}
				}
				break;
		}

		// recurse through the AST

		if (Array.isArray(ast)){

			for (i = 0, l = ast.length; i < l; i++) this._walk(ast[i], i, parent);

		} else if (typeof ast === 'object'){

			for (k in ast) this._walk(ast[k], k, parent);

		}

	},

	_statementCallAST: function(range){

		return {
			"type": "ExpressionStatement",
			"expression": {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "__$coverCall"
				},
				"arguments": [{
					"type": "Literal",
					"value": this.name
				}, {
					"type": "Literal",
					"value": range[0] + ":" + range[1]
				}]
			}
		};

	}

};

module.exports = Instrument;
