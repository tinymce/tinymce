/*
ghost 👻
*/"use strict"

var prime  = require("../prime"),
	type   = require("../util/type"),
	string = require("../types/string"),
	number = require("../types/number"),
	map    = require("../collection/map"),
	list   = require("../collection/list"),
	hash   = require("../collection/hash")

var ghosts = map()

var ghost = function(self){

	var responders = ghosts._keys,
		hashes = ghosts._values

	var Ghost

	for (var i = responders.length, responder; responder = responders[--i];) if (responder(self)){
		Ghost = hashes[i].ghost
		break
	}

	return Ghost ? new Ghost(self) : self
}

ghost.register = function(responder, base){

	if (ghosts.get(responder)) return ghost

	var Ghost = prime({ // yes, a prime in a prime

		mutator: function(key, method){
			this.prototype[key] = function(){
				return ghost(method.apply(this.valueOf(), arguments))
			}
		},

		constructor: function(self){
			this.valueOf = function(){
				return self
			}
			this.toString = function(){
				return self + ""
			}
			this.is = function(object){
				return self === object
			}
		}

	})

	var mutator = base.mutator

	// override base mutator, so it automagically implements stuff in the ghost
	// when base changes
	base.mutator = function(key, method){
		mutator.call(this, key, method)
		Ghost.mutator(key, method)
	}

	Ghost.implement(base.prototype)

	ghosts.set(responder, {base: base, ghost: Ghost, mutator: mutator})

	return ghost
}

ghost.unregister = function(responder){
	var hash = ghosts.remove(responder)
	if (hash) hash.base.mutator = hash.mutator
	return ghost
}

// register base objects

ghost.register(function(self){
	return self && (type(self) === "array" || type(self.length) === "number")
}, list)

ghost.register(function(self){
	return type(self) === "object"
}, hash)

ghost.register(function(self){
	return type(self) === "number"
}, number)

ghost.register(function(self){
	return type(self) === "string"
}, string)

ghost.register(function(self){
	return self && self.toString() == "[object Map]"
}, map)

// export ghost

module.exports = ghost
