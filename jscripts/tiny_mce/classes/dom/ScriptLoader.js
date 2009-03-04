/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	var each = tinymce.each, Event = tinymce.dom.Event;

	/**#@+
	 * @class This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks when
	 * various items gets loaded. This class is useful to 
	 * @member tinymce.dom.ScriptLoader
	 */
	tinymce.create('tinymce.dom.ScriptLoader', {
		/**
		 * Constructs a new script loaded instance. Check the Wiki for more detailed information for this method.
		 *
		 * @constructor
		 * @param {Object} s Optional settings object for the ScriptLoaded.
		 */
		ScriptLoader : function(s) {
			this.settings = s || {};
			this.queue = [];
			this.lookup = {};
		},

		/**#@+
		 * @method
		 */

		/**
		 * Returns true/false if a script has been loaded or not.
		 *
		 * @param {String} u URL to check for.
		 */
		isDone : function(u) {
			return this.lookup[u] ? this.lookup[u].state == 2 : 0;
		},

		/**
		 * Marks a specific script to be loaded. This can be useful if a script got loaded outside
		 * the script loader or to skip it from loading some script.
		 *
		 * @param {string} u Absolute URL to the script to mark as loaded.
		 */
		markDone : function(u) {
			this.lookup[u] = {state : 2, url : u};
		},

		/**
		 * Adds a specific script to the load queue of the script loader.
		 *
		 * @param {String} u Absolute URL to script to add.
		 * @param {function} cb Optional callback function to execute ones this script gets loaded.
		 * @param {Object} s Optional scope to execute callback in.
		 * @param {bool} pr Optional state to add to top or bottom of load queue. Defaults to bottom.
		 * @return {object} Load queue object contains, state, url and callback.
		 */
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
				t.queue.unshift(o);
			else
				t.queue.push(o);

			lo[u] = o;

			return o;
		},

		/**
		 * Loads a specific script directly without adding it to the load queue.
		 *
		 * @param {String} u Absolute URL to script to add.
		 * @param {function} cb Optional callback function to execute ones this script gets loaded.
		 * @param {Object} s Optional scope to execute callback in.
		 */
		load : function(u, cb, s) {
			var t = this, o;

			if (o = t.lookup[u]) {
				// Is loaded fire callback
				if (cb && o.state == 2)
					cb.call(s || t);

				return o;
			}

			function loadScript(u) {
				if (Event.domLoaded || t.settings.strict_mode) {
					tinymce.util.XHR.send({
						url : tinymce._addVer(u),
						error : t.settings.error,
						async : false,
						success : function(co) {
							t.eval(co);
						}
					});
				} else
					document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"></script>');
			};

			if (!tinymce.is(u, 'string')) {
				each(u, function(u) {
					loadScript(u);
				});

				if (cb)
					cb.call(s || t);
			} else {
				loadScript(u);

				if (cb)
					cb.call(s || t);
			}
		},

		/**
		 * Starts the loading of the queue.
		 *
		 * @param {function} cb Optional callback to execute when all queued items are loaded.
		 * @param {Object} s Optional scope to execute the callback in.
		 */
		loadQueue : function(cb, s) {
			var t = this;

			if (!t.queueLoading) {
				t.queueLoading = 1;
				t.queueCallbacks = [];

				t.loadScripts(t.queue, function() {
					t.queueLoading = 0;

					if (cb)
						cb.call(s || t);

					each(t.queueCallbacks, function(o) {
						o.func.call(o.scope);
					});
				});
			} else if (cb)
				t.queueCallbacks.push({func : cb, scope : s || t});
		},

		/**
		 * Evaluates the specified string inside the global namespace/window scope.
		 *
		 * @param {string} Script contents to evaluate.
		 */
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

		/**
		 * Loads the specified queue of files and executes the callback ones they are loaded.
		 * This method is generally not used outside this class but it might be useful in some scenarios. 
		 *
		 * @param {Array} sc Array of queue items to load.
		 * @param {function} cb Optional callback to execute ones all items are loaded.
		 * @param {Object} s Optional scope to execute callback in.
		 */
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

				tinymce.dom.ScriptLoader.loadScript(o.url, function() {
					done(o);
					allDone();
				});

				/*
				tinymce.util.XHR.send({
					url : o.url,
					error : t.settings.error,
					success : function(co) {
						t.eval(co);
						done(o);
						allDone();
					}
				});
				*/
			};

			each(sc, function(o) {
				var u = o.url;

				// Add to queue if needed
				if (!lo[u]) {
					lo[u] = o;
					t.queue.push(o);
				} else
					o = lo[u];

				// Is already loading or has been loaded
				if (o.state > 0)
					return;

				if (!Event.domLoaded && !t.settings.strict_mode) {
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

					document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"' + ol + '></script>');

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
			},

			/**
			 * Loads the specified script without adding it to any load queue.
			 *
			 * @param {string} u URL to dynamically load.
			 * @param {function} cb Callback function to executed on load.
			 */
			loadScript : function(u, cb) {
				var id = tinymce.DOM.uniqueId(), e;

				function done() {
					Event.clear(id);
					tinymce.DOM.remove(id);

					if (cb) {
						cb.call(document, u);
						cb = 0;
					}
				};

				if (tinymce.isIE) {
/*					Event.add(e, 'readystatechange', function(e) {
						if (e.target && e.target.readyState == 'complete')
							done();
					});*/

					tinymce.util.XHR.send({
						url : tinymce._addVer(u),
						async : false,
						success : function(co) {
							window.execScript(co);
							done();
						}
					});
				} else {
					e = tinymce.DOM.create('script', {id : id, type : 'text/javascript', src : tinymce._addVer(u)});
					Event.add(e, 'load', done);

					// Check for head or body
					(document.getElementsByTagName('head')[0] || document.body).appendChild(e);
				}
			}
		}

		/**#@-*/
	});

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})(tinymce);
