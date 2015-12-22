(function(exports) {
	exports.AMDLC_TESTS = true;

	function resolve(id) {
		var i, target = exports, fragments = id.split(/[.\/]/);

		for (i = 0; i < fragments.length; i++) {
			if (!target[fragments[i]]) {
				return;
			}

			target = target[fragments[i]];
		}

		return target;
	}

	function require(ids, callback) {
		var i, module, defs = [], privateModules = exports.privateModules || {};

		for (i = 0; i < ids.length; i++) {
			module = privateModules[ids[i]] || resolve(ids[i]);

			if (!module) {
				throw 'module definition dependency not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	exports.ModuleLoader = {
		require: require
	};
})(this);
