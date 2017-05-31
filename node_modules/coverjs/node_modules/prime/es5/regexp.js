/*
regexp
 - es5 regexp shell
*/"use strict"

var shell = require("../util/shell")

var proto = RegExp.prototype

var regexp = shell({test: proto.test, exec: proto.exec})

module.exports = regexp
