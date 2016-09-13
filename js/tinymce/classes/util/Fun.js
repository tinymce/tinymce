/**
 * Fun.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Functional utility class.
 *
 * @private
 * @class tinymce.util.Fun
 */
define("tinymce/util/Fun", [], function() {
	var slice = [].slice;

	function constant(value) {
		return function() {
			return value;
		};
	}

	function negate(predicate) {
		return function(x) {
			return !predicate(x);
		};
	}

	function compose(f, g) {
		return function(x) {
			return f(g(x));
		};
	}

	function or() {
		var args = slice.call(arguments);

		return function(x) {
			for (var i = 0; i < args.length; i++) {
				if (args[i](x)) {
					return true;
				}
			}

			return false;
		};
	}

	function and() {
		var args = slice.call(arguments);

		return function(x) {
			for (var i = 0; i < args.length; i++) {
				if (!args[i](x)) {
					return false;
				}
			}

			return true;
		};
	}

	function curry(fn) {
		var args = slice.call(arguments);

		if (args.length - 1 >= fn.length) {
			return fn.apply(this, args.slice(1));
		}

		return function() {
			var tempArgs = args.concat([].slice.call(arguments));
			return curry.apply(this, tempArgs);
		};
	}

	function noop() {
	}

	return {
		constant: constant,
		negate: negate,
		and: and,
		or: or,
		curry: curry,
		compose: compose,
		noop: noop
	};
});