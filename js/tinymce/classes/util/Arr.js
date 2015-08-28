/**
 * Arr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Array utility class.
 *
 * @private
 * @class tinymce.util.Arr
 */
define("tinymce/util/Arr", [], function() {
	var isArray = Array.isArray || function(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	};

	function toArray(obj) {
		var array = obj, i, l;

		if (!isArray(obj)) {
			array = [];
			for (i = 0, l = obj.length; i < l; i++) {
				array[i] = obj[i];
			}
		}

		return array;
	}

	function each(o, cb, s) {
		var n, l;

		if (!o) {
			return 0;
		}

		s = s || o;

		if (o.length !== undefined) {
			// Indexed arrays, needed for Safari
			for (n = 0, l = o.length; n < l; n++) {
				if (cb.call(s, o[n], n, o) === false) {
					return 0;
				}
			}
		} else {
			// Hashtables
			for (n in o) {
				if (o.hasOwnProperty(n)) {
					if (cb.call(s, o[n], n, o) === false) {
						return 0;
					}
				}
			}
		}

		return 1;
	}

	function map(array, callback) {
		var out = [];

		each(array, function(item, index) {
			out.push(callback(item, index, array));
		});

		return out;
	}

	function filter(a, f) {
		var o = [];

		each(a, function(v) {
			if (!f || f(v)) {
				o.push(v);
			}
		});

		return o;
	}

	function indexOf(a, v) {
		var i, l;

		if (a) {
			for (i = 0, l = a.length; i < l; i++) {
				if (a[i] === v) {
					return i;
				}
			}
		}

		return -1;
	}

	function reduce(collection, iteratee, accumulator, thisArg) {
		var i = 0;

		if (arguments.length < 3) {
			accumulator = collection[0];
			i = 1;
		}

		for (; i < collection.length; i++) {
			accumulator = iteratee.call(thisArg, accumulator, collection[i], i);
		}

		return accumulator;
	}

	return {
		isArray: isArray,
		toArray: toArray,
		each: each,
		map: map,
		filter: filter,
		indexOf: indexOf,
		reduce: reduce
	};
});