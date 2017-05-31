var __$coverCall, __$coverInit, __$coverInitRange;
(function(fs){
	"use strict";
	var update = function(cb){
		return function(a, b, c, d){
			var json = JSON.parse(fs.readFileSync("{result}").toString() || '{}');
			cb(json, a, b);
			fs.writeFileSync("{result}", JSON.stringify(json, null, 2));
		};
	};
	__$coverInit = update(function(json, name, code){
		if (!json[name]) json[name] = {__code: code};
	});
	__$coverInitRange = update(function(json, name, range){
		if (!json[name][range]) json[name][range] = 0;
	});
	__$coverCall = update(function(json, name, range){
		json[name][range]++;
	});
})(require('fs'));
