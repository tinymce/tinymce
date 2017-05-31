/*
map
 - must be instantiated
*/"use strict"

var prime = require("../prime"),
	array = require("../es5/array"),
	proto = array.prototype

// set, get, count, each, map, filter, some, every, index, remove, keys, values

var Map = prime({

	constructor: function(){
		if (!(this instanceof Map)) return new Map
		this.length = 0
		this._keys = []
		this._values = []
	},

	set: function(key, value){
		var index = proto.indexOf.call(this._keys, key)

		if (index === -1){
			this._keys[this.length] = key
			this._values[this.length] = value
			this.length++
		} else {
			this._values[index] = value
		}

		return this
	},

	get: function(key){
		var index = proto.indexOf.call(this._keys, key)
		return (index === -1) ? null : this._values[index]
	},

	count: function(){
		return this.length
	},

	each: function(method, context){
		for (var i = 0, l = this.length; i < l; i++){
			if (method.call(context, this._values[i], this._keys[i], this) === false) break
		}
		return this
	},

	map: function(method, context){
		var results = new Map
		this.each(function(value, key){
			results.set(key, method.call(context, value, key, this))
		}, this)
		return results
	},

	filter: function(method, context){
		var results = new Map
		this.each(function(value, key){
			results.set(key, method.call(context, value, key, this))
		}, this)
		return results
	},

	every: function(method, context){
		var every = true
		this.each(function(value, key){
			if (!method.call(context, value, key, this)) return every = false
		}, this)
		return every
	},

	some: function(method, context){
		var some = false
		this.each(function(value, key){
			if (method.call(context, value, key, this)) return !(some = true)
		}, this)
		return some
	},

	index: function(value){
		var index = proto.indexOf.call(this._values, value)
		return (index > -1) ? this._keys[index] : null
	},

	remove: function(key){
		var index = proto.indexOf.call(this._keys, key)

		if (index !== -1){
			this._keys.splice(index, 1)
			return this._values.splice(index, 1)[0]
			this.length--
		}

		return null
	},

	keys: function(){
		return this._keys.slice()
	},

	values: function(){
		return this._values.slice()
	},

	toString: function(){
		return "[object Map]"
	}

})

module.exports = Map
