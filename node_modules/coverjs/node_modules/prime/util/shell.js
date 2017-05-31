/*
shell 🐚
*/"use strict"

var prime = require("../prime"),
	slice = Array.prototype.slice

var shell = prime({

	mutator: function(key, method){
		this[key] = function(self){
			var args = (arguments.length > 1) ? slice.call(arguments, 1) : []
			return method.apply(self, args)
		}

		this.prototype[key] = method
	},

	constructor: {prototype: {}}

})

module.exports = function(proto){
	var inherits = proto.inherits || (proto.inherits = shell)
	proto.constructor = prime.create(inherits)
	return prime(proto)
}
