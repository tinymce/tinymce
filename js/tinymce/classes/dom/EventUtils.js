/**
 * EventUtils.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint loopfunc:true*/

define("tinymce/dom/EventUtils", [], function() {
	"use strict";

	var eventExpandoPrefix = "mce-data-";
	var mouseEventRe = /^(?:mouse|contextmenu)|click/;
	var deprecated = {keyLocation: 1, layerX: 1, layerY: 1, returnValue: 1};

	/**
	 * Binds a native event to a callback on the speified target.
	 */
	function addEvent(target, name, callback, capture) {
		if (target.addEventListener) {
			target.addEventListener(name, callback, capture || false);
		} else if (target.attachEvent) {
			target.attachEvent('on' + name, callback);
		}
	}

	/**
	 * Unbinds a native event callback on the specified target.
	 */
	function removeEvent(target, name, callback, capture) {
		if (target.removeEventListener) {
			target.removeEventListener(name, callback, capture || false);
		} else if (target.detachEvent) {
			target.detachEvent('on' + name, callback);
		}
	}

	/**
	 * Normalizes a native event object or just adds the event specific methods on a custom event.
	 */
	function fix(originalEvent, data) {
		var name, event = data || {}, undef;

		// Dummy function that gets replaced on the delegation state functions
		function returnFalse() {
			return false;
		}

		// Dummy function that gets replaced on the delegation state functions
		function returnTrue() {
			return true;
		}

		// Copy all properties from the original event
		for (name in originalEvent) {
			// layerX/layerY is deprecated in Chrome and produces a warning
			if (!deprecated[name]) {
				event[name] = originalEvent[name];
			}
		}

		// Normalize target IE uses srcElement
		if (!event.target) {
			event.target = event.srcElement || document;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if (originalEvent && mouseEventRe.test(originalEvent.type) && originalEvent.pageX === undef && originalEvent.clientX !== undef) {
			var eventDoc = event.target.ownerDocument || document;
			var doc = eventDoc.documentElement;
			var body = eventDoc.body;

			event.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
				( doc && doc.clientLeft || body && body.clientLeft || 0);

			event.pageY = originalEvent.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
				( doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add preventDefault method
		event.preventDefault = function() {
			event.isDefaultPrevented = returnTrue;

			// Execute preventDefault on the original event object
			if (originalEvent) {
				if (originalEvent.preventDefault) {
					originalEvent.preventDefault();
				} else {
					originalEvent.returnValue = false; // IE
				}
			}
		};

		// Add stopPropagation
		event.stopPropagation = function() {
			event.isPropagationStopped = returnTrue;

			// Execute stopPropagation on the original event object
			if (originalEvent) {
				if (originalEvent.stopPropagation) {
					originalEvent.stopPropagation();
				} else {
					originalEvent.cancelBubble = true; // IE
				}
			 }
		};

		// Add stopImmediatePropagation
		event.stopImmediatePropagation = function() {
			event.isImmediatePropagationStopped = returnTrue;
			event.stopPropagation();
		};

		// Add event delegation states
		if (!event.isDefaultPrevented) {
			event.isDefaultPrevented = returnFalse;
			event.isPropagationStopped = returnFalse;
			event.isImmediatePropagationStopped = returnFalse;
		}

		return event;
	}

	/**
	 * Bind a DOMContentLoaded event across browsers and executes the callback once the page DOM is initialized.
	 * It will also set/check the domLoaded state of the event_utils instance so ready isn't called multiple times.
	 */
	function bindOnReady(win, callback, eventUtils) {
		var doc = win.document, event = {type: 'ready'};

		if (eventUtils.domLoaded) {
			callback(event);
			return;
		}

		// Gets called when the DOM is ready
		function readyHandler() {
			if (!eventUtils.domLoaded) {
				eventUtils.domLoaded = true;
				callback(event);
			}
		}

		function waitForDomLoaded() {
			if (doc.readyState === "complete") {
				removeEvent(doc, "readystatechange", waitForDomLoaded);
				readyHandler();
			}
		}

		function tryScroll() {
			try {
				// If IE is used, use the trick by Diego Perini licensed under MIT by request to the author.
				// http://javascript.nwbox.com/IEContentLoaded/
				doc.documentElement.doScroll("left");
			} catch (ex) {
				setTimeout(tryScroll, 0);
				return;
			}

			readyHandler();
		}

		// Use W3C method
		if (doc.addEventListener) {
			addEvent(win, 'DOMContentLoaded', readyHandler);
		} else {
			// Use IE method
			addEvent(doc, "readystatechange", waitForDomLoaded);

			// Wait until we can scroll, when we can the DOM is initialized
			if (doc.documentElement.doScroll && win === win.top) {
				tryScroll();
			}
		}

		// Fallback if any of the above methods should fail for some odd reason
		addEvent(win, 'load', readyHandler);
	}

	/**
	 * This class enables you to bind/unbind native events to elements and normalize it's behavior across browsers.
	 */
	function EventUtils() {
		var self = this, events = {}, count, expando, hasFocusIn, hasMouseEnterLeave, mouseEnterLeave;

		expando = eventExpandoPrefix + (+new Date()).toString(32);
		hasMouseEnterLeave = "onmouseenter" in document.documentElement;
		hasFocusIn = "onfocusin" in document.documentElement;
		mouseEnterLeave = {mouseenter: 'mouseover', mouseleave: 'mouseout'};
		count = 1;

		// State if the DOMContentLoaded was executed or not
		self.domLoaded = false;
		self.events = events;

		/**
		 * Executes all event handler callbacks for a specific event.
		 *
		 * @private
		 * @param {Event} evt Event object.
		 * @param {String} id Expando id value to look for.
		 */
		function executeHandlers(evt, id) {
			var callbackList, i, l, callback, container = events[id];

			callbackList = container && container[evt.type];
			if (callbackList) {
				for (i = 0, l = callbackList.length; i < l; i++) {
					callback = callbackList[i];

					// Check if callback exists might be removed if a unbind is called inside the callback
					if (callback && callback.func.call(callback.scope, evt) === false) {
						evt.preventDefault();
					}

					// Should we stop propagation to immediate listeners
					if (evt.isImmediatePropagationStopped()) {
						return;
					}
				}
			}
		}

		/**
		 * Binds a callback to an event on the specified target.
		 *
		 * @method bind
		 * @param {Object} target Target node/window or custom object.
		 * @param {String} names Name of the event to bind.
		 * @param {function} callback Callback function to execute when the event occurs.
		 * @param {Object} scope Scope to call the callback function on, defaults to target.
		 * @return {function} Callback function that got bound.
		 */
		self.bind = function(target, names, callback, scope) {
			var id, callbackList, i, name, fakeName, nativeHandler, capture, win = window;

			// Native event handler function patches the event and executes the callbacks for the expando
			function defaultNativeHandler(evt) {
				executeHandlers(fix(evt || win.event), id);
			}

			// Don't bind to text nodes or comments
			if (!target || target.nodeType === 3 || target.nodeType === 8) {
				return;
			}

			// Create or get events id for the target
			if (!target[expando]) {
				id = count++;
				target[expando] = id;
				events[id] = {};
			} else {
				id = target[expando];
			}

			// Setup the specified scope or use the target as a default
			scope = scope || target;

			// Split names and bind each event, enables you to bind multiple events with one call
			names = names.split(' ');
			i = names.length;
			while (i--) {
				name = names[i];
				nativeHandler = defaultNativeHandler;
				fakeName = capture = false;

				// Use ready instead of DOMContentLoaded
				if (name === "DOMContentLoaded") {
					name = "ready";
				}

				// DOM is already ready
				if (self.domLoaded && name === "ready" && target.readyState == 'complete') {
					callback.call(scope, fix({type: name}));
					continue;
				}

				// Handle mouseenter/mouseleaver
				if (!hasMouseEnterLeave) {
					fakeName = mouseEnterLeave[name];

					if (fakeName) {
						nativeHandler = function(evt) {
							var current, related;

							current = evt.currentTarget;
							related = evt.relatedTarget;

							// Check if related is inside the current target if it's not then the event should
							// be ignored since it's a mouseover/mouseout inside the element
							if (related && current.contains) {
								// Use contains for performance
								related = current.contains(related);
							} else {
								while (related && related !== current) {
									related = related.parentNode;
								}
							}

							// Fire fake event
							if (!related) {
								evt = fix(evt || win.event);
								evt.type = evt.type === 'mouseout' ? 'mouseleave' : 'mouseenter';
								evt.target = current;
								executeHandlers(evt, id);
							}
						};
					}
				}

				// Fake bubbeling of focusin/focusout
				if (!hasFocusIn && (name === "focusin" || name === "focusout")) {
					capture = true;
					fakeName = name === "focusin" ? "focus" : "blur";
					nativeHandler = function(evt) {
						evt = fix(evt || win.event);
						evt.type = evt.type === 'focus' ? 'focusin' : 'focusout';
						executeHandlers(evt, id);
					};
				}

				// Setup callback list and bind native event
				callbackList = events[id][name];
				if (!callbackList) {
					events[id][name] = callbackList = [{func: callback, scope: scope}];
					callbackList.fakeName = fakeName;
					callbackList.capture = capture;

					// Add the nativeHandler to the callback list so that we can later unbind it
					callbackList.nativeHandler = nativeHandler;

					// Check if the target has native events support

					if (name === "ready") {
						bindOnReady(target, nativeHandler, self);
					} else {
						addEvent(target, fakeName || name, nativeHandler, capture);
					}
				} else {
					if (name === "ready" && self.domLoaded) {
						callback({type: name});
					} else {
						// If it already has an native handler then just push the callback
						callbackList.push({func: callback, scope: scope});
					}
				}
			}

			target = callbackList = 0; // Clean memory for IE

			return callback;
		};

		/**
		 * Unbinds the specified event by name, name and callback or all events on the target.
		 *
		 * @method unbind
		 * @param {Object} target Target node/window or custom object.
		 * @param {String} names Optional event name to unbind.
		 * @param {function} callback Optional callback function to unbind.
		 * @return {EventUtils} Event utils instance.
		 */
		self.unbind = function(target, names, callback) {
			var id, callbackList, i, ci, name, eventMap;

			// Don't bind to text nodes or comments
			if (!target || target.nodeType === 3 || target.nodeType === 8) {
				return self;
			}

			// Unbind event or events if the target has the expando
			id = target[expando];
			if (id) {
				eventMap = events[id];

				// Specific callback
				if (names) {
					names = names.split(' ');
					i = names.length;
					while (i--) {
						name = names[i];
						callbackList = eventMap[name];

						// Unbind the event if it exists in the map
						if (callbackList) {
							// Remove specified callback
							if (callback) {
								ci = callbackList.length;
								while (ci--) {
									if (callbackList[ci].func === callback) {
										var nativeHandler = callbackList.nativeHandler;

										// Clone callbackList since unbind inside a callback would otherwise break the handlers loop
										callbackList = callbackList.slice(0, ci).concat(callbackList.slice(ci + 1));
										callbackList.nativeHandler = nativeHandler;

										eventMap[name] = callbackList;
									}
								}
							}

							// Remove all callbacks if there isn't a specified callback or there is no callbacks left
							if (!callback || callbackList.length === 0) {
								delete eventMap[name];
								removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
							}
						}
					}
				} else {
					// All events for a specific element
					for (name in eventMap) {
						callbackList = eventMap[name];
						removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
					}

					eventMap = {};
				}

				// Check if object is empty, if it isn't then we won't remove the expando map
				for (name in eventMap) {
					return self;
				}

				// Delete event object
				delete events[id];

				// Remove expando from target
				try {
					// IE will fail here since it can't delete properties from window
					delete target[expando];
				} catch (ex) {
					// IE will set it to null
					target[expando] = null;
				}
			}

			return self;
		};

		/**
		 * Fires the specified event on the specified target.
		 *
		 * @method fire
		 * @param {Object} target Target node/window or custom object.
		 * @param {String} name Event name to fire.
		 * @param {Object} args Optional arguments to send to the observers.
		 * @return {EventUtils} Event utils instance.
		 */
		self.fire = function(target, name, args) {
			var id;

			// Don't bind to text nodes or comments
			if (!target || target.nodeType === 3 || target.nodeType === 8) {
				return self;
			}

			// Build event object by patching the args
			args = fix(null, args);
			args.type = name;
			args.target = target;

			do {
				// Found an expando that means there is listeners to execute
				id = target[expando];
				if (id) {
					executeHandlers(args, id);
				}

				// Walk up the DOM
				target = target.parentNode || target.ownerDocument || target.defaultView || target.parentWindow;
			} while (target && !args.isPropagationStopped());

			return self;
		};

		/**
		 * Removes all bound event listeners for the specified target. This will also remove any bound
		 * listeners to child nodes within that target.
		 *
		 * @method clean
		 * @param {Object} target Target node/window object.
		 * @return {EventUtils} Event utils instance.
		 */
		self.clean = function(target) {
			var i, children, unbind = self.unbind;

			// Don't bind to text nodes or comments
			if (!target || target.nodeType === 3 || target.nodeType === 8) {
				return self;
			}

			// Unbind any element on the specificed target
			if (target[expando]) {
				unbind(target);
			}

			// Target doesn't have getElementsByTagName it's probably a window object then use it's document to find the children
			if (!target.getElementsByTagName) {
				target = target.document;
			}

			// Remove events from each child element
			if (target && target.getElementsByTagName) {
				unbind(target);

				children = target.getElementsByTagName('*');
				i = children.length;
				while (i--) {
					target = children[i];

					if (target[expando]) {
						unbind(target);
					}
				}
			}

			return self;
		};

		/**
		 * Destroys the event object. Call this on IE to remove memory leaks.
		 */
		self.destroy = function() {
			events = {};
		};

		// Legacy function for canceling events
		self.cancel = function(e) {
			if (e) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}

			return false;
		};
	}

	EventUtils.Event = new EventUtils();
	EventUtils.Event.bind(window, 'ready', function() {});

	return EventUtils;
});