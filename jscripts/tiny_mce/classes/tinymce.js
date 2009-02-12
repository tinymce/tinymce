/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class Core namespace with core functionality for the TinyMCE API all sub classes will be added to this namespace/object.
 * @static
 * @member tinymce
 */
var tinymce = {
	majorVersion : '@@tinymce_major_version@@',
	minorVersion : '@@tinymce_minor_version@@',
	releaseDate : '@@tinymce_release_date@@',

	/**#@+
	 * @method
	 */

	/**
	 * Initializes the TinyMCE global namespace this will setup browser detection and figure out where TinyMCE is running from.
	 */
	_init : function() {
		var t = this, d = document, w = window, na = navigator, ua = na.userAgent, i, nl, n, base, p, v;

		// Browser checks
		t.isOpera = w.opera && opera.buildNumber;
		t.isWebKit = /WebKit/.test(ua);
		t.isOldWebKit = t.isWebKit && !w.getSelection().getRangeAt;
		t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);
		t.isIE6 = t.isIE && /MSIE [56]/.test(ua);
		t.isGecko = !t.isWebKit && /Gecko/.test(ua);
		t.isMac = ua.indexOf('Mac') != -1;
		t.isAir = /adobeair/i.test(ua);

		// TinyMCE .NET webcontrol might be setting the values for TinyMCE
		if (w.tinyMCEPreInit) {
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
			if (n.src && /tiny_mce(|_dev|_src|_gzip|_jquery|_prototype).js/.test(n.src)) {
				if (/_(src|dev)\.js/g.test(n.src))
					t.suffix = '_src';

				if ((p = n.src.indexOf('?')) != -1)
					t.query = n.src.substring(p + 1);

				t.baseURL = n.src.substring(0, n.src.lastIndexOf('/'));

				// If path to script is relative and a base href was found add that one infront
				if (base && t.baseURL.indexOf('://') == -1)
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
	 * @param {Object} o Object to check type of.
	 * @param {string} t Optional type to check for.
	 * @return {bool} true/false if the object is of the specified type.
	 */
	is : function(o, t) {
		var n = typeof(o);

		if (!t)
			return n != 'undefined';

		if (t == 'array' && (o instanceof Array))
			return true;

		return n == t;
	},

	// #ifndef jquery

	/**
	 * Performs an iteration of all items in a collection such as an object or array. This method will execure the
	 * callback function for each item in the collection, if the callback returns false the iteration will terminate.
	 * The callback has the following format: cb(value, key_or_index).
	 *
	 * @param {Object} o Collection to iterate.
	 * @param {function} cb Callback function to execute for each item.
	 * @param {Object} s Optional scope to execute the callback in.
	 */
	each : function(o, cb, s) {
		var n, l;

		if (!o)
			return 0;

		s = s || o;

		if (typeof(o.length) != 'undefined') {
			// Indexed arrays, needed for Safari
			for (n=0, l = o.length; n<l; n++) {
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

	/**
	 * Creates a new array by the return value of each iteration function call. This enables you to convert
	 * one array list into another.
	 *
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
	 * @param {Array} a Array of items to loop though.
	 * @param {function} f Function to call for each item. Include/exclude depends on it's return value.
	 * @return {Array} New array with values imported and filtered based in input.
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
	 * @param {Array} a Array/Object to search for value in.
	 * @param {Object} v Value to check for inside the array.
	 * @return {Number/String} Index of item inside the array inside an object. Or -1 if it wasn't found.
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
	 * @param {Object} o Object to extend with new items.
	 * @param {Object} e..n Object(s) to extend the specified object with.
	 * @return {Object} o New extended object, same reference as the input object.
	 */
	extend : function(o, e) {
		var i, a = arguments;

		for (i=1; i<a.length; i++) {
			e = a[i];

			tinymce.each(e, function(v, n) {
				if (typeof(v) !== 'undefined')
					o[n] = v;
			});
		}

		return o;
	},

	/**
	 * Removes whitespace from the beginning and end of a string.
	 *
	 * @param {String} s String to remove whitespace from.
	 * @return {String} New string with removed whitespace.
	 */
	trim : function(s) {
		return (s ? '' + s : '').replace(/^\s*|\s*$/g, '');
	},

	// #endif

	/**
	 * Creates a class, subclass or static singleton.
	 * More details on this method can be found in the Wiki.
	 *
	 * @param {String} s Class name, inheritage and prefix.
	 * @param {Object} o Collection of methods to add to the class.
	 */
	create : function(s, p) {
		var t = this, sp, ns, cn, scn, c, de = 0;

		// Parse : <prefix> <class>:<super class>
		s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
		cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

		// Create namespace for new class
		ns = t.createNS(s[3].replace(/\.\w+$/, ''));

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
	 * @param {String} n Namespace to create for example a.b.c.d.
	 * @param {Object} o Optional object to add namespace to, defaults to window.
	 * @return {Object} New namespace object the last item in path.
	 */
	createNS : function(n, o) {
		var i, v;

		o = o || window;

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
	 * @param {String} n Path to resolve for example a.b.c.d.
	 * @param {Object} o Optional object to search though, defaults to window.
	 * @return {Object} Last object in path or null if it couldn't be resolved.
	 */
	resolve : function(n, o) {
		var i, l;

		o = o || window;

		n = n.split('.');
		for (i=0, l = n.length; i<l; i++) {
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
	 * @param {function} f Function to execute before the document gets unloaded.
	 * @param {Object} s Optional scope to execute the function in.
	 * @return {function} Returns the specified unload handler function.
	 */
	addUnload : function(f, s) {
		var t = this, w = window;

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
					if (w.detachEvent) {
						w.detachEvent('onbeforeunload', fakeUnload);
						w.detachEvent('onunload', unload);
					} else if (w.removeEventListener)
						w.removeEventListener('unload', unload, false);

					// Destroy references
					t.unloads = o = li = w = unload = null;

					// Run garbarge collector on IE
					if (window.CollectGarbage)
						window.CollectGarbage();
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
						unload();

						d = null;
					};

					// Fire unload when the currently loading page is stopped
					d.attachEvent('onstop', stop);

					// Remove onstop listener after a while to prevent the unload function
					// to execute if the user presses cancel in an onbeforeunload
					// confirm dialog and then presses the browser stop button
					window.setTimeout(function() {
						d.detachEvent('onstop', stop);
					}, 0);
				}
			};

			// Attach unload handler
			if (w.attachEvent) {
				w.attachEvent('onunload', unload);
				w.attachEvent('onbeforeunload', fakeUnload);
			} else if (w.addEventListener)
				w.addEventListener('unload', unload, false);

			// Setup initial unload handler array
			t.unloads = [f];
		} else
			t.unloads.push(f);

		return f;
	},

	/**
	 * Removes the specified function form the unload handler list.
	 *
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
	 * @param {string} s String to split.
	 * @param {string} d Delimiter to split by.
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
	}

	/**#@-*/
};

// Required for GZip AJAX loading
window.tinymce = tinymce;

// Initialize the API
tinymce._init();
