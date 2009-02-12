/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, Event;

	/**#@+
	 * @class This class handles DOM events in a cross platform fasion it also keeps track of element
	 * and handler references to be able to clean elements to reduce IE memory leaks.
	 * @static
	 * @member tinymce.dom.Event
	 */
	tinymce.create('static tinymce.dom.Event', {
		inits : [],
		events : [],

		/**#@+
		 * @method
		 */

		// #ifndef jquery

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @param {Element/Document/Window/Array/String} o Object or element id string to add event handler to or an array of elements/ids/documents.
		 * @param {String} n Name of event handler to add for example: click.
		 * @param {function} f Function to execute when the event occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 */
		add : function(o, n, f, s) {
			var cb, t = this, el = t.events, r;

			// Handle array
			if (o && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			o = DOM.get(o);

			if (!o)
				return;

			// Setup event callback
			cb = function(e) {
				e = e || window.event;

				// Patch in target in IE it's W3C valid
				if (e && !e.target && isIE)
					e.target = e.srcElement;

				if (!s)
					return f(e);

				return f.call(s, e);
			};

			if (n == 'unload') {
				tinymce.unloads.unshift({func : cb});
				return cb;
			}

			if (n == 'init') {
				if (t.domLoaded)
					cb();
				else
					t.inits.push(cb);

				return cb;
			}

			// Store away listener reference
			el.push({
				obj : o,
				name : n,
				func : f,
				cfunc : cb,
				scope : s
			});

			t._add(o, n, cb);

			return f;
		},

		/**
		 * Removes the specified event handler by name and function from a element or collection of elements.
		 *
		 * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
		 * @param {String} n Event handler name like for example: "click"
		 * @param {function} f Function to remove.
		 * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
		 */
		remove : function(o, n, f) {
			var t = this, a = t.events, s = false, r;

			// Handle array
			if (o && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.remove(o, n, f));
				});

				return r;
			}

			o = DOM.get(o);

			each(a, function(e, i) {
				if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
					a.splice(i, 1);
					t._remove(o, n, e.cfunc);
					s = true;
					return false;
				}
			});

			return s;
		},

		/**
		 * Clears all events of a specific object.
		 *
		 * @param {Object} o DOM element or object to remove all events from.
		 */
		clear : function(o) {
			var t = this, a = t.events, i, e;

			if (o) {
				o = DOM.get(o);

				for (i = a.length - 1; i >= 0; i--) {
					e = a[i];

					if (e.obj === o) {
						t._remove(e.obj, e.name, e.cfunc);
						e.obj = e.cfunc = null;
						a.splice(i, 1);
					}
				}
			}
		},

		// #endif

		/**
		 * Cancels an event for both bubbeling and the default browser behavior.
		 *
		 * @param {Event} e Event object to cancel.
		 * @return {bool} Always false.
		 */
		cancel : function(e) {
			if (!e)
				return false;

			this.stop(e);
			return this.prevent(e);
		},

		/**
		 * Stops propogation/bubbeling of an event.
		 *
		 * @param {Event} e Event to cancel bubbeling on.
		 * @return {bool} Always false.
		 */
		stop : function(e) {
			if (e.stopPropagation)
				e.stopPropagation();
			else
				e.cancelBubble = true;

			return false;
		},

		/**
		 * Prevent default browser behvaior of an event.
		 *
		 * @param {Event} e Event to prevent default browser behvaior of an event.
		 * @return {bool} Always false.
		 */
		prevent : function(e) {
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;

			return false;
		},

		_unload : function() {
			var t = Event;

			each(t.events, function(e, i) {
				t._remove(e.obj, e.name, e.cfunc);
				e.obj = e.cfunc = null;
			});

			t.events = [];
			t = null;
		},

		_add : function(o, n, f) {
			if (o.attachEvent)
				o.attachEvent('on' + n, f);
			else if (o.addEventListener)
				o.addEventListener(n, f, false);
			else
				o['on' + n] = f;
		},

		_remove : function(o, n, f) {
			if (o) {
				try {
					if (o.detachEvent)
						o.detachEvent('on' + n, f);
					else if (o.removeEventListener)
						o.removeEventListener(n, f, false);
					else
						o['on' + n] = null;
				} catch (ex) {
					// Might fail with permission denined on IE so we just ignore that
				}
			}
		},

		_pageInit : function() {
			var e = Event;

			// Safari on Mac fires this twice
			if (e.domLoaded)
				return;

			e._remove(window, 'DOMContentLoaded', e._pageInit);
			e.domLoaded = true;

			each(e.inits, function(c) {
				c();
			});

			e.inits = [];
		},

		_wait : function() {
			var t;

			// No need since the document is already loaded
			if (window.tinyMCE_GZ && tinyMCE_GZ.loaded) {
				Event.domLoaded = 1;
				return;
			}

			if (isIE && document.location.protocol != 'https:') {
				// Fake DOMContentLoaded on IE
				document.write('<script id=__ie_onload defer src=\'javascript:""\';><\/script>');
				DOM.get("__ie_onload").onreadystatechange = function() {
					if (this.readyState == "complete") {
						Event._pageInit();
						DOM.get("__ie_onload").onreadystatechange = null; // Prevent leak
					}
				};
			} else {
				Event._add(window, 'DOMContentLoaded', Event._pageInit, Event);

				if (isIE || isWebKit) {
					t = setInterval(function() {
						if (/loaded|complete/.test(document.readyState)) {
							clearInterval(t);
							Event._pageInit();
						}
					}, 10);
				}
			}
		}

		/**#@-*/
	});

	// Shorten name
	Event = tinymce.dom.Event;

	// Dispatch DOM content loaded event for IE and Safari
	Event._wait();
	tinymce.addUnload(Event._unload);
})();
