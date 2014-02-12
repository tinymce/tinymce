/*
number
 - es5 number shell
*/"use strict"

var shell = require("../util/shell")

var proto = Number.prototype

var number = shell({
	toExponential: proto.toExponential,
	toFixed: proto.toFixed,
	toPrecision: proto.toPrecision
})

module.exports = number
