/**
 * EventUtils.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, Event;

	/**
	 * This class handles DOM events in a cross platform fasion it also keeps track of element
	 * and handler references to be able to clean elements to reduce IE memory leaks.
	 *
	 * @class tinymce.dom.EventUtils
	 */
	tinymce.create('tinymce.dom.EventUtils', {
		/**
		 * Constructs a new EventUtils instance.
		 *
		 * @constructor
		 * @method EventUtils
		 */
		EventUtils : function() {
			this.inits = [];
			this.events = [];
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method add
		 * @param {Element/Document/Window/Array/String} o Object or element id string to add event handler to or an array of elements/ids/documents.
		 * @param {String/Array} n Name of event handler to add for example: click.
		 * @param {function} f Function to execute when the event occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 * @example
		 * // Adds a click handler to the current document
		 * tinymce.dom.Event.add(document, 'click', function(e) {
		 *    console.debug(e.target);
		 * });
		 */
		add : function(o, n, f, s) {
			var cb, t = this, el = t.events, r;

			if (n instanceof Array) {
				r = [];

				each(n, function(n) {
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
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
				// Is all events disabled
				if (t.disabled)
					return;

				e = e || window.event;

				// Patch in target, preventDefault and stopPropagation in IE it's W3C valid
				if (e && isIE) {
					if (!e.target)
						e.target = e.srcElement;

					// Patch in preventDefault, stopPropagation methods for W3C compatibility
					tinymce.extend(e, t._stoppers);
				}

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
		 * @method remove
		 * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
		 * @param {String} n Event handler name like for example: "click"
		 * @param {function} f Function to remove.
		 * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
		 * @example
		 * // Adds a click handler to the current document
		 * var func = tinymce.dom.Event.add(document, 'click', function(e) {
		 *    console.debug(e.target);
		 * });
		 * 
		 * // Removes the click handler from the document
		 * tinymce.dom.Event.remove(document, 'click', func);
		 */
		remove : function(o, n, f) {
			var t = this, a = t.events, s = false, r;

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
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
		 * @method clear
		 * @param {Object} o DOM element or object to remove all events from.
		 * @example
		 * // Cancels all mousedown events in the active editor
		 * tinyMCE.activeEditor.onMouseDown.add(function(ed, e) {
		 *    return tinymce.dom.Event.cancel(e);
		 * });
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

		/**
		 * Cancels an event for both bubbeling and the default browser behavior.
		 *
		 * @method cancel
		 * @param {Event} e Event object to cancel.
		 * @return {Boolean} Always false.
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
		 * @method stop
		 * @param {Event} e Event to cancel bubbeling on.
		 * @return {Boolean} Always false.
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
		 * @method prevent
		 * @param {Event} e Event to prevent default browser behvaior of an event.
		 * @return {Boolean} Always false.
		 */
		prevent : function(e) {
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;

			return false;
		},

		/**
		 * Destroys the instance.
		 *
		 * @method destroy
		 */
		destroy : function() {
			var t = this;

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

		_pageInit : function(win) {
			var t = this;

			// Keep it from running more than once
			if (t.domLoaded)
				return;

			t.domLoaded = true;

			each(t.inits, function(c) {
				c();
			});

			t.inits = [];
		},

		_wait : function(win) {
			var t = this, doc = win.document;

			// No need since the document is already loaded
			if (win.tinyMCE_GZ && tinyMCE_GZ.loaded) {
				t.domLoaded = 1;
				return;
			}

			// Use IE method
			if (doc.attachEvent) {
				doc.attachEvent("onreadystatechange", function() {
					if (doc.readyState === "complete") {
						doc.detachEvent("onreadystatechange", arguments.callee);
						t._pageInit(win);
					}
				});

				if (doc.documentElement.doScroll && win == win.top) {
					(function() {
						if (t.domLoaded)
							return;

						try {
							// If IE is used, use the trick by Diego Perini licensed under MIT by request to the author.
							// http://javascript.nwbox.com/IEContentLoaded/
							doc.documentElement.doScroll("left");
						} catch (ex) {
							setTimeout(arguments.callee, 0);
							return;
						}

						t._pageInit(win);
					})();
				}
			} else if (doc.addEventListener) {
				t._add(win, 'DOMContentLoaded', function() {
					t._pageInit(win);
				});
			}

			t._add(win, 'load', function() {
				t._pageInit(win);
			});
		},

		_stoppers : {
			preventDefault : function() {
				this.returnValue = false;
			},

			stopPropagation : function() {
				this.cancelBubble = true;
			}
		}
	});

	/**
	 * Instance of EventUtils for the current document.
	 *
	 * @property Event
	 * @member tinymce.dom
	 * @type tinymce.dom.EventUtils
	 */
	Event = tinymce.dom.Event = new tinymce.dom.EventUtils();

	// Dispatch DOM content loaded event for IE and Safari
	Event._wait(window);

	tinymce.addUnload(function() {
		Event.destroy();
	});
})(tinymce);
