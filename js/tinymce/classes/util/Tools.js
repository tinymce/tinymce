/**
 * Tools.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various utlity functions. These are also exposed
 * directly on the tinymce namespace.
 *
 * @class tinymce.util.Tools
 */
define("tinymce/util/Tools", [], function() {
	/**
	 * Removes whitespace from the beginning and end of a string.
	 *
	 * @method trim
	 * @param {String} s String to remove whitespace from.
	 * @return {String} New string with removed whitespace.
	 */
	var whiteSpaceRegExp = /^\s*|\s*$/g;
	var trim = function(str) {
		return (str === null || str === undefined) ? '' : ("" + str).replace(whiteSpaceRegExp, '');
	};

	/**
	 * Returns true/false if the object is an array or not.
	 *
	 * @method isArray
	 * @param {Object} obj Object to check.
	 * @return {boolean} true/false state if the object is an array or not.
	 */
	var isArray = Array.isArray || function(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	};

	/**
	 * Checks if a object is of a specific type for example an array.
	 *
	 * @method is
	 * @param {Object} o Object to check type of.
	 * @param {string} t Optional type to check for.
	 * @return {Boolean} true/false if the object is of the specified type.
	 */
	function is(o, t) {
		if (!t) {
			return o !== undefined;
		}

		if (t == 'array' && isArray(o)) {
			return true;
		}

		return typeof(o) == t;
	}

	/**
	 * Converts the specified object into a real JavaScript array.
	 *
	 * @method toArray
	 * @param {Object} obj Object to convert into array.
	 * @return {Array} Array object based in input.
	 */
	function toArray(obj) {
		var array = [], i, l;

		for (i = 0, l = obj.length; i < l; i++) {
			array[i] = obj[i];
		}

		return array;
	}

	/**
	 * Makes a name/object map out of an array with names.
	 *
	 * @method makeMap
	 * @param {Array/String} items Items to make map out of.
	 * @param {String} delim Optional delimiter to split string by.
	 * @param {Object} map Optional map to add items to.
	 * @return {Object} Name/value map of items.
	 */
	function makeMap(items, delim, map) {
		var i;

		items = items || [];
		delim = delim || ',';

		if (typeof(items) == "string") {
			items = items.split(delim);
		}

		map = map || {};

		i = items.length;
		while (i--) {
			map[items[i]] = {};
		}

		return map;
	}

	/**
	 * Performs an iteration of all items in a collection such as an object or array. This method will execure the
	 * callback function for each item in the collection, if the callback returns false the iteration will terminate.
	 * The callback has the following format: cb(value, key_or_index).
	 *
	 * @method each
	 * @param {Object} o Collection to iterate.
	 * @param {function} cb Callback function to execute for each item.
	 * @param {Object} s Optional scope to execute the callback in.
	 * @example
	 * // Iterate an array
	 * tinymce.each([1,2,3], function(v, i) {
	 *     console.debug("Value: " + v + ", Index: " + i);
	 * });
	 *
	 * // Iterate an object
	 * tinymce.each({a: 1, b: 2, c: 3], function(v, k) {
	 *     console.debug("Value: " + v + ", Key: " + k);
	 * });
	 */
	function each(o, cb, s) {
		var n, l;

		if (!o) {
			return 0;
		}

		s = s || o;

		if (o.length !== undefined) {
			// Indexed arrays, needed for Safari
			for (n=0, l = o.length; n < l; n++) {
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

	/**
	 * Creates a new array by the return value of each iteration function call. This enables you to convert
	 * one array list into another.
	 *
	 * @method map
	 * @param {Array} a Array of items to iterate.
	 * @param {function} f Function to call for each item. It's return value will be the new value.
	 * @return {Array} Array with new values based on function return values.
	 */
	function map(a, f) {
		var o = [];

		each(a, function(v) {
			o.push(f(v));
		});

		return o;
	}

	/**
	 * Filters out items from the input array by calling the specified function for each item.
	 * If the function returns false the item will be excluded if it returns true it will be included.
	 *
	 * @method grep
	 * @param {Array} a Array of items to loop though.
	 * @param {function} f Function to call for each item. Include/exclude depends on it's return value.
	 * @return {Array} New array with values imported and filtered based in input.
	 * @example
	 * // Filter out some items, this will return an array with 4 and 5
	 * var items = tinymce.grep([1,2,3,4,5], function(v) {return v > 3;});
	 */
	function grep(a, f) {
		var o = [];

		each(a, function(v) {
			if (!f || f(v)) {
				o.push(v);
			}
		});

		return o;
	}

	/**
	 * Creates a class, subclass or static singleton.
	 * More details on this method can be found in the Wiki.
	 *
	 * @method create
	 * @param {String} s Class name, inheritage and prefix.
	 * @param {Object} p Collection of methods to add to the class.
	 * @param {Object} root Optional root object defaults to the global window object.
	 * @example
	 * // Creates a basic class
	 * tinymce.create('tinymce.somepackage.SomeClass', {
	 *     SomeClass: function() {
	 *         // Class constructor
	 *     },
	 *
	 *     method: function() {
	 *         // Some method
	 *     }
	 * });
	 *
	 * // Creates a basic subclass class
	 * tinymce.create('tinymce.somepackage.SomeSubClass:tinymce.somepackage.SomeClass', {
	 *     SomeSubClass: function() {
	 *         // Class constructor
	 *         this.parent(); // Call parent constructor
	 *     },
	 *
	 *     method: function() {
	 *         // Some method
	 *         this.parent(); // Call parent method
	 *     },
	 *
	 *     'static': {
	 *         staticMethod: function() {
	 *             // Static method
	 *         }
	 *     }
	 * });
	 *
	 * // Creates a singleton/static class
	 * tinymce.create('static tinymce.somepackage.SomeSingletonClass', {
	 *     method: function() {
	 *         // Some method
	 *     }
	 * });
	 */
	function create(s, p, root) {
		var t = this, sp, ns, cn, scn, c, de = 0;

		// Parse : <prefix> <class>:<super class>
		s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
		cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

		// Create namespace for new class
		ns = t.createNS(s[3].replace(/\.\w+$/, ''), root);

		// Class already exists
		if (ns[cn]) {
			return;
		}

		// Make pure static class
		if (s[2] == 'static') {
			ns[cn] = p;

			if (this.onCreate) {
				this.onCreate(s[2], s[3], ns[cn]);
			}

			return;
		}

		// Create default constructor
		if (!p[cn]) {
			p[cn] = function() {};
			de = 1;
		}

		// Add constructor and methods
		ns[cn] = p[cn];
		t.extend(ns[cn].prototype, p);

		// Extend
		if (s[5]) {
			sp = t.resolve(s[5]).prototype;
			scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

			// Extend constructor
			c = ns[cn];
			if (de) {
				// Add passthrough constructor
				ns[cn] = function() {
					return sp[scn].apply(this, arguments);
				};
			} else {
				// Add inherit constructor
				ns[cn] = function() {
					this.parent = sp[scn];
					return c.apply(this, arguments);
				};
			}
			ns[cn].prototype[cn] = ns[cn];

			// Add super methods
			t.each(sp, function(f, n) {
				ns[cn].prototype[n] = sp[n];
			});

			// Add overridden methods
			t.each(p, function(f, n) {
				// Extend methods if needed
				if (sp[n]) {
					ns[cn].prototype[n] = function() {
						this.parent = sp[n];
						return f.apply(this, arguments);
					};
				} else {
					if (n != cn) {
						ns[cn].prototype[n] = f;
					}
				}
			});
		}

		// Add static methods
		/*jshint sub:true*/
		t.each(p['static'], function(f, n) {
			ns[cn][n] = f;
		});
	}

	/**
	 * Returns the index of a value in an array, this method will return -1 if the item wasn't found.
	 *
	 * @method inArray
	 * @param {Array} a Array/Object to search for value in.
	 * @param {Object} v Value to check for inside the array.
	 * @return {Number/String} Index of item inside the array inside an object. Or -1 if it wasn't found.
	 * @example
	 * // Get index of value in array this will alert 1 since 2 is at that index
	 * alert(tinymce.inArray([1,2,3], 2));
	 */
	function inArray(a, v) {
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

	function extend(obj, ext) {
		var i, l, name, args = arguments, value;

		for (i = 1, l = args.length; i < l; i++) {
			ext = args[i];
			for (name in ext) {
				if (ext.hasOwnProperty(name)) {
					value = ext[name];

					if (value !== undefined) {
						obj[name] = value;
					}
				}
			}
		}

		return obj;
	}

	/**
	 * Executed the specified function for each item in a object tree.
	 *
	 * @method walk
	 * @param {Object} o Object tree to walk though.
	 * @param {function} f Function to call for each item.
	 * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
	 * @param {String} s Optional scope to execute the function in.
	 */
	function walk(o, f, n, s) {
		s = s || this;

		if (o) {
			if (n) {
				o = o[n];
			}

			each(o, function(o, i) {
				if (f.call(s, o, i, n) === false) {
					return false;
				}

				walk(o, f, n, s);
			});
		}
	}

	/**
	 * Creates a namespace on a specific object.
	 *
	 * @method createNS
	 * @param {String} n Namespace to create for example a.b.c.d.
	 * @param {Object} o Optional object to add namespace to, defaults to window.
	 * @return {Object} New namespace object the last item in path.
	 * @example
	 * // Create some namespace
	 * tinymce.createNS('tinymce.somepackage.subpackage');
	 *
	 * // Add a singleton
	 * var tinymce.somepackage.subpackage.SomeSingleton = {
	 *     method: function() {
	 *         // Some method
	 *     }
	 * };
	 */
	function createNS(n, o) {
		var i, v;

		o = o || window;

		n = n.split('.');
		for (i=0; i<n.length; i++) {
			v = n[i];

			if (!o[v]) {
				o[v] = {};
			}

			o = o[v];
		}

		return o;
	}

	/**
	 * Resolves a string and returns the object from a specific structure.
	 *
	 * @method resolve
	 * @param {String} n Path to resolve for example a.b.c.d.
	 * @param {Object} o Optional object to search though, defaults to window.
	 * @return {Object} Last object in path or null if it couldn't be resolved.
	 * @example
	 * // Resolve a path into an object reference
	 * var obj = tinymce.resolve('a.b.c.d');
	 */
	function resolve(n, o) {
		var i, l;

		o = o || window;

		n = n.split('.');
		for (i = 0, l = n.length; i < l; i++) {
			o = o[n[i]];

			if (!o) {
				break;
			}
		}

		return o;
	}

	/**
	 * Splits a string but removes the whitespace before and after each value.
	 *
	 * @method explode
	 * @param {string} s String to split.
	 * @param {string} d Delimiter to split by.
	 * @example
	 * // Split a string into an array with a,b,c
	 * var arr = tinymce.explode('a, b,   c');
	 */
	function explode(s, d) {
		if (!s || is(s, 'array')) {
			return s;
		}

		return map(s.split(d || ','), trim);
	}

	return {
		trim: trim,
		isArray: isArray,
		is: is,
		toArray: toArray,
		makeMap: makeMap,
		each: each,
		map: map,
		grep: grep,
		inArray: inArray,
		extend: extend,
		create: create,
		walk: walk,
		createNS: createNS,
		resolve: resolve,
		explode: explode
	};
});