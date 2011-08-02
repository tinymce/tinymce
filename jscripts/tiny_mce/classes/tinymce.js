/**
 * tinymce.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(win) {
	var whiteSpaceRe = /^\s*|\s*$/g,
		undefined, isRegExpBroken = 'B'.replace(/A(.)|B/, '$1') === '$1';

	/**
	 * Core namespace with core functionality for the TinyMCE API all sub classes will be added to this namespace/object.
	 *
	 * @static
	 * @class tinymce
	 * @example
	 * // Using each method
	 * tinymce.each([1, 2, 3], function(v, i) {
	 *   console.log(i + '=' + v);
	 * });
	 *
	 * // Checking for a specific browser
	 * if (tinymce.isIE)
	 *   console.log("IE");
	 */
	var tinymce = {
		/**
		 * Major version of TinyMCE build.
		 *
		 * @property majorVersion
		 * @type String
		 */
		majorVersion : '@@tinymce_major_version@@',

		/**
		 * Major version of TinyMCE build.
		 *
		 * @property minorVersion
		 * @type String
		 */
		minorVersion : '@@tinymce_minor_version@@',

		/**
		 * Release date of TinyMCE build.
		 *
		 * @property releaseDate
		 * @type String
		 */
		releaseDate : '@@tinymce_release_date@@',

		/**
		 * Initializes the TinyMCE global namespace this will setup browser detection and figure out where TinyMCE is running from.
		 */
		_init : function() {
			var t = this, d = document, na = navigator, ua = na.userAgent, i, nl, n, base, p, v;

			/**
			 * Constant that is true if the browser is Opera.
			 *
			 * @property isOpera
			 * @type Boolean
			 * @final
			 */
			t.isOpera = win.opera && opera.buildNumber;

			/**
			 * Constant that is true if the browser is WebKit (Safari/Chrome).
			 *
			 * @property isWebKit
			 * @type Boolean
			 * @final
			 */
			t.isWebKit = /WebKit/.test(ua);

			/**
			 * Constant that is true if the browser is IE.
			 *
			 * @property isIE
			 * @type Boolean
			 * @final
			 */
			t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);

			/**
			 * Constant that is true if the browser is IE 6 or older.
			 *
			 * @property isIE6
			 * @type Boolean
			 * @final
			 */
			t.isIE6 = t.isIE && /MSIE [56]/.test(ua);

			/**
			 * Constant that is true if the browser is IE 7.
			 *
			 * @property isIE7
			 * @type Boolean
			 * @final
			 */
			t.isIE7 = t.isIE && /MSIE [7]/.test(ua);

			/**
			 * Constant that is true if the browser is IE 8.
			 *
			 * @property isIE8
			 * @type Boolean
			 * @final
			 */
			t.isIE8 = t.isIE && /MSIE [8]/.test(ua);

			/**
			 * Constant that is true if the browser is IE 9.
			 *
			 * @property isIE9
			 * @type Boolean
			 * @final
			 */
			t.isIE9 = t.isIE && /MSIE [9]/.test(ua);

			/**
			 * Constant that is true if the browser is Gecko.
			 *
			 * @property isGecko
			 * @type Boolean
			 * @final
			 */
			t.isGecko = !t.isWebKit && /Gecko/.test(ua);

			/**
			 * Constant that is true if the os is Mac OS.
			 *
			 * @property isMac
			 * @type Boolean
			 * @final
			 */
			t.isMac = ua.indexOf('Mac') != -1;

			/**
			 * Constant that is true if the runtime is Adobe Air.
			 *
			 * @property isAir
			 * @type Boolean
			 * @final
			 */
			t.isAir = /adobeair/i.test(ua);

			/**
			 * Constant that tells if the current browser is an iPhone or iPad.
			 *
			 * @property isIDevice
			 * @type Boolean
			 * @final
			 */
			t.isIDevice = /(iPad|iPhone)/.test(ua);
			
			/**
			 * Constant that is true if the current browser is running on iOS 5 or greater.
			 *
			 * @property isIOS5
			 * @type Boolean
			 * @final
			 */
			t.isIOS5 = t.isIDevice && ua.match(/AppleWebKit\/(\d*)/)[1]>=534;

			// TinyMCE .NET webcontrol might be setting the values for TinyMCE
			if (win.tinyMCEPreInit) {
				t.suffix = tinyMCEPreInit.suffix;
				t.baseURL = tinyMCEPreInit.base;
				t.query = tinyMCEPreInit.query;
				return;
			}

			// Get suffix and base
			t.suffix = '';

			// If base element found, add that infront of baseURL
			nl = d.getElementsByTagName('base');
			for (i=0; i<nl.length; i++) {
				if (v = nl[i].href) {
					// Host only value like http://site.com or http://site.com:8008
					if (/^https?:\/\/[^\/]+$/.test(v))
						v += '/';

					base = v ? v.match(/.*\//)[0] : ''; // Get only directory
				}
			}

			function getBase(n) {
				if (n.src && /tiny_mce(|_gzip|_jquery|_prototype|_full)(_dev|_src)?.js/.test(n.src)) {
					if (/_(src|dev)\.js/g.test(n.src))
						t.suffix = '_src';

					if ((p = n.src.indexOf('?')) != -1)
						t.query = n.src.substring(p + 1);

					t.baseURL = n.src.substring(0, n.src.lastIndexOf('/'));

					// If path to script is relative and a base href was found add that one infront
					// the src property will always be an absolute one on non IE browsers and IE 8
					// so this logic will basically only be executed on older IE versions
					if (base && t.baseURL.indexOf('://') == -1 && t.baseURL.indexOf('/') !== 0)
						t.baseURL = base + t.baseURL;

					return t.baseURL;
				}

				return null;
			};

			// Check document
			nl = d.getElementsByTagName('script');
			for (i=0; i<nl.length; i++) {
				if (getBase(nl[i]))
					return;
			}

			// Check head
			n = d.getElementsByTagName('head')[0];
			if (n) {
				nl = n.getElementsByTagName('script');
				for (i=0; i<nl.length; i++) {
					if (getBase(nl[i]))
						return;
				}
			}

			return;
		},

		/**
		 * Checks if a object is of a specific type for example an array.
		 *
		 * @method is
		 * @param {Object} o Object to check type of.
		 * @param {string} t Optional type to check for.
		 * @return {Boolean} true/false if the object is of the specified type.
		 */
		is : function(o, t) {
			if (!t)
				return o !== undefined;

			if (t == 'array' && (o.hasOwnProperty && o instanceof Array))
				return true;

			return typeof(o) == t;
		},

		/**
		 * Makes a name/object map out of an array with names.
		 *
		 * @method makeMap
		 * @param {Array/String} items Items to make map out of.
		 * @param {String} delim Optional delimiter to split string by.
		 * @param {Object} map Optional map to add items to.
		 * @return {Object} Name/value map of items.
		 */
		makeMap : function(items, delim, map) {
			var i;

			items = items || [];
			delim = delim || ',';

			if (typeof(items) == "string")
				items = items.split(delim);

			map = map || {};

			i = items.length;
			while (i--)
				map[items[i]] = {};

			return map;
		},

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
		 * tinymce.each({a : 1, b : 2, c: 3], function(v, k) {
		 *     console.debug("Value: " + v + ", Key: " + k);
		 * });
		 */
		each : function(o, cb, s) {
			var n, l;

			if (!o)
				return 0;

			s = s || o;

			if (o.length !== undefined) {
				// Indexed arrays, needed for Safari
				for (n=0, l = o.length; n < l; n++) {
					if (cb.call(s, o[n], n, o) === false)
						return 0;
				}
			} else {
				// Hashtables
				for (n in o) {
					if (o.hasOwnProperty(n)) {
						if (cb.call(s, o[n], n, o) === false)
							return 0;
					}
				}
			}

			return 1;
		},

		// #ifndef jquery

		/**
		 * Creates a new array by the return value of each iteration function call. This enables you to convert
		 * one array list into another.
		 *
		 * @method map
		 * @param {Array} a Array of items to iterate.
		 * @param {function} f Function to call for each item. It's return value will be the new value.
		 * @return {Array} Array with new values based on function return values.
		 */
		map : function(a, f) {
			var o = [];

			tinymce.each(a, function(v) {
				o.push(f(v));
			});

			return o;
		},

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
		grep : function(a, f) {
			var o = [];

			tinymce.each(a, function(v) {
				if (!f || f(v))
					o.push(v);
			});

			return o;
		},

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
		inArray : function(a, v) {
			var i, l;

			if (a) {
				for (i = 0, l = a.length; i < l; i++) {
					if (a[i] === v)
						return i;
				}
			}

			return -1;
		},

		/**
		 * Extends an object with the specified other object(s).
		 *
		 * @method extend
		 * @param {Object} o Object to extend with new items.
		 * @param {Object} e..n Object(s) to extend the specified object with.
		 * @return {Object} o New extended object, same reference as the input object.
		 * @example
		 * // Extends obj1 with two new fields
		 * var obj = tinymce.extend(obj1, {
		 *     somefield1 : 'a',
		 *     somefield2 : 'a'
		 * });
		 * 
		 * // Extends obj with obj2 and obj3
		 * tinymce.extend(obj, obj2, obj3);
		 */
		extend : function(o, e) {
			var i, l, a = arguments;

			for (i = 1, l = a.length; i < l; i++) {
				e = a[i];

				tinymce.each(e, function(v, n) {
					if (v !== undefined)
						o[n] = v;
				});
			}

			return o;
		},

		// #endif

		/**
		 * Removes whitespace from the beginning and end of a string.
		 *
		 * @method trim
		 * @param {String} s String to remove whitespace from.
		 * @return {String} New string with removed whitespace.
		 */
		trim : function(s) {
			return (s ? '' + s : '').replace(whiteSpaceRe, '');
		},

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
		 *     SomeClass : function() {
		 *         // Class constructor
		 *     },
		 * 
		 *     method : function() {
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
		 *     method : function() {
		 *         // Some method
		 *         this.parent(); // Call parent method
		 *     },
		 * 
		 *     'static' : {
		 *         staticMethod : function() {
		 *             // Static method
		 *         }
		 *     }
		 * });
		 *
		 * // Creates a singleton/static class
		 * tinymce.create('static tinymce.somepackage.SomeSingletonClass', {
		 *     method : function() {
		 *         // Some method
		 *     }
		 * });
		 */
		create : function(s, p, root) {
			var t = this, sp, ns, cn, scn, c, de = 0;

			// Parse : <prefix> <class>:<super class>
			s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
			cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

			// Create namespace for new class
			ns = t.createNS(s[3].replace(/\.\w+$/, ''), root);

			// Class already exists
			if (ns[cn])
				return;

			// Make pure static class
			if (s[2] == 'static') {
				ns[cn] = p;

				if (this.onCreate)
					this.onCreate(s[2], s[3], ns[cn]);

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
						if (n != cn)
							ns[cn].prototype[n] = f;
					}
				});
			}

			// Add static methods
			t.each(p['static'], function(f, n) {
				ns[cn][n] = f;
			});

			if (this.onCreate)
				this.onCreate(s[2], s[3], ns[cn].prototype);
		},

		/**
		 * Executed the specified function for each item in a object tree.
		 *
		 * @method walk
		 * @param {Object} o Object tree to walk though.
		 * @param {function} f Function to call for each item.
		 * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
		 * @param {String} s Optional scope to execute the function in.
		 */
		walk : function(o, f, n, s) {
			s = s || this;

			if (o) {
				if (n)
					o = o[n];

				tinymce.each(o, function(o, i) {
					if (f.call(s, o, i, n) === false)
						return false;

					tinymce.walk(o, f, n, s);
				});
			}
		},

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
		 *     method : function() {
		 *         // Some method
		 *     }
		 * };
		 */
		createNS : function(n, o) {
			var i, v;

			o = o || win;

			n = n.split('.');
			for (i=0; i<n.length; i++) {
				v = n[i];

				if (!o[v])
					o[v] = {};

				o = o[v];
			}

			return o;
		},

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
		resolve : function(n, o) {
			var i, l;

			o = o || win;

			n = n.split('.');
			for (i = 0, l = n.length; i < l; i++) {
				o = o[n[i]];

				if (!o)
					break;
			}

			return o;
		},

		/**
		 * Adds an unload handler to the document. This handler will be executed when the document gets unloaded.
		 * This method is useful for dealing with browser memory leaks where it might be vital to remove DOM references etc.
		 *
		 * @method addUnload
		 * @param {function} f Function to execute before the document gets unloaded.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Returns the specified unload handler function.
		 * @example
		 * // Fixes a leak with a DOM element that was palces in the someObject
		 * tinymce.addUnload(function() {
		 *     // Null DOM element to reduce IE memory leak
		 *     someObject.someElement = null;
		 * });
		 */
		addUnload : function(f, s) {
			var t = this;

			f = {func : f, scope : s || this};

			if (!t.unloads) {
				function unload() {
					var li = t.unloads, o, n;

					if (li) {
						// Call unload handlers
						for (n in li) {
							o = li[n];

							if (o && o.func)
								o.func.call(o.scope, 1); // Send in one arg to distinct unload and user destroy
						}

						// Detach unload function
						if (win.detachEvent) {
							win.detachEvent('onbeforeunload', fakeUnload);
							win.detachEvent('onunload', unload);
						} else if (win.removeEventListener)
							win.removeEventListener('unload', unload, false);

						// Destroy references
						t.unloads = o = li = w = unload = 0;

						// Run garbarge collector on IE
						if (win.CollectGarbage)
							CollectGarbage();
					}
				};

				function fakeUnload() {
					var d = document;

					// Is there things still loading, then do some magic
					if (d.readyState == 'interactive') {
						function stop() {
							// Prevent memory leak
							d.detachEvent('onstop', stop);

							// Call unload handler
							if (unload)
								unload();

							d = 0;
						};

						// Fire unload when the currently loading page is stopped
						if (d)
							d.attachEvent('onstop', stop);

						// Remove onstop listener after a while to prevent the unload function
						// to execute if the user presses cancel in an onbeforeunload
						// confirm dialog and then presses the browser stop button
						win.setTimeout(function() {
							if (d)
								d.detachEvent('onstop', stop);
						}, 0);
					}
				};

				// Attach unload handler
				if (win.attachEvent) {
					win.attachEvent('onunload', unload);
					win.attachEvent('onbeforeunload', fakeUnload);
				} else if (win.addEventListener)
					win.addEventListener('unload', unload, false);

				// Setup initial unload handler array
				t.unloads = [f];
			} else
				t.unloads.push(f);

			return f;
		},

		/**
		 * Removes the specified function form the unload handler list.
		 *
		 * @method removeUnload
		 * @param {function} f Function to remove from unload handler list.
		 * @return {function} Removed function name or null if it wasn't found.
		 */
		removeUnload : function(f) {
			var u = this.unloads, r = null;

			tinymce.each(u, function(o, i) {
				if (o && o.func == f) {
					u.splice(i, 1);
					r = f;
					return false;
				}
			});

			return r;
		},

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
		explode : function(s, d) {
			return s ? tinymce.map(s.split(d || ','), tinymce.trim) : s;
		},

		_addVer : function(u) {
			var v;

			if (!this.query)
				return u;

			v = (u.indexOf('?') == -1 ? '?' : '&') + this.query;

			if (u.indexOf('#') == -1)
				return u + v;

			return u.replace('#', v + '#');
		},

		// Fix function for IE 9 where regexps isn't working correctly
		// Todo: remove me once MS fixes the bug
		_replace : function(find, replace, str) {
			// On IE9 we have to fake $x replacement
			if (isRegExpBroken) {
				return str.replace(find, function() {
					var val = replace, args = arguments, i;

					for (i = 0; i < args.length - 2; i++) {
						if (args[i] === undefined) {
							val = val.replace(new RegExp('\\$' + i, 'g'), '');
						} else {
							val = val.replace(new RegExp('\\$' + i, 'g'), args[i]);
						}
					}

					return val;
				});
			}

			return str.replace(find, replace);
		}

		/**#@-*/
	};

	// Initialize the API
	tinymce._init();

	// Expose tinymce namespace to the global namespace (window)
	win.tinymce = win.tinyMCE = tinymce;

	// Describe the different namespaces

	/**
	 * Root level namespace this contains classes directly releated to the TinyMCE editor.
	 *
	 * @namespace tinymce
	 */

	/**
	 * Contains classes for handling the browsers DOM.
	 *
	 * @namespace tinymce.dom
	 */

	/**
	 * Contains html parser and serializer logic.
	 *
	 * @namespace tinymce.html
	 */

	/**
	 * Contains the different UI types such as buttons, listboxes etc.
	 *
	 * @namespace tinymce.ui
	 */

	/**
	 * Contains various utility classes such as json parser, cookies etc.
	 *
	 * @namespace tinymce.util
	 */

	/**
	 * Contains plugin classes.
	 *
	 * @namespace tinymce.plugins
	 */
})(window);
