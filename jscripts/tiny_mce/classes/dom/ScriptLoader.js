/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.dom.ScriptLoader', {
		ScriptLoader : function(s) {
			this.settings = s || {};
			this.que = [];
			this.lookup = {};
		},

		prepend : function(u, cb, s) {
			this.add(u, cb, s, 1);
		},

		add : function(u, cb, s, pr) {
			var t = this, lo = t.lookup, o;

			if (o = lo[u]) {
				// Is loaded fire callback
				if (cb && o.state == 2)
					cb.call(s || this);

				return o;
			}

			o = {state : 0, url : u, func : cb, scope : s || this};

			if (pr)
				t.que.unshift(o);
			else
				t.que.push(o);

			lo[u] = o;

			return o;
		},

		load : function(u, cb, s) {
			var o;

			if (!tinymce.is(u, 'string')) {
				o = [];

				each(u, function(u) {
					o.push({state : 0, url : u});
				});

				this.loadScripts(o, cb, s);
			} else
				this.loadScripts([{state : 0, url : u}], cb, s);
		},

		loadQue : function(cb, s) {
			var t = this;

			if (!t.queLoading) {
				t.queLoading = 1;
				t.queCallbacks = [];

				t.loadScripts(t.que, function() {
					t.queLoading = 0;

					if (cb)
						cb.call(s || t);

					each(t.queCallbacks, function(o) {
						o.func.call(o.scope);
					});
				});
			} else if (cb)
				t.queCallbacks.push({func : cb, scope : s || t});
		},

		eval : function(co) {
			var w = window;

			// Evaluate script
			if (!w.execScript) {
				try {
					eval.call(w, co);
				} catch (ex) {
					eval(co, w); // Firefox 3.0a8
				}
			} else
				w.execScript(co); // IE
		},

		loadScripts : function(sc, cb, s) {
			var t = this, lo = t.lookup;

			function done(o) {
				o.state = 2; // Has been loaded

				// Run callback
				if (o.func)
					o.func.call(o.scope || t);
			};

			function allDone() {
				var l;

				// Check if all files are loaded
				l = sc.length;
				each(sc, function(o) {
					o = lo[o.url];

					if (o.state === 2) {// It has finished loading
						done(o);
						l--;
					} else
						load(o);
				});

				// They are all loaded
				if (l === 0 && cb) {
					cb.call(s || t);
					cb = 0;
				}
			};

			function load(o) {
				if (o.state > 0)
					return;

				o.state = 1; // Is loading

				tinymce.util.XHR.send({
					url : o.url,
					error : t.settings.error,
					success : function(co) {
						t.eval(co);
						done(o);
						allDone();
					}
				});
			};

			each(sc, function(o) {
				var u = o.url;

				// Add to que if needed
				if (!lo[u]) {
					lo[u] = o;
					t.que.push(o);
				} else
					o = lo[u];

				// Is already loading or has been loaded
				if (o.state > 0)
					return;

				if (!tinymce.dom.Event.domLoaded && !t.settings.strict_mode) {
					var ix, ol = '';

					// Add onload events
					if (cb || o.func) {
						o.state = 1; // Is loading

						ix = tinymce.dom.ScriptLoader._addOnLoad(function() {
							done(o);
							allDone();
						});

						if (tinymce.isIE)
							ol = ' onreadystatechange="';
						else
							ol = ' onload="';

						ol += 'tinymce.dom.ScriptLoader._onLoad(this,\'' + u + '\',' + ix + ');"';
					}

					document.write('<script type="text/javascript" src="' + u + '"' + ol + '></script>');

					if (!o.func)
						done(o);
				} else
					load(o);
			});

			allDone();
		},

		// Static methods
		'static' : {
			_addOnLoad : function(f) {
				var t = this;

				t._funcs = t._funcs || [];
				t._funcs.push(f);

				return t._funcs.length - 1;
			},

			_onLoad : function(e, u, ix) {
				if (!tinymce.isIE || e.readyState == 'complete')
					this._funcs[ix].call(this);
			}
		}
	});

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})();

/*
	tinymce.ScriptLoader.add('test1.js');
	tinymce.ScriptLoader.add('test2.js');
	tinymce.ScriptLoader.add('test3.js');
	tinymce.ScriptLoader.loadQue(function() {
		alert('Loaded!!');
	});

	tinymce.ScriptLoader = new tinymce.compressor.ScriptLoader();
*/