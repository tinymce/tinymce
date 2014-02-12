/*
function
 - es5 function shell
*/"use strict"

var shell = require("../util/shell")

var proto = Function.prototype

module.exports = shell({
	apply: proto.apply,
	call: proto.call,
	bind: proto.bind
})
