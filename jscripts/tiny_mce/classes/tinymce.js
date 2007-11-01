/**
 * $Id: TinyMCE_Array.class.js 224 2007-02-23 20:06:27Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

var tinymce = {
	majorVersion : '3',
	minorVersion : '0a2',
	releaseDate : '2007-11-xx',

	init : function() {
		var t = this, ua = navigator.userAgent, i, nl = document.getElementsByTagName('script'), n;

		// Browser checks
		t.isOpera = window.opera && opera.buildNumber;
		t.isWebKit = /WebKit/.test(ua);
		t.isOldWebKit = t.isWebKit && !window.getSelection().getRangeAt;
		t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(navigator.appName);
		t.isIE6 = t.isIE && /MSIE [56]/.test(ua);
		t.isGecko = !t.isWebKit && /Gecko/.test(ua);
		t.isMac = ua.indexOf('Mac') != -1;
		t.suffix = '';

		for (i=0; i<nl.length; i++) {
			n = nl[i];

			if (n.src && n.src.indexOf('tiny_mce') != -1) {
				if (/_(src|dev)\.js/g.test(n.src))
					t.suffix = '_src';

				return t.baseURL = n.src.substring(0, n.src.lastIndexOf('/'));
			}
		}

		n = document.getElementsByTagName('head')[0];
		if (n) {
			nl = n.getElementsByTagName('script');
			for (i=0; i<nl.length; i++) {
				n = nl[i];

				if (n.src && n.src.indexOf('tiny_mce') != -1) {
					if (/_(src|dev)\.js/g.test(n.src))
						t.suffix = '_src';

					return t.baseURL = n.src.substring(0, n.src.lastIndexOf('/'));
				}
			}
		}

		return null;
	},

	is : function(o, t) {
		o = typeof(o);

		if (!t)
			return o != 'undefined';

		return o == t;
	},

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

	map : function(a, f) {
		var o = [];

		tinymce.each(a, function(v) {
			o.push(f(v));
		});

		return o;
	},

	filter : function(a, f) {
		var o = [];

		tinymce.each(a, function(v) {
			if (!f || f(v))
				o.push(v);
		});

		return o;
	},

	indexOf : function(a, v) {
		var x = -1;

		tinymce.each(a, function(c, i) {
			if (c === v) {
				x = i;
				return false;
			}
		});

		return x;
	},

	extend : function(o, e) {
		tinymce.each(e, function(v, n) {
			if (typeof(v) !== 'undefined')
				o[n] = v;
		});

		return o;
	},

	trim : function(s) {
		return ('' + s).replace(/^\s*|\s*$/g, '');
	},

	create : function(s, p) {
		var t = this, sp, ns, cn, scn, c, de = 0;

		// Parse : <prefix> <class>:<super class>
		s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
		cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

		// Create namespace for new class
		ns = t.createNS(s[3].replace(/\.\w+$/, ''));

		// Make pure static class
		if (s[2] == 'static') {
			ns[cn] = p;
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

		// Add static methods
		t.each(p['static'], function(f, n) {
			ns[cn][n] = f;
		});

		// Extend
		if (s[5]) {
			sp = t.get(s[5]).prototype;
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
				if (n != scn)
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
	},

	walk : function(o, n, f, s) {
		s = s || this;

		if (o && (o = o[n])) {
			tinymce.each(o, function(o, i) {
				if (f.call(s, o, i, n) === false)
					return false;

				tinymce.walk(o, n, f, s);
			});
		}
	},

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

	get : function(n, o) {
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

	addUnload : function(f, s) {
		var t = this, w = window, unload;

		f = {func : f, scope : s || this};

		if (!t.unloads) {
			unload = function() {
				var li = t.unloads, o, n;

				// Call unload handlers
				for (n in li) {
					o = li[n];

					if (o && o.func)
						o.func.call(o.scope);
				}

				// Detach unload function
				if (w.detachEvent)
					w.detachEvent('onunload', unload);
				else if (w.removeEventListener)
					w.removeEventListener('unload', unload, false);

				// Destroy references
				tinymce = o = li = w = unload = null;

				// Run garbarge collector on IE
				if (window.CollectGarbage)
					window.CollectGarbage();
			};

			// Attach unload handler
			if (w.attachEvent)
				w.attachEvent('onunload', unload);
			else if (w.addEventListener)
				w.addEventListener('unload', unload, false);

			// Setup initial unload handler array
			t.unloads = [f];
		} else
			t.unloads.push(f);

		return f;
	},

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
	}
};

// Initialize the API
tinymce.init();
