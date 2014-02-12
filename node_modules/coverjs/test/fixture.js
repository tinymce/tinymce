"use strict";

var a = 1;
var b = 3;

var esprima = require('esprima');
var escodegen = require('escodegen');

function c(a, b){
	return a + b;
}

if (b){
	a++;
} else {
	b--;
}

var d = function(){
	console.warn('bar');
};

switch (a){
	case 1:
		c(a, b);
		c(a, c(a, b));
		break;
	case 2: c(b, a); break;
}

c(3, 4);
c(5, 2);

function Cover(){

}

Cover.prototype = {

	parse: function(){
		return (this.ast = esprima.parse(this.code, {
			range: true
		}));
	},

	generate: function(ast){
		return escodegen.generate(ast);
	},

	walk: function(ast, index, parent){
		console.warn('foo bar');
		console.warn('yello');
	}

};

try {
	throw new Error('whops');

	console.warn('not here!');

} catch (e){
	console.warn(e);
	console.warn(e);
} finally {
	console.warn('finally'); console.warn('more finally');
}


