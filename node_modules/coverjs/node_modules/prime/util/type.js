/*
type
*/"use strict"

var toString = Object.prototype.toString,
	types = /number|object|array|string|function|date|regexp|boolean/

var type = function(object){
	if (object == null) return "null"
	var string = toString.call(object).slice(8, -1).toLowerCase()
	if (string === "number" && isNaN(object)) return "null"
	if (types.test(string)) return string
	return "object"
}

module.exports = type
