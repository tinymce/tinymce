/*
array
 - es5 array shell
*/"use strict"

var shell = require("../util/shell")

var proto = Array.prototype

var array = shell({

	filter: proto.filter/*(es5 && array.filter)?*/ || function(fn, context){
		var results = []
		for (var i = 0, l = this.length >>> 0; i < l; i++) if (i in this){
			var value = this[i]
			if (fn.call(context, value, i, this)) results.push(value)
		}
		return results
	}/*:*/,

	indexOf: proto.indexOf/*(es5 && array.indexOf)?*/ || function(item, from){
		for (var l = this.length >>> 0, i = (from < 0) ? Math.max(0, l + from) : from || 0; i < l; i++){
			if ((i in this) && this[i] === item) return i
		}
		return -1
	}/*:*/,

	map: proto.map/*(es5 && array.map)?*/ || function(fn, context){
		var length = this.length >>> 0, results = Array(length)
		for (var i = 0, l = length; i < l; i++){
			if (i in this) results[i] = fn.call(context, this[i], i, this)
		}
		return results
	}/*:*/,

	forEach: proto.forEach/*(es5 && array.forEach)?*/ || function(fn, context){
		for (var i = 0, l = this.length >>> 0; i < l; i++){
			if (i in this) fn.call(context, this[i], i, this)
		}
	}/*:*/,

	every: proto.every/*(es5 && array.every)?*/ || function(fn, context){
		for (var i = 0, l = this.length >>> 0; i < l; i++){
			if ((i in this) && !fn.call(context, this[i], i, this)) return false
		}
		return true
	}/*:*/,

	some: proto.some/*(es5 && array.some)?*/ || function(fn, context){
		for (var i = 0, l = this.length >>> 0; i < l; i++){
			if ((i in this) && fn.call(context, this[i], i, this)) return true
		}
		return false
	}/*:*/

})

array.isArray = Array.isArray/*(es5 && array.isArray)?*/ || function(self){
	return Object.prototype.toString.call(self) === "[object Array]"
}/*:*/

var methods = {}
var names = "pop,push,reverse,shift,sort,splice,unshift,concat,join,slice,lastIndexOf,reduce,reduceRight".split(",")
for (var i = 0, name, method; name = names[i++];) if ((method = proto[name])) methods[name] = method
array.implement(methods)

module.exports = array
