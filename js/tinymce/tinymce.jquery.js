// 4.0.17 (2014-02-xx)

/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
	"use strict";

	var modules = {};

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function define(id, dependencies, definition) {
		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});
	}

	function defined(id) {
		return !!modules[id];
	}

	function resolve(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function expose(ids) {
		for (var i = 0; i < ids.length; i++) {
			var target = exports;
			var id = ids[i];
			var fragments = id.split(/[.\/]/);

			for (var fi = 0; fi < fragments.length - 1; ++fi) {
				if (target[fragments[fi]] === undefined) {
					target[fragments[fi]] = {};
				}

				target = target[fragments[fi]];
			}

			target[fragments[fragments.length - 1]] = modules[id];
		}
	}

// Included from: js/tinymce/classes/dom/Sizzle.jQuery.js

/**
 * Sizzle.jQuery.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global jQuery:true */

/*
 * Fake Sizzle using jQuery.
 */
define("tinymce/dom/Sizzle", [], function() {
	// Detect if jQuery is loaded
	if (!window.jQuery) {
		throw new Error("Load jQuery first");
	}

	return jQuery.find;
});

// Included from: js/tinymce/classes/html/Styles.js

/**
 * Styles.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to parse CSS styles it also compresses styles to reduce the output size.
 *
 * @example
 * var Styles = new tinymce.html.Styles({
 *    url_converter: function(url) {
 *       return url;
 *    }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(new tinymce.html.StyleSerializer().serialize(styles));
 *
 * @class tinymce.html.Styles
 * @version 3.4
 */
define("tinymce/html/Styles", [], function() {
	return function(settings, schema) {
		/*jshint maxlen:255 */
		var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,
			urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,
			styleRegExp = /\s*([^:]+):\s*([^;]+);?/g,
			trimRightRegExp = /\s+$/,
			undef, i, encodingLookup = {}, encodingItems, invisibleChar = '\uFEFF';

		settings = settings || {};

		encodingItems = ('\\" \\\' \\; \\: ; : ' + invisibleChar).split(' ');
		for (i = 0; i < encodingItems.length; i++) {
			encodingLookup[encodingItems[i]] = invisibleChar + i;
			encodingLookup[invisibleChar + i] = encodingItems[i];
		}

		function toHex(match, r, g, b) {
			function hex(val) {
				val = parseInt(val, 10).toString(16);

				return val.length > 1 ? val : '0' + val; // 0 -> 00
			}

			return '#' + hex(r) + hex(g) + hex(b);
		}

		return {
			/**
			 * Parses the specified RGB color value and returns a hex version of that color.
			 *
			 * @method toHex
			 * @param {String} color RGB string value like rgb(1,2,3)
			 * @return {String} Hex version of that RGB value like #FF00FF.
			 */
			toHex: function(color) {
				return color.replace(rgbRegExp, toHex);
			},

			/**
			 * Parses the specified style value into an object collection. This parser will also
			 * merge and remove any redundant items that browsers might have added. It will also convert non hex
			 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
			 *
			 * @method parse
			 * @param {String} css Style value to parse for example: border:1px solid red;.
			 * @return {Object} Object representation of that style like {border: '1px solid red'}
			 */
			parse: function(css) {
				var styles = {}, matches, name, value, isEncoded, urlConverter = settings.url_converter;
				var urlConverterScope = settings.url_converter_scope || this;

				function compress(prefix, suffix, noJoin) {
					var top, right, bottom, left;

					top = styles[prefix + '-top' + suffix];
					if (!top) {
						return;
					}

					right = styles[prefix + '-right' + suffix];
					if (!right) {
						return;
					}

					bottom = styles[prefix + '-bottom' + suffix];
					if (!bottom) {
						return;
					}

					left = styles[prefix + '-left' + suffix];
					if (!left) {
						return;
					}

					var box = [top, right, bottom, left];
					i = box.length - 1;
					while (i--) {
						if (box[i] !== box[i + 1]) {
							break;
						}
					}

					if (i > -1 && noJoin) {
						return;
					}

					styles[prefix + suffix] = i == -1 ? box[0] : box.join(' ');
					delete styles[prefix + '-top' + suffix];
					delete styles[prefix + '-right' + suffix];
					delete styles[prefix + '-bottom' + suffix];
					delete styles[prefix + '-left' + suffix];
				}

				/**
				 * Checks if the specific style can be compressed in other words if all border-width are equal.
				 */
				function canCompress(key) {
					var value = styles[key], i;

					if (!value) {
						return;
					}

					value = value.split(' ');
					i = value.length;
					while (i--) {
						if (value[i] !== value[0]) {
							return false;
						}
					}

					styles[key] = value[0];

					return true;
				}

				/**
				 * Compresses multiple styles into one style.
				 */
				function compress2(target, a, b, c) {
					if (!canCompress(a)) {
						return;
					}

					if (!canCompress(b)) {
						return;
					}

					if (!canCompress(c)) {
						return;
					}

					// Compress
					styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
					delete styles[a];
					delete styles[b];
					delete styles[c];
				}

				// Encodes the specified string by replacing all \" \' ; : with _<num>
				function encode(str) {
					isEncoded = true;

					return encodingLookup[str];
				}

				// Decodes the specified string by replacing all _<num> with it's original value \" \' etc
				// It will also decode the \" \' if keep_slashes is set to fale or omitted
				function decode(str, keep_slashes) {
					if (isEncoded) {
						str = str.replace(/\uFEFF[0-9]/g, function(str) {
							return encodingLookup[str];
						});
					}

					if (!keep_slashes) {
						str = str.replace(/\\([\'\";:])/g, "$1");
					}

					return str;
				}

				function processUrl(match, url, url2, url3, str, str2) {
					str = str || str2;

					if (str) {
						str = decode(str);

						// Force strings into single quote format
						return "'" + str.replace(/\'/g, "\\'") + "'";
					}

					url = decode(url || url2 || url3);

					if (!settings.allow_script_urls && /(java|vb)script:/i.test(url.replace(/[\s\r\n]+/, ''))) {
						return "";
					}

					// Convert the URL to relative/absolute depending on config
					if (urlConverter) {
						url = urlConverter.call(urlConverterScope, url, 'style');
					}

					// Output new URL format
					return "url('" + url.replace(/\'/g, "\\'") + "')";
				}

				if (css) {
					css = css.replace(/[\u0000-\u001F]/g, '');

					// Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
					css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function(str) {
						return str.replace(/[;:]/g, encode);
					});

					// Parse styles
					while ((matches = styleRegExp.exec(css))) {
						name = matches[1].replace(trimRightRegExp, '').toLowerCase();
						value = matches[2].replace(trimRightRegExp, '');

						if (name && value.length > 0) {
							if (!settings.allow_script_urls && (name == "behavior" || /expression\s*\(/.test(value))) {
								continue;
							}

							// Opera will produce 700 instead of bold in their style values
							if (name === 'font-weight' && value === '700') {
								value = 'bold';
							} else if (name === 'color' || name === 'background-color') { // Lowercase colors like RED
								value = value.toLowerCase();
							}

							// Convert RGB colors to HEX
							value = value.replace(rgbRegExp, toHex);

							// Convert URLs and force them into url('value') format
							value = value.replace(urlOrStrRegExp, processUrl);
							styles[name] = isEncoded ? decode(value, true) : value;
						}

						styleRegExp.lastIndex = matches.index + matches[0].length;
					}
					// Compress the styles to reduce it's size for example IE will expand styles
					compress("border", "", true);
					compress("border", "-width");
					compress("border", "-color");
					compress("border", "-style");
					compress("padding", "");
					compress("margin", "");
					compress2('border', 'border-width', 'border-style', 'border-color');

					// Remove pointless border, IE produces these
					if (styles.border === 'medium none') {
						delete styles.border;
					}

					// IE 11 will produce a border-image: none when getting the style attribute from <p style="border: 1px solid red"></p>
					// So lets asume it shouldn't be there
					if (styles['border-image'] === 'none') {
						delete styles['border-image'];
					}
				}

				return styles;
			},

			/**
			 * Serializes the specified style object into a string.
			 *
			 * @method serialize
			 * @param {Object} styles Object to serialize as string for example: {border: '1px solid red'}
			 * @param {String} element_name Optional element name, if specified only the styles that matches the schema will be serialized.
			 * @return {String} String representation of the style object for example: border: 1px solid red.
			 */
			serialize: function(styles, element_name) {
				var css = '', name, value;

				function serializeStyles(name) {
					var styleList, i, l, value;

					styleList = schema.styles[name];
					if (styleList) {
						for (i = 0, l = styleList.length; i < l; i++) {
							name = styleList[i];
							value = styles[name];

							if (value !== undef && value.length > 0) {
								css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
							}
						}
					}
				}

				// Serialize styles according to schema
				if (element_name && schema && schema.styles) {
					// Serialize global styles and element specific styles
					serializeStyles('*');
					serializeStyles(element_name);
				} else {
					// Output the styles in the order they are inside the object
					for (name in styles) {
						value = styles[name];

						if (value !== undef && value.length > 0) {
							css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
						}
					}
				}

				return css;
			}
		};
	};
});

// Included from: js/tinymce/classes/dom/EventUtils.js

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
			if (doc.readyState === "complete" || doc.readyState === "interactive") {
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
			if (doc.readyState === "complete") {
				readyHandler();
			} else {
				addEvent(win, 'DOMContentLoaded', readyHandler);
			}
		} else {
			// Use IE method
			addEvent(doc, "readystatechange", waitForDomLoaded);

			// Wait until we can scroll, when we can the DOM is initialized
			if (doc.documentElement.doScroll && win.self === win.top) {
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

// Included from: js/tinymce/classes/dom/TreeWalker.js

/**
 * TreeWalker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TreeWalker class enables you to walk the DOM in a linear manner.
 *
 * @class tinymce.dom.TreeWalker
 */
define("tinymce/dom/TreeWalker", [], function() {
	return function(start_node, root_node) {
		var node = start_node;

		function findSibling(node, start_name, sibling_name, shallow) {
			var sibling, parent;

			if (node) {
				// Walk into nodes if it has a start
				if (!shallow && node[start_name]) {
					return node[start_name];
				}

				// Return the sibling if it has one
				if (node != root_node) {
					sibling = node[sibling_name];
					if (sibling) {
						return sibling;
					}

					// Walk up the parents to look for siblings
					for (parent = node.parentNode; parent && parent != root_node; parent = parent.parentNode) {
						sibling = parent[sibling_name];
						if (sibling) {
							return sibling;
						}
					}
				}
			}
		}

		/**
		 * Returns the current node.
		 *
		 * @method current
		 * @return {Node} Current node where the walker is.
		 */
		this.current = function() {
			return node;
		};

		/**
		 * Walks to the next node in tree.
		 *
		 * @method next
		 * @return {Node} Current node where the walker is after moving to the next node.
		 */
		this.next = function(shallow) {
			node = findSibling(node, 'firstChild', 'nextSibling', shallow);
			return node;
		};

		/**
		 * Walks to the previous node in tree.
		 *
		 * @method prev
		 * @return {Node} Current node where the walker is after moving to the previous node.
		 */
		this.prev = function(shallow) {
			node = findSibling(node, 'lastChild', 'previousSibling', shallow);
			return node;
		};
	};
});

// Included from: js/tinymce/classes/util/Tools.js

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

// Included from: js/tinymce/classes/dom/Range.js

/**
 * Range.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/dom/Range", [
	"tinymce/util/Tools"
], function(Tools) {
	// Range constructor
	function Range(dom) {
		var t = this,
			doc = dom.doc,
			EXTRACT = 0,
			CLONE = 1,
			DELETE = 2,
			TRUE = true,
			FALSE = false,
			START_OFFSET = 'startOffset',
			START_CONTAINER = 'startContainer',
			END_CONTAINER = 'endContainer',
			END_OFFSET = 'endOffset',
			extend = Tools.extend,
			nodeIndex = dom.nodeIndex;

		function createDocumentFragment() {
			return doc.createDocumentFragment();
		}

		function setStart(n, o) {
			_setEndPoint(TRUE, n, o);
		}

		function setEnd(n, o) {
			_setEndPoint(FALSE, n, o);
		}

		function setStartBefore(n) {
			setStart(n.parentNode, nodeIndex(n));
		}

		function setStartAfter(n) {
			setStart(n.parentNode, nodeIndex(n) + 1);
		}

		function setEndBefore(n) {
			setEnd(n.parentNode, nodeIndex(n));
		}

		function setEndAfter(n) {
			setEnd(n.parentNode, nodeIndex(n) + 1);
		}

		function collapse(ts) {
			if (ts) {
				t[END_CONTAINER] = t[START_CONTAINER];
				t[END_OFFSET] = t[START_OFFSET];
			} else {
				t[START_CONTAINER] = t[END_CONTAINER];
				t[START_OFFSET] = t[END_OFFSET];
			}

			t.collapsed = TRUE;
		}

		function selectNode(n) {
			setStartBefore(n);
			setEndAfter(n);
		}

		function selectNodeContents(n) {
			setStart(n, 0);
			setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		}

		function compareBoundaryPoints(h, r) {
			var sc = t[START_CONTAINER], so = t[START_OFFSET], ec = t[END_CONTAINER], eo = t[END_OFFSET],
			rsc = r.startContainer, rso = r.startOffset, rec = r.endContainer, reo = r.endOffset;

			// Check START_TO_START
			if (h === 0) {
				return _compareBoundaryPoints(sc, so, rsc, rso);
			}

			// Check START_TO_END
			if (h === 1) {
				return _compareBoundaryPoints(ec, eo, rsc, rso);
			}

			// Check END_TO_END
			if (h === 2) {
				return _compareBoundaryPoints(ec, eo, rec, reo);
			}

			// Check END_TO_START
			if (h === 3) {
				return _compareBoundaryPoints(sc, so, rec, reo);
			}
		}

		function deleteContents() {
			_traverse(DELETE);
		}

		function extractContents() {
			return _traverse(EXTRACT);
		}

		function cloneContents() {
			return _traverse(CLONE);
		}

		function insertNode(n) {
			var startContainer = this[START_CONTAINER],
				startOffset = this[START_OFFSET], nn, o;

			// Node is TEXT_NODE or CDATA
			if ((startContainer.nodeType === 3 || startContainer.nodeType === 4) && startContainer.nodeValue) {
				if (!startOffset) {
					// At the start of text
					startContainer.parentNode.insertBefore(n, startContainer);
				} else if (startOffset >= startContainer.nodeValue.length) {
					// At the end of text
					dom.insertAfter(n, startContainer);
				} else {
					// Middle, need to split
					nn = startContainer.splitText(startOffset);
					startContainer.parentNode.insertBefore(n, nn);
				}
			} else {
				// Insert element node
				if (startContainer.childNodes.length > 0) {
					o = startContainer.childNodes[startOffset];
				}

				if (o) {
					startContainer.insertBefore(n, o);
				} else {
					if (startContainer.nodeType == 3) {
						dom.insertAfter(n, startContainer);
					} else {
						startContainer.appendChild(n);
					}
				}
			}
		}

		function surroundContents(n) {
			var f = t.extractContents();

			t.insertNode(n);
			n.appendChild(f);
			t.selectNode(n);
		}

		function cloneRange() {
			return extend(new Range(dom), {
				startContainer: t[START_CONTAINER],
				startOffset: t[START_OFFSET],
				endContainer: t[END_CONTAINER],
				endOffset: t[END_OFFSET],
				collapsed: t.collapsed,
				commonAncestorContainer: t.commonAncestorContainer
			});
		}

		// Private methods

		function _getSelectedNode(container, offset) {
			var child;

			if (container.nodeType == 3 /* TEXT_NODE */) {
				return container;
			}

			if (offset < 0) {
				return container;
			}

			child = container.firstChild;
			while (child && offset > 0) {
				--offset;
				child = child.nextSibling;
			}

			if (child) {
				return child;
			}

			return container;
		}

		function _isCollapsed() {
			return (t[START_CONTAINER] == t[END_CONTAINER] && t[START_OFFSET] == t[END_OFFSET]);
		}

		function _compareBoundaryPoints(containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;

			// In the first case the boundary-points have the same container. A is before B
			// if its offset is less than the offset of B, A is equal to B if its offset is
			// equal to the offset of B, and A is after B if its offset is greater than the
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB) {
					return 0; // equal
				}

				if (offsetA < offsetB) {
					return -1; // before
				}

				return 1; // after
			}

			// In the second case a child node C of the container of A is an ancestor
			// container of B. In this case, A is before B if the offset of A is less than or
			// equal to the index of the child node C and A is after B otherwise.
			c = containerB;
			while (c && c.parentNode != containerA) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerA.firstChild;

				while (n != c && offsetC < offsetA) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetA <= offsetC) {
					return -1; // before
				}

				return 1; // after
			}

			// In the third case a child node C of the container of B is an ancestor container
			// of A. In this case, A is before B if the index of the child node C is less than
			// the offset of B and A is after B otherwise.
			c = containerA;
			while (c && c.parentNode != containerB) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerB.firstChild;

				while (n != c && offsetC < offsetB) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetC < offsetB) {
					return -1; // before
				}

				return 1; // after
			}

			// In the fourth case, none of three other cases hold: the containers of A and B
			// are siblings or descendants of sibling nodes. In this case, A is before B if
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = dom.findCommonAncestor(containerA, containerB);
			childA = containerA;

			while (childA && childA.parentNode != cmnRoot) {
				childA = childA.parentNode;
			}

			if (!childA) {
				childA = cmnRoot;
			}

			childB = containerB;
			while (childB && childB.parentNode != cmnRoot) {
				childB = childB.parentNode;
			}

			if (!childB) {
				childB = cmnRoot;
			}

			if (childA == childB) {
				return 0; // equal
			}

			n = cmnRoot.firstChild;
			while (n) {
				if (n == childA) {
					return -1; // before
				}

				if (n == childB) {
					return 1; // after
				}

				n = n.nextSibling;
			}
		}

		function _setEndPoint(st, n, o) {
			var ec, sc;

			if (st) {
				t[START_CONTAINER] = n;
				t[START_OFFSET] = o;
			} else {
				t[END_CONTAINER] = n;
				t[END_OFFSET] = o;
			}

			// If one boundary-point of a Range is set to have a root container
			// other than the current one for the Range, the Range is collapsed to
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = t[END_CONTAINER];
			while (ec.parentNode) {
				ec = ec.parentNode;
			}

			sc = t[START_CONTAINER];
			while (sc.parentNode) {
				sc = sc.parentNode;
			}

			if (sc == ec) {
				// The start position of a Range is guaranteed to never be after the
				// end position. To enforce this restriction, if the start is set to
				// be at a position after the end, the Range is collapsed to that
				// position.
				if (_compareBoundaryPoints(t[START_CONTAINER], t[START_OFFSET], t[END_CONTAINER], t[END_OFFSET]) > 0) {
					t.collapse(st);
				}
			} else {
				t.collapse(st);
			}

			t.collapsed = _isCollapsed();
			t.commonAncestorContainer = dom.findCommonAncestor(t[START_CONTAINER], t[END_CONTAINER]);
		}

		function _traverse(how) {
			var c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (t[START_CONTAINER] == t[END_CONTAINER]) {
				return _traverseSameContainer(how);
			}

			for (c = t[END_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[START_CONTAINER]) {
					return _traverseCommonStartContainer(c, how);
				}

				++endContainerDepth;
			}

			for (c = t[START_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[END_CONTAINER]) {
					return _traverseCommonEndContainer(c, how);
				}

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = t[START_CONTAINER];
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = t[END_CONTAINER];
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return _traverseCommonAncestors(startNode, endNode, how);
		}

		function _traverseSameContainer(how) {
			var frag, s, sub, n, cnt, sibling, xferNode, start, len;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			// If selection is empty, just return the fragment
			if (t[START_OFFSET] == t[END_OFFSET]) {
				return frag;
			}

			// Text node needs special case handling
			if (t[START_CONTAINER].nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = t[START_CONTAINER].nodeValue;
				sub = s.substring(t[START_OFFSET], t[END_OFFSET]);

				// set the original text node to its new value
				if (how != CLONE) {
					n = t[START_CONTAINER];
					start = t[START_OFFSET];
					len = t[END_OFFSET] - t[START_OFFSET];

					if (start === 0 && len >= n.nodeValue.length - 1) {
						n.parentNode.removeChild(n);
					} else {
						n.deleteData(start, len);
					}

					// Nothing is partially selected, so collapse to start point
					t.collapse(TRUE);
				}

				if (how == DELETE) {
					return;
				}

				if (sub.length > 0) {
					frag.appendChild(doc.createTextNode(sub));
				}

				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]);
			cnt = t[END_OFFSET] - t[START_OFFSET];

			while (n && cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.appendChild(xferNode);
				}

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE) {
				t.collapse(TRUE);
			}

			return frag;
		}

		function _traverseCommonStartContainer(endAncestor, how) {
			var frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag) {
				frag.appendChild(n);
			}

			endIdx = nodeIndex(endAncestor);
			cnt = endIdx - t[START_OFFSET];

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which
				// is partially selected.
				if (how != CLONE) {
					t.setEndBefore(endAncestor);
					t.collapse(FALSE);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.insertBefore(xferNode, frag.firstChild);
				}

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which
			// is partially selected.
			if (how != CLONE) {
				t.setEndBefore(endAncestor);
				t.collapse(FALSE);
			}

			return frag;
		}

		function _traverseCommonEndContainer(startAncestor, how) {
			var frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag) {
				frag.appendChild(n);
			}

			startIdx = nodeIndex(startAncestor);
			++startIdx; // Because we already traversed it

			cnt = t[END_OFFSET] - startIdx;
			n = startAncestor.nextSibling;
			while (n && cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.appendChild(xferNode);
				}

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		}

		function _traverseCommonAncestors(startAncestor, endAncestor, how) {
			var n, frag, commonParent, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag) {
				frag.appendChild(n);
			}

			commonParent = startAncestor.parentNode;
			startOffset = nodeIndex(startAncestor);
			endOffset = nodeIndex(endAncestor);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = _traverseFullySelected(sibling, how);

				if (frag) {
					frag.appendChild(n);
				}

				sibling = nextSibling;
				--cnt;
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag) {
				frag.appendChild(n);
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		}

		function _traverseRightBoundary(root, how) {
			var next = _getSelectedNode(t[END_CONTAINER], t[END_OFFSET] - 1), parent, clonedParent;
			var prevSibling, clonedChild, clonedGrandParent, isFullySelected = next != t[END_CONTAINER];

			if (next == root) {
				return _traverseNode(next, isFullySelected, FALSE, how);
			}

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, FALSE, how);

			while (parent) {
				while (next) {
					prevSibling = next.previousSibling;
					clonedChild = _traverseNode(next, isFullySelected, FALSE, how);

					if (how != DELETE) {
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);
					}

					isFullySelected = TRUE;
					next = prevSibling;
				}

				if (parent == root) {
					return clonedParent;
				}

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, FALSE, how);

				if (how != DELETE) {
					clonedGrandParent.appendChild(clonedParent);
				}

				clonedParent = clonedGrandParent;
			}
		}

		function _traverseLeftBoundary(root, how) {
			var next = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]), isFullySelected = next != t[START_CONTAINER];
			var parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root) {
				return _traverseNode(next, isFullySelected, TRUE, how);
			}

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, TRUE, how);

			while (parent) {
				while (next) {
					nextSibling = next.nextSibling;
					clonedChild = _traverseNode(next, isFullySelected, TRUE, how);

					if (how != DELETE) {
						clonedParent.appendChild(clonedChild);
					}

					isFullySelected = TRUE;
					next = nextSibling;
				}

				if (parent == root) {
					return clonedParent;
				}

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, TRUE, how);

				if (how != DELETE) {
					clonedGrandParent.appendChild(clonedParent);
				}

				clonedParent = clonedGrandParent;
			}
		}

		function _traverseNode(n, isFullySelected, isLeft, how) {
			var txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected) {
				return _traverseFullySelected(n, how);
			}

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = t[START_OFFSET];
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = t[END_OFFSET];
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE) {
					n.nodeValue = oldNodeValue;
				}

				if (how == DELETE) {
					return;
				}

				newNode = dom.clone(n, FALSE);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE) {
				return;
			}

			return dom.clone(n, FALSE);
		}

		function _traverseFullySelected(n, how) {
			if (how != DELETE) {
				return how == CLONE ? dom.clone(n, TRUE) : n;
			}

			n.parentNode.removeChild(n);
		}

		function toStringIE() {
			return dom.create('body', null, cloneContents()).outerText;
		}

		extend(t, {
			// Inital states
			startContainer: doc,
			startOffset: 0,
			endContainer: doc,
			endOffset: 0,
			collapsed: TRUE,
			commonAncestorContainer: doc,

			// Range constants
			START_TO_START: 0,
			START_TO_END: 1,
			END_TO_END: 2,
			END_TO_START: 3,

			// Public methods
			setStart: setStart,
			setEnd: setEnd,
			setStartBefore: setStartBefore,
			setStartAfter: setStartAfter,
			setEndBefore: setEndBefore,
			setEndAfter: setEndAfter,
			collapse: collapse,
			selectNode: selectNode,
			selectNodeContents: selectNodeContents,
			compareBoundaryPoints: compareBoundaryPoints,
			deleteContents: deleteContents,
			extractContents: extractContents,
			cloneContents: cloneContents,
			insertNode: insertNode,
			surroundContents: surroundContents,
			cloneRange: cloneRange,
			toStringIE: toStringIE
		});

		return t;
	}

	// Older IE versions doesn't let you override toString by it's constructor so we have to stick it in the prototype
	Range.prototype.toString = function() {
		return this.toStringIE();
	};

	return Range;
});

// Included from: js/tinymce/classes/html/Entities.js

/**
 * Entities.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint bitwise:false */

/**
 * Entity encoder class.
 *
 * @class tinymce.html.Entities
 * @static
 * @version 3.4
 */
define("tinymce/html/Entities", [
	"tinymce/util/Tools"
], function(Tools) {
	var makeMap = Tools.makeMap;

	var namedEntities, baseEntities, reverseEntities,
		attrsCharsRegExp = /[&<>\"\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		rawCharsRegExp = /[<>&\"\']/g,
		entityRegExp = /&(#x|#)?([\w]+);/g,
		asciiMap = {
			128: "\u20AC", 130: "\u201A", 131: "\u0192", 132: "\u201E", 133: "\u2026", 134: "\u2020",
			135: "\u2021", 136: "\u02C6", 137: "\u2030", 138: "\u0160", 139: "\u2039", 140: "\u0152",
			142: "\u017D", 145: "\u2018", 146: "\u2019", 147: "\u201C", 148: "\u201D", 149: "\u2022",
			150: "\u2013", 151: "\u2014", 152: "\u02DC", 153: "\u2122", 154: "\u0161", 155: "\u203A",
			156: "\u0153", 158: "\u017E", 159: "\u0178"
		};

	// Raw entities
	baseEntities = {
		'\"': '&quot;', // Needs to be escaped since the YUI compressor would otherwise break the code
		"'": '&#39;',
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;'
	};

	// Reverse lookup table for raw entities
	reverseEntities = {
		'&lt;': '<',
		'&gt;': '>',
		'&amp;': '&',
		'&quot;': '"',
		'&apos;': "'"
	};

	// Decodes text by using the browser
	function nativeDecode(text) {
		var elm;

		elm = document.createElement("div");
		elm.innerHTML = text;

		return elm.textContent || elm.innerText || text;
	}

	// Build a two way lookup table for the entities
	function buildEntitiesLookup(items, radix) {
		var i, chr, entity, lookup = {};

		if (items) {
			items = items.split(',');
			radix = radix || 10;

			// Build entities lookup table
			for (i = 0; i < items.length; i += 2) {
				chr = String.fromCharCode(parseInt(items[i], radix));

				// Only add non base entities
				if (!baseEntities[chr]) {
					entity = '&' + items[i + 1] + ';';
					lookup[chr] = entity;
					lookup[entity] = chr;
				}
			}

			return lookup;
		}
	}

	// Unpack entities lookup where the numbers are in radix 32 to reduce the size
	namedEntities = buildEntitiesLookup(
		'50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
		'5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
		'5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
		'5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
		'68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
		'6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
		'6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
		'75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
		'7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
		'7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
		'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
		'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
		't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
		'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
		'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
		'81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
		'8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
		'8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
		'8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
		'8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
		'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
		'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
		'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
		'80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
		'811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);

	var Entities = {
		/**
		 * Encodes the specified string using raw entities. This means only the required XML base entities will be endoded.
		 *
		 * @method encodeRaw
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeRaw: function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encoded the specified text with both the attributes and text entities. This function will produce larger text contents
		 * since it doesn't know if the context is within a attribute or text node. This was added for compatibility
		 * and is exposed as the DOMUtils.encode function.
		 *
		 * @method encodeAllRaw
		 * @param {String} text Text to encode.
		 * @return {String} Entity encoded text.
		 */
		encodeAllRaw: function(text) {
			return ('' + text).replace(rawCharsRegExp, function(chr) {
				return baseEntities[chr] || chr;
			});
		},

		/**
		 * Encodes the specified string using numeric entities. The core entities will be
		 * encoded as named ones but all non lower ascii characters will be encoded into numeric entities.
		 *
		 * @method encodeNumeric
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @return {String} Entity encoded text.
		 */
		encodeNumeric: function(text, attr) {
			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				// Multi byte sequence convert it to a single entity
				if (chr.length > 1) {
					return '&#' + (((chr.charCodeAt(0) - 0xD800) * 0x400) + (chr.charCodeAt(1) - 0xDC00) + 0x10000) + ';';
				}

				return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
			});
		},

		/**
		 * Encodes the specified string using named entities. The core entities will be encoded
		 * as named ones but all non lower ascii characters will be encoded into named entities.
		 *
		 * @method encodeNamed
		 * @param {String} text Text to encode.
		 * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
		 * @param {Object} entities Optional parameter with entities to use.
		 * @return {String} Entity encoded text.
		 */
		encodeNamed: function(text, attr, entities) {
			entities = entities || namedEntities;

			return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
				return baseEntities[chr] || entities[chr] || chr;
			});
		},

		/**
		 * Returns an encode function based on the name(s) and it's optional entities.
		 *
		 * @method getEncodeFunc
		 * @param {String} name Comma separated list of encoders for example named,numeric.
		 * @param {String} entities Optional parameter with entities to use instead of the built in set.
		 * @return {function} Encode function to be used.
		 */
		getEncodeFunc: function(name, entities) {
			entities = buildEntitiesLookup(entities) || namedEntities;

			function encodeNamedAndNumeric(text, attr) {
				return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function(chr) {
					return baseEntities[chr] || entities[chr] || '&#' + chr.charCodeAt(0) + ';' || chr;
				});
			}

			function encodeCustomNamed(text, attr) {
				return Entities.encodeNamed(text, attr, entities);
			}

			// Replace + with , to be compatible with previous TinyMCE versions
			name = makeMap(name.replace(/\+/g, ','));

			// Named and numeric encoder
			if (name.named && name.numeric) {
				return encodeNamedAndNumeric;
			}

			// Named encoder
			if (name.named) {
				// Custom names
				if (entities) {
					return encodeCustomNamed;
				}

				return Entities.encodeNamed;
			}

			// Numeric
			if (name.numeric) {
				return Entities.encodeNumeric;
			}

			// Raw encoder
			return Entities.encodeRaw;
		},

		/**
		 * Decodes the specified string, this will replace entities with raw UTF characters.
		 *
		 * @method decode
		 * @param {String} text Text to entity decode.
		 * @return {String} Entity decoded string.
		 */
		decode: function(text) {
			return text.replace(entityRegExp, function(all, numeric, value) {
				if (numeric) {
					value = parseInt(value, numeric.length === 2 ? 16 : 10);

					// Support upper UTF
					if (value > 0xFFFF) {
						value -= 0x10000;

						return String.fromCharCode(0xD800 + (value >> 10), 0xDC00 + (value & 0x3FF));
					} else {
						return asciiMap[value] || String.fromCharCode(value);
					}
				}

				return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
			});
		}
	};

	return Entities;
});

// Included from: js/tinymce/classes/Env.js

/**
 * Env.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */
define("tinymce/Env", [], function() {
	var nav = navigator, userAgent = nav.userAgent;
	var opera, webkit, ie, ie11, gecko, mac, iDevice;

	opera = window.opera && window.opera.buildNumber;
	webkit = /WebKit/.test(userAgent);
	ie = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
	ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
	ie11 = userAgent.indexOf('Trident/') != -1 && (userAgent.indexOf('rv:') != -1 || nav.appName.indexOf('Netscape') != -1) ? 11 : false;
	ie = ie || ie11;
	gecko = !webkit && !ie11 && /Gecko/.test(userAgent);
	mac = userAgent.indexOf('Mac') != -1;
	iDevice = /(iPad|iPhone)/.test(userAgent);

	// Is a iPad/iPhone and not on iOS5 sniff the WebKit version since older iOS WebKit versions
	// says it has contentEditable support but there is no visible caret.
	var contentEditable = !iDevice || userAgent.match(/AppleWebKit\/(\d*)/)[1] >= 534;

	return {
		/**
		 * Constant that is true if the browser is Opera.
		 *
		 * @property opera
		 * @type Boolean
		 * @final
		 */
		opera: opera,

		/**
		 * Constant that is true if the browser is WebKit (Safari/Chrome).
		 *
		 * @property webKit
		 * @type Boolean
		 * @final
		 */
		webkit: webkit,

		/**
		 * Constant that is more than zero if the browser is IE.
		 *
		 * @property ie
		 * @type Boolean
		 * @final
		 */
		ie: ie,

		/**
		 * Constant that is true if the browser is Gecko.
		 *
		 * @property gecko
		 * @type Boolean
		 * @final
		 */
		gecko: gecko,

		/**
		 * Constant that is true if the os is Mac OS.
		 *
		 * @property mac
		 * @type Boolean
		 * @final
		 */
		mac: mac,

		/**
		 * Constant that is true if the os is iOS.
		 *
		 * @property iOS
		 * @type Boolean
		 * @final
		 */
		iOS: iDevice,

		/**
		 * Constant that is true if the browser supports editing.
		 *
		 * @property contentEditable
		 * @type Boolean
		 * @final
		 */
		contentEditable: contentEditable,

		/**
		 * Transparent image data url.
		 *
		 * @property transparentSrc
		 * @type Boolean
		 * @final
		 */
		transparentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",

		/**
		 * Returns true/false if the browser can or can't place the caret after a inline block like an image.
		 *
		 * @property noCaretAfter
		 * @type Boolean
		 * @final
		 */
		caretAfter: ie != 8,

		/**
		 * Constant that is true if the browser supports native DOM Ranges. IE 9+.
		 *
		 * @property range
		 * @type Boolean
		 */
		range: window.getSelection && "Range" in window,

		/**
		 * Returns the IE document mode for non IE browsers this will fake IE 10.
		 *
		 * @property documentMode
		 * @type Number
		 */
		documentMode: ie ? (document.documentMode || 7) : 10
	};
});

// Included from: js/tinymce/classes/dom/StyleSheetLoader.js

/**
 * StyleSheetLoader.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */
define("tinymce/dom/StyleSheetLoader", [], function() {
	"use strict";

	return function(document, settings) {
		var idCount = 0, loadedStates = {}, maxLoadTime;

		settings = settings || {};
		maxLoadTime = settings.maxLoadTime || 5000;

		function appendToHead(node) {
			document.getElementsByTagName('head')[0].appendChild(node);
		}

		/**
		 * Loads the specified css style sheet file and call the loadedCallback once it's finished loading.
		 *
		 * @method load
		 * @param {String} url Url to be loaded.
		 * @param {Function} loadedCallback Callback to be executed when loaded.
		 * @param {Function} errorCallback Callback to be executed when failed loading.
		 */
		function load(url, loadedCallback, errorCallback) {
			var link, style, startTime, state;

			function passed() {
				var callbacks = state.passed, i = callbacks.length;

				while (i--) {
					callbacks[i]();
				}

				state.status = 2;
				state.passed = [];
				state.failed = [];
			}

			function failed() {
				var callbacks = state.failed, i = callbacks.length;

				while (i--) {
					callbacks[i]();
				}

				state.status = 3;
				state.passed = [];
				state.failed = [];
			}

			// Sniffs for older WebKit versions that have the link.onload but a broken one
			function isOldWebKit() {
				var webKitChunks = navigator.userAgent.match(/WebKit\/(\d*)/);
				return !!(webKitChunks && webKitChunks[1] < 536);
			}

			// Calls the waitCallback until the test returns true or the timeout occurs
			function wait(testCallback, waitCallback) {
				if (!testCallback()) {
					// Wait for timeout
					if ((new Date().getTime()) - startTime < maxLoadTime) {
						window.setTimeout(waitCallback, 0);
					} else {
						failed();
					}
				}
			}

			// Workaround for WebKit that doesn't properly support the onload event for link elements
			// Or WebKit that fires the onload event before the StyleSheet is added to the document
			function waitForWebKitLinkLoaded() {
				wait(function() {
					var styleSheets = document.styleSheets, styleSheet, i = styleSheets.length, owner;

					while (i--) {
						styleSheet = styleSheets[i];
						owner = styleSheet.ownerNode ? styleSheet.ownerNode : styleSheet.owningElement;
						if (owner && owner.id === link.id) {
							passed();
							return true;
						}
					}
				}, waitForWebKitLinkLoaded);
			}

			// Workaround for older Geckos that doesn't have any onload event for StyleSheets
			function waitForGeckoLinkLoaded() {
				wait(function() {
					try {
						// Accessing the cssRules will throw an exception until the CSS file is loaded
						var cssRules = style.sheet.cssRules;
						passed();
						return !!cssRules;
					} catch (ex) {
						// Ignore
					}
				}, waitForGeckoLinkLoaded);
			}

			if (!loadedStates[url]) {
				state = {
					passed: [],
					failed: []
				};

				loadedStates[url] = state;
			} else {
				state = loadedStates[url];
			}

			if (loadedCallback) {
				state.passed.push(loadedCallback);
			}

			if (errorCallback) {
				state.failed.push(errorCallback);
			}

			// Is loading wait for it to pass
			if (state.status == 1) {
				return;
			}

			// Has finished loading and was success
			if (state.status == 2) {
				passed();
				return;
			}

			// Has finished loading and was a failure
			if (state.status == 3) {
				failed();
				return;
			}

			// Start loading
			state.status = 1;
			link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.id = 'u' + (idCount++);
			link.async = false;
			link.defer = false;
			startTime = new Date().getTime();

			// Feature detect onload on link element and sniff older webkits since it has an broken onload event
			if ("onload" in link && !isOldWebKit()) {
				link.onload = waitForWebKitLinkLoaded;
				link.onerror = failed;
			} else {
				// Sniff for old Firefox that doesn't support the onload event on link elements
				// TODO: Remove this in the future when everyone uses modern browsers
				if (navigator.userAgent.indexOf("Firefox") > 0) {
					style = document.createElement('style');
					style.textContent = '@import "' + url + '"';
					waitForGeckoLinkLoaded();
					appendToHead(style);
					return;
				} else {
					// Use the id owner on older webkits
					waitForWebKitLinkLoaded();
				}
			}

			appendToHead(link);
			link.href = url;
		}

		this.load = load;
	};
});

// Included from: js/tinymce/classes/dom/DOMUtils.js

/**
 * DOMUtils.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for various DOM manipulation and retrieval functions.
 *
 * @class tinymce.dom.DOMUtils
 * @example
 * // Add a class to an element by id in the page
 * tinymce.DOM.addClass('someid', 'someclass');
 *
 * // Add a class to an element by id inside the editor
 * tinymce.activeEditor.dom.addClass('someid', 'someclass');
 */
define("tinymce/dom/DOMUtils", [
	"tinymce/dom/Sizzle",
	"tinymce/html/Styles",
	"tinymce/dom/EventUtils",
	"tinymce/dom/TreeWalker",
	"tinymce/dom/Range",
	"tinymce/html/Entities",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/dom/StyleSheetLoader"
], function(Sizzle, Styles, EventUtils, TreeWalker, Range, Entities, Env, Tools, StyleSheetLoader) {
	// Shorten names
	var each = Tools.each, is = Tools.is, grep = Tools.grep, trim = Tools.trim, extend = Tools.extend;
	var isWebKit = Env.webkit, isIE = Env.ie;
	var simpleSelectorRe = /^([a-z0-9],?)+$/i;
	var whiteSpaceRegExp = /^[ \t\r\n]*$/;
	var numericCssMap = Tools.makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', ' ');

	/**
	 * Constructs a new DOMUtils instance. Consult the Wiki for more details on settings etc for this class.
	 *
	 * @constructor
	 * @method DOMUtils
	 * @param {Document} d Document reference to bind the utility class to.
	 * @param {settings} s Optional settings collection.
	 */
	function DOMUtils(doc, settings) {
		var self = this, blockElementsMap;

		self.doc = doc;
		self.win = window;
		self.files = {};
		self.counter = 0;
		self.stdMode = !isIE || doc.documentMode >= 8;
		self.boxModel = !isIE || doc.compatMode == "CSS1Compat" || self.stdMode;
		self.hasOuterHTML = "outerHTML" in doc.createElement("a");
		self.styleSheetLoader = new StyleSheetLoader(doc);
		this.boundEvents = [];

		self.settings = settings = extend({
			keep_values: false,
			hex_colors: 1
		}, settings);

		self.schema = settings.schema;
		self.styles = new Styles({
			url_converter: settings.url_converter,
			url_converter_scope: settings.url_converter_scope
		}, settings.schema);

		self.fixDoc(doc);
		self.events = settings.ownEvents ? new EventUtils(settings.proxy) : EventUtils.Event;
		blockElementsMap = settings.schema ? settings.schema.getBlockElements() : {};

		/**
		 * Returns true/false if the specified element is a block element or not.
		 *
		 * @method isBlock
		 * @param {Node/String} node Element/Node to check.
		 * @return {Boolean} True/False state if the node is a block element or not.
		 */
		self.isBlock = function(node) {
			// Fix for #5446
			if (!node) {
				return false;
			}

			// This function is called in module pattern style since it might be executed with the wrong this scope
			var type = node.nodeType;

			// If it's a node then check the type and use the nodeName
			if (type) {
				return !!(type === 1 && blockElementsMap[node.nodeName]);
			}

			return !!blockElementsMap[node];
		};
	}

	DOMUtils.prototype = {
		root: null,
		props: {
			"for": "htmlFor",
			"class": "className",
			className: "className",
			checked: "checked",
			disabled: "disabled",
			maxlength: "maxLength",
			readonly: "readOnly",
			selected: "selected",
			value: "value",
			id: "id",
			name: "name",
			type: "type"
		},

		fixDoc: function(doc) {
			var settings = this.settings, name;

			if (isIE && settings.schema) {
				// Add missing HTML 4/5 elements to IE
				('abbr article aside audio canvas ' +
				'details figcaption figure footer ' +
				'header hgroup mark menu meter nav ' +
				'output progress section summary ' +
				'time video').replace(/\w+/g, function(name) {
					doc.createElement(name);
				});

				// Create all custom elements
				for (name in settings.schema.getCustomElements()) {
					doc.createElement(name);
				}
			}
		},

		clone: function(node, deep) {
			var self = this, clone, doc;

			// TODO: Add feature detection here in the future
			if (!isIE || node.nodeType !== 1 || deep) {
				return node.cloneNode(deep);
			}

			doc = self.doc;

			// Make a HTML5 safe shallow copy
			if (!deep) {
				clone = doc.createElement(node.nodeName);

				// Copy attribs
				each(self.getAttribs(node), function(attr) {
					self.setAttrib(clone, attr.nodeName, self.getAttrib(node, attr.nodeName));
				});

				return clone;
			}
/*
			// Setup HTML5 patched document fragment
			if (!self.frag) {
				self.frag = doc.createDocumentFragment();
				self.fixDoc(self.frag);
			}

			// Make a deep copy by adding it to the document fragment then removing it this removed the :section
			clone = doc.createElement('div');
			self.frag.appendChild(clone);
			clone.innerHTML = node.outerHTML;
			self.frag.removeChild(clone);
*/
			return clone.firstChild;
		},

		/**
		 * Returns the root node of the document. This is normally the body but might be a DIV. Parents like getParent will not
		 * go above the point of this root node.
		 *
		 * @method getRoot
		 * @return {Element} Root element for the utility class.
		 */
		getRoot: function() {
			var self = this;

			return self.get(self.settings.root_element) || self.doc.body;
		},

		/**
		 * Returns the viewport of the window.
		 *
		 * @method getViewPort
		 * @param {Window} win Optional window to get viewport of.
		 * @return {Object} Viewport object with fields x, y, w and h.
		 */
		getViewPort: function(win) {
			var doc, rootElm;

			win = !win ? this.win : win;
			doc = win.document;
			rootElm = this.boxModel ? doc.documentElement : doc.body;

			// Returns viewport size excluding scrollbars
			return {
				x: win.pageXOffset || rootElm.scrollLeft,
				y: win.pageYOffset || rootElm.scrollTop,
				w: win.innerWidth || rootElm.clientWidth,
				h: win.innerHeight || rootElm.clientHeight
			};
		},

		/**
		 * Returns the rectangle for a specific element.
		 *
		 * @method getRect
		 * @param {Element/String} elm Element object or element ID to get rectangle from.
		 * @return {object} Rectangle for specified element object with x, y, w, h fields.
		 */
		getRect: function(elm) {
			var self = this, pos, size;

			elm = self.get(elm);
			pos = self.getPos(elm);
			size = self.getSize(elm);

			return {
				x: pos.x, y: pos.y,
				w: size.w, h: size.h
			};
		},

		/**
		 * Returns the size dimensions of the specified element.
		 *
		 * @method getSize
		 * @param {Element/String} elm Element object or element ID to get rectangle from.
		 * @return {object} Rectangle for specified element object with w, h fields.
		 */
		getSize: function(elm) {
			var self = this, w, h;

			elm = self.get(elm);
			w = self.getStyle(elm, 'width');
			h = self.getStyle(elm, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1) {
				w = 0;
			}

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1) {
				h = 0;
			}

			return {
				w: parseInt(w, 10) || elm.offsetWidth || elm.clientWidth,
				h: parseInt(h, 10) || elm.offsetHeight || elm.clientHeight
			};
		},

		/**
		 * Returns a node by the specified selector function. This function will
		 * loop through all parent nodes and call the specified function for each node.
		 * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
		 * and the node it found will be returned.
		 *
		 * @method getParent
		 * @param {Node/String} node DOM node to search parents on or ID string.
		 * @param {function} selector Selection function or CSS selector to execute on each node.
		 * @param {Node} root Optional root element, never go below this point.
		 * @return {Node} DOM Node or null if it wasn't found.
		 */
		getParent: function(node, selector, root) {
			return this.getParents(node, selector, root, false);
		},

		/**
		 * Returns a node list of all parents matching the specified selector function or pattern.
		 * If the function then returns true indicating that it has found what it was looking for and that node will be collected.
		 *
		 * @method getParents
		 * @param {Node/String} node DOM node to search parents on or ID string.
		 * @param {function} selector Selection function to execute on each node or CSS pattern.
		 * @param {Node} root Optional root element, never go below this point.
		 * @return {Array} Array of nodes or null if it wasn't found.
		 */
		getParents: function(node, selector, root, collect) {
			var self = this, selectorVal, result = [];

			node = self.get(node);
			collect = collect === undefined;

			// Default root on inline mode
			root = root || (self.getRoot().nodeName != 'BODY' ? self.getRoot().parentNode : null);

			// Wrap node name as func
			if (is(selector, 'string')) {
				selectorVal = selector;

				if (selector === '*') {
					selector = function(node) {return node.nodeType == 1;};
				} else {
					selector = function(node) {
						return self.is(node, selectorVal);
					};
				}
			}

			while (node) {
				if (node == root || !node.nodeType || node.nodeType === 9) {
					break;
				}

				if (!selector || selector(node)) {
					if (collect) {
						result.push(node);
					} else {
						return node;
					}
				}

				node = node.parentNode;
			}

			return collect ? result : null;
		},

		/**
		 * Returns the specified element by ID or the input element if it isn't a string.
		 *
		 * @method get
		 * @param {String/Element} n Element id to look for or element to just pass though.
		 * @return {Element} Element matching the specified id or null if it wasn't found.
		 */
		get: function(elm) {
			var name;

			if (elm && this.doc && typeof(elm) == 'string') {
				name = elm;
				elm = this.doc.getElementById(elm);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (elm && elm.id !== name) {
					return this.doc.getElementsByName(name)[1];
				}
			}

			return elm;
		},

		/**
		 * Returns the next node that matches selector or function
		 *
		 * @method getNext
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Next node item matching the selector or null if it wasn't found.
		 */
		getNext: function(node, selector) {
			return this._findSib(node, selector, 'nextSibling');
		},

		/**
		 * Returns the previous node that matches selector or function
		 *
		 * @method getPrev
		 * @param {Node} node Node to find siblings from.
		 * @param {String/function} selector Selector CSS expression or function.
		 * @return {Node} Previous node item matching the selector or null if it wasn't found.
		 */
		getPrev: function(node, selector) {
			return this._findSib(node, selector, 'previousSibling');
		},

		// #ifndef jquery

		/**
		 * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
		 * This function is optimized for the most common patterns needed in TinyMCE but it also performs well enough
		 * on more complex patterns.
		 *
		 * @method select
		 * @param {String} selector CSS level 3 pattern to select/find elements by.
		 * @param {Object} scope Optional root element/scope element to search in.
		 * @return {Array} Array with all matched elements.
		 * @example
		 * // Adds a class to all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
		 *
		 * // Adds a class to all spans that have the test class in the currently active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('span.test'), 'someclass')
		 */
		select: function(selector, scope) {
			var self = this;

			//Sizzle.selectors.cacheLength = 0;
			return Sizzle(selector, self.get(scope) || self.get(self.settings.root_element) || self.doc, []);
		},

		/**
		 * Returns true/false if the specified element matches the specified css pattern.
		 *
		 * @method is
		 * @param {Node/NodeList} elm DOM node to match or an array of nodes to match.
		 * @param {String} selector CSS pattern to match the element against.
		 */
		is: function(elm, selector) {
			var i;

			// If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
			if (elm.length === undefined) {
				// Simple all selector
				if (selector === '*') {
					return elm.nodeType == 1;
				}

				// Simple selector just elements
				if (simpleSelectorRe.test(selector)) {
					selector = selector.toLowerCase().split(/,/);
					elm = elm.nodeName.toLowerCase();

					for (i = selector.length - 1; i >= 0; i--) {
						if (selector[i] == elm) {
							return true;
						}
					}

					return false;
				}
			}

			// Is non element
			if (elm.nodeType && elm.nodeType != 1) {
				return false;
			}

			return Sizzle.matches(selector, elm.nodeType ? [elm] : elm).length > 0;
		},

		// #endif

		/**
		 * Adds the specified element to another element or elements.
		 *
		 * @method add
		 * @param {String/Element/Array} parentElm Element id string, DOM node element or array of ids or elements to add to.
		 * @param {String/Element} name Name of new element to add or existing element to add.
		 * @param {Object} attrs Optional object collection with arguments to add to the new element(s).
		 * @param {String} html Optional inner HTML contents to add for each element.
		 * @return {Element/Array} Element that got created, or an array of created elements if multiple input elements
		 * were passed in.
		 * @example
		 * // Adds a new paragraph to the end of the active editor
		 * tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), 'p', {title: 'my title'}, 'Some content');
		 */
		add: function(parentElm, name, attrs, html, create) {
			var self = this;

			return this.run(parentElm, function(parentElm) {
				var newElm;

				newElm = is(name, 'string') ? self.doc.createElement(name) : name;
				self.setAttribs(newElm, attrs);

				if (html) {
					if (html.nodeType) {
						newElm.appendChild(html);
					} else {
						self.setHTML(newElm, html);
					}
				}

				return !create ? parentElm.appendChild(newElm) : newElm;
			});
		},

		/**
		 * Creates a new element.
		 *
		 * @method create
		 * @param {String} name Name of new element.
		 * @param {Object} attrs Optional object name/value collection with element attributes.
		 * @param {String} html Optional HTML string to set as inner HTML of the element.
		 * @return {Element} HTML DOM node element that got created.
		 * @example
		 * // Adds an element where the caret/selection is in the active editor
		 * var el = tinymce.activeEditor.dom.create('div', {id: 'test', 'class': 'myclass'}, 'some content');
		 * tinymce.activeEditor.selection.setNode(el);
		 */
		create: function(name, attrs, html) {
			return this.add(this.doc.createElement(name), name, attrs, html, 1);
		},

		/**
		 * Creates HTML string for element. The element will be closed unless an empty inner HTML string is passed in.
		 *
		 * @method createHTML
		 * @param {String} name Name of new element.
		 * @param {Object} attrs Optional object name/value collection with element attributes.
		 * @param {String} html Optional HTML string to set as inner HTML of the element.
		 * @return {String} String with new HTML element, for example: <a href="#">test</a>.
		 * @example
		 * // Creates a html chunk and inserts it at the current selection/caret location
		 * tinymce.activeEditor.selection.setContent(tinymce.activeEditor.dom.createHTML('a', {href: 'test.html'}, 'some line'));
		 */
		createHTML: function(name, attrs, html) {
			var outHtml = '', key;

			outHtml += '<' + name;

			for (key in attrs) {
				if (attrs.hasOwnProperty(key) && attrs[key] !== null) {
					outHtml += ' ' + key + '="' + this.encode(attrs[key]) + '"';
				}
			}

			// A call to tinymce.is doesn't work for some odd reason on IE9 possible bug inside their JS runtime
			if (typeof(html) != "undefined") {
				return outHtml + '>' + html + '</' + name + '>';
			}

			return outHtml + ' />';
		},

		/**
		 * Creates a document fragment out of the specified HTML string.
		 *
		 * @method createFragment
		 * @param {String} html Html string to create fragment from.
		 * @return {DocumentFragment} Document fragment node.
		 */
		createFragment: function(html) {
			var frag, node, doc = this.doc, container;

			container = doc.createElement("div");
			frag = doc.createDocumentFragment();

			if (html) {
				container.innerHTML = html;
			}

			while ((node = container.firstChild)) {
				frag.appendChild(node);
			}

			return frag;
		},

		/**
		 * Removes/deletes the specified element(s) from the DOM.
		 *
		 * @method remove
		 * @param {String/Element/Array} node ID of element or DOM element object or array containing multiple elements/ids.
		 * @param {Boolean} keep_children Optional state to keep children or not. If set to true all children will be
		 * placed at the location of the removed element.
		 * @return {Element/Array} HTML DOM element that got removed, or an array of removed elements if multiple input elements
		 * were passed in.
		 * @example
		 * // Removes all paragraphs in the active editor
		 * tinymce.activeEditor.dom.remove(tinymce.activeEditor.dom.select('p'));
		 *
		 * // Removes an element by id in the document
		 * tinymce.DOM.remove('mydiv');
		 */
		remove: function(node, keep_children) {
			return this.run(node, function(node) {
				var child, parent = node.parentNode;

				if (!parent) {
					return null;
				}

				if (keep_children) {
					while ((child = node.firstChild)) {
						// IE 8 will crash if you don't remove completely empty text nodes
						if (!isIE || child.nodeType !== 3 || child.nodeValue) {
							parent.insertBefore(child, node);
						} else {
							node.removeChild(child);
						}
					}
				}

				return parent.removeChild(node);
			});
		},

		/**
		 * Sets the CSS style value on a HTML element. The name can be a camelcase string
		 * or the CSS style name like background-color.
		 *
		 * @method setStyle
		 * @param {String/Element/Array} n HTML element/Element ID or Array of elements/ids to set CSS style value on.
		 * @param {String} na Name of the style value to set.
		 * @param {String} v Value to set on the style.
		 * @example
		 * // Sets a style value on all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.setStyle(tinymce.activeEditor.dom.select('p'), 'background-color', 'red');
		 *
		 * // Sets a style value to an element by id in the current document
		 * tinymce.DOM.setStyle('mydiv', 'background-color', 'red');
		 */
		setStyle: function(elm, name, value) {
			return this.run(elm, function(elm) {
				var self = this, style, key;

				if (name) {
					if (typeof(name) === 'string') {
						style = elm.style;

						// Camelcase it, if needed
						name = name.replace(/-(\D)/g, function(a, b) {
							return b.toUpperCase();
						});

						// Default px suffix on these
						if (typeof(value) === 'number' && !numericCssMap[name]) {
							value += 'px';
						}

						// IE specific opacity
						if (name === "opacity" && elm.runtimeStyle && typeof(elm.runtimeStyle.opacity) === "undefined") {
							style.filter = value === '' ? '' : "alpha(opacity=" + (value * 100) + ")";
						}

						if (name == "float") {
							// Old IE vs modern browsers
							name = "cssFloat" in elm.style ? "cssFloat" : "styleFloat";
						}

						try {
							style[name] = value;
						} catch (ex) {
							// Ignore IE errors
						}

						// Force update of the style data
						if (self.settings.update_styles) {
							elm.removeAttribute('data-mce-style');
						}
					} else {
						for (key in name) {
							self.setStyle(elm, key, name[key]);
						}
					}
				}
			});
		},

		/**
		 * Returns the current style or runtime/computed value of an element.
		 *
		 * @method getStyle
		 * @param {String/Element} elm HTML element or element id string to get style from.
		 * @param {String} name Style name to return.
		 * @param {Boolean} computed Computed style.
		 * @return {String} Current style or computed style value of an element.
		 */
		getStyle: function(elm, name, computed) {
			elm = this.get(elm);

			if (!elm) {
				return;
			}

			// W3C
			if (this.doc.defaultView && computed) {
				// Remove camelcase
				name = name.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(elm, null).getPropertyValue(name);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			name = name.replace(/-(\D)/g, function(a, b) {
				return b.toUpperCase();
			});

			if (name == 'float') {
				name = isIE ? 'styleFloat' : 'cssFloat';
			}

			// IE & Opera
			if (elm.currentStyle && computed) {
				return elm.currentStyle[name];
			}

			return elm.style ? elm.style[name] : undefined;
		},

		/**
		 * Sets multiple styles on the specified element(s).
		 *
		 * @method setStyles
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set styles on.
		 * @param {Object} o Name/Value collection of style items to add to the element(s).
		 * @example
		 * // Sets styles on all paragraphs in the currently active editor
		 * tinymce.activeEditor.dom.setStyles(tinymce.activeEditor.dom.select('p'), {'background-color': 'red', 'color': 'green'});
		 *
		 * // Sets styles to an element by id in the current document
		 * tinymce.DOM.setStyles('mydiv', {'background-color': 'red', 'color': 'green'});
		 */
		setStyles: function(elm, styles) {
			this.setStyle(elm, styles);
		},

		css: function(elm, name, value) {
			this.setStyle(elm, name, value);
		},

		/**
		 * Removes all attributes from an element or elements.
		 *
		 * @method removeAllAttribs
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to remove attributes from.
		 */
		removeAllAttribs: function(e) {
			return this.run(e, function(e) {
				var i, attrs = e.attributes;
				for (i = attrs.length - 1; i >= 0; i--) {
					e.removeAttributeNode(attrs.item(i));
				}
			});
		},

		/**
		 * Sets the specified attribute of an element or elements.
		 *
		 * @method setAttrib
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set attribute on.
		 * @param {String} n Name of attribute to set.
		 * @param {String} v Value to set on the attribute - if this value is falsy like null, 0 or '' it will remove the attribute instead.
		 * @example
		 * // Sets class attribute on all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setAttrib(tinymce.activeEditor.dom.select('p'), 'class', 'myclass');
		 *
		 * // Sets class attribute on a specific element in the current page
		 * tinymce.dom.setAttrib('mydiv', 'class', 'myclass');
		 */
		setAttrib: function(e, n, v) {
			var t = this;

			// What's the point
			if (!e || !n) {
				return;
			}

			return this.run(e, function(e) {
				var s = t.settings;
				var originalValue = e.getAttribute(n);
				if (v !== null) {
					switch (n) {
						case "style":
							if (!is(v, 'string')) {
								each(v, function(v, n) {
									t.setStyle(e, n, v);
								});

								return;
							}

							// No mce_style for elements with these since they might get resized by the user
							if (s.keep_values) {
								if (v) {
									e.setAttribute('data-mce-style', v, 2);
								} else {
									e.removeAttribute('data-mce-style', 2);
								}
							}

							e.style.cssText = v;
							break;

						case "class":
							e.className = v || ''; // Fix IE null bug
							break;

						case "src":
						case "href":
							if (s.keep_values) {
								if (s.url_converter) {
									v = s.url_converter.call(s.url_converter_scope || t, v, n, e);
								}

								t.setAttrib(e, 'data-mce-' + n, v, 2);
							}

							break;

						case "shape":
							e.setAttribute('data-mce-style', v);
							break;
					}
				}
				if (is(v) && v !== null && v.length !== 0) {
					e.setAttribute(n, '' + v, 2);
				} else {
					e.removeAttribute(n, 2);
				}

				// fire onChangeAttrib event for attributes that have changed
				if (originalValue != v && s.onSetAttrib) {
					s.onSetAttrib({attrElm: e, attrName: n, attrValue: v});
				}
			});
		},

		/**
		 * Sets two or more specified attributes of an element or elements.
		 *
		 * @method setAttribs
		 * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set attributes on.
		 * @param {Object} attrs Name/Value collection of attribute items to add to the element(s).
		 * @example
		 * // Sets class and title attributes on all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setAttribs(tinymce.activeEditor.dom.select('p'), {'class': 'myclass', title: 'some title'});
		 *
		 * // Sets class and title attributes on a specific element in the current page
		 * tinymce.DOM.setAttribs('mydiv', {'class': 'myclass', title: 'some title'});
		 */
		setAttribs: function(elm, attrs) {
			var self = this;

			return this.run(elm, function(elm) {
				each(attrs, function(value, name) {
					self.setAttrib(elm, name, value);
				});
			});
		},

		/**
		 * Returns the specified attribute by name.
		 *
		 * @method getAttrib
		 * @param {String/Element} elm Element string id or DOM element to get attribute from.
		 * @param {String} name Name of attribute to get.
		 * @param {String} defaultVal Optional default value to return if the attribute didn't exist.
		 * @return {String} Attribute value string, default value or null if the attribute wasn't found.
		 */
		getAttrib: function(elm, name, defaultVal) {
			var value, self = this, undef;

			elm = self.get(elm);

			if (!elm || elm.nodeType !== 1) {
				return defaultVal === undef ? false : defaultVal;
			}

			if (!is(defaultVal)) {
				defaultVal = '';
			}

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(name)) {
				value = elm.getAttribute("data-mce-" + name);

				if (value) {
					return value;
				}
			}

			if (isIE && self.props[name]) {
				value = elm[self.props[name]];
				value = value && value.nodeValue ? value.nodeValue : value;
			}

			if (!value) {
				value = elm.getAttribute(name, 2);
			}

			// Check boolean attribs
			if (/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(name)) {
				if (elm[self.props[name]] === true && value === '') {
					return name;
				}

				return value ? name : '';
			}

			// Inner input elements will override attributes on form elements
			if (elm.nodeName === "FORM" && elm.getAttributeNode(name)) {
				return elm.getAttributeNode(name).nodeValue;
			}

			if (name === 'style') {
				value = value || elm.style.cssText;

				if (value) {
					value = self.serializeStyle(self.parseStyle(value), elm.nodeName);

					if (self.settings.keep_values) {
						elm.setAttribute('data-mce-style', value);
					}
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && name === "class" && value) {
				value = value.replace(/(apple|webkit)\-[a-z\-]+/gi, '');
			}

			// Handle IE issues
			if (isIE) {
				switch (name) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (value === 1) {
							value = '';
						}

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (value === '+0' || value === 20 || value === 0) {
							value = '';
						}

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (value === 0) {
							value = '';
						}

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (value === -1) {
							value = '';
						}

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (value === 32768 || value === 2147483647 || value === '32768') {
							value = '';
						}

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (value === 65535) {
							return name;
						}

						return defaultVal;

					case 'shape':
						value = value.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (name.indexOf('on') === 0 && value) {
							value = ('' + value).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1');
						}
				}
			}

			return (value !== undef && value !== null && value !== '') ? '' + value : defaultVal;
		},

		/**
		 * Returns the absolute x, y position of a node. The position will be returned in an object with x, y fields.
		 *
		 * @method getPos
		 * @param {Element/String} elm HTML element or element id to get x, y position from.
		 * @param {Element} rootElm Optional root element to stop calculations at.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		getPos: function(elm, rootElm) {
			var self = this, x = 0, y = 0, offsetParent, doc = self.doc, pos;

			elm = self.get(elm);
			rootElm = rootElm || doc.body;

			if (elm) {
				// Use getBoundingClientRect if it exists since it's faster than looping offset nodes
				if (rootElm === doc.body && elm.getBoundingClientRect) {
					pos = elm.getBoundingClientRect();
					rootElm = self.boxModel ? doc.documentElement : doc.body;

					// Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
					// Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
					x = pos.left + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - rootElm.clientLeft;
					y = pos.top + (doc.documentElement.scrollTop || doc.body.scrollTop) - rootElm.clientTop;

					return {x: x, y: y};
				}

				offsetParent = elm;
				while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
					x += offsetParent.offsetLeft || 0;
					y += offsetParent.offsetTop || 0;
					offsetParent = offsetParent.offsetParent;
				}

				offsetParent = elm.parentNode;
				while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
					x -= offsetParent.scrollLeft || 0;
					y -= offsetParent.scrollTop || 0;
					offsetParent = offsetParent.parentNode;
				}
			}

			return {x: x, y: y};
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non-hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parseStyle
		 * @param {String} cssText Style value to parse, for example: border:1px solid red;.
		 * @return {Object} Object representation of that style, for example: {border: '1px solid red'}
		 */
		parseStyle: function(cssText) {
			return this.styles.parse(cssText);
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serializeStyle
		 * @param {Object} styles Object to serialize as string, for example: {border: '1px solid red'}
		 * @param {String} name Optional element name.
		 * @return {String} String representation of the style object, for example: border: 1px solid red.
		 */
		serializeStyle: function(styles, name) {
			return this.styles.serialize(styles, name);
		},

		/**
		 * Adds a style element at the top of the document with the specified cssText content.
		 *
		 * @method addStyle
		 * @param {String} cssText CSS Text style to add to top of head of document.
		 */
		addStyle: function(cssText) {
			var self = this, doc = self.doc, head, styleElm;

			// Prevent inline from loading the same styles twice
			if (self !== DOMUtils.DOM && doc === document) {
				var addedStyles = DOMUtils.DOM.addedStyles;

				addedStyles = addedStyles || [];
				if (addedStyles[cssText]) {
					return;
				}

				addedStyles[cssText] = true;
				DOMUtils.DOM.addedStyles = addedStyles;
			}

			// Create style element if needed
			styleElm = doc.getElementById('mceDefaultStyles');
			if (!styleElm) {
				styleElm = doc.createElement('style');
				styleElm.id = 'mceDefaultStyles';
				styleElm.type = 'text/css';

				head = doc.getElementsByTagName('head')[0];
				if (head.firstChild) {
					head.insertBefore(styleElm, head.firstChild);
				} else {
					head.appendChild(styleElm);
				}
			}

			// Append style data to old or new style element
			if (styleElm.styleSheet) {
				styleElm.styleSheet.cssText += cssText;
			} else {
				styleElm.appendChild(doc.createTextNode(cssText));
			}
		},

		/**
		 * Imports/loads the specified CSS file into the document bound to the class.
		 *
		 * @method loadCSS
		 * @param {String} u URL to CSS file to load.
		 * @example
		 * // Loads a CSS file dynamically into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css');
		 *
		 * // Loads a CSS file into the currently active editor instance
		 * tinymce.activeEditor.dom.loadCSS('somepath/some.css');
		 *
		 * // Loads a CSS file into an editor instance by id
		 * tinymce.get('someid').dom.loadCSS('somepath/some.css');
		 *
		 * // Loads multiple CSS files into the current document
		 * tinymce.DOM.loadCSS('somepath/some.css,somepath/someother.css');
		 */
		loadCSS: function(url) {
			var self = this, doc = self.doc, head;

			// Prevent inline from loading the same CSS file twice
			if (self !== DOMUtils.DOM && doc === document) {
				DOMUtils.DOM.loadCSS(url);
				return;
			}

			if (!url) {
				url = '';
			}

			head = doc.getElementsByTagName('head')[0];

			each(url.split(','), function(url) {
				var link;

				if (self.files[url]) {
					return;
				}

				self.files[url] = true;
				link = self.create('link', {rel: 'stylesheet', href: url});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by recalcing the document once a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && doc.documentMode && doc.recalc) {
					link.onload = function() {
						if (doc.recalc) {
							doc.recalc();
						}

						link.onload = null;
					};
				}

				head.appendChild(link);
			});
		},

		/**
		 * Adds a class to the specified element or elements.
		 *
		 * @method addClass
		 * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
		 * @param {String} cls Class name to add to each element.
		 * @return {String/Array} String with new class value or array with new class values for all elements.
		 * @example
		 * // Adds a class to all paragraphs in the active editor
		 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'myclass');
		 *
		 * // Adds a class to a specific element in the current page
		 * tinymce.DOM.addClass('mydiv', 'myclass');
		 */
		addClass: function(elm, cls) {
			return this.run(elm, function(elm) {
				var clsVal;

				if (!cls) {
					return 0;
				}

				if (this.hasClass(elm, cls)) {
					return elm.className;
				}

				clsVal = this.removeClass(elm, cls);
				elm.className = clsVal = (clsVal !== '' ? (clsVal + ' ') : '') + cls;

				return clsVal;
			});
		},

		/**
		 * Removes a class from the specified element or elements.
		 *
		 * @method removeClass
		 * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
		 * @param {String} cls Class name to remove from each element.
		 * @return {String/Array} String of remaining class name(s), or an array of strings if multiple input elements
		 * were passed in.
		 * @example
		 * // Removes a class from all paragraphs in the active editor
		 * tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('p'), 'myclass');
		 *
		 * // Removes a class from a specific element in the current page
		 * tinymce.DOM.removeClass('mydiv', 'myclass');
		 */
		removeClass: function(elm, cls) {
			var self = this, re;

			return self.run(elm, function(elm) {
				var val;

				if (self.hasClass(elm, cls)) {
					if (!re) {
						re = new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g");
					}

					val = elm.className.replace(re, ' ');
					val = trim(val != ' ' ? val : '');

					elm.className = val;

					// Empty class attr
					if (!val) {
						elm.removeAttribute('class');
						elm.removeAttribute('className');
					}

					return val;
				}

				return elm.className;
			});
		},

		/**
		 * Returns true if the specified element has the specified class.
		 *
		 * @method hasClass
		 * @param {String/Element} n HTML element or element id string to check CSS class on.
		 * @param {String} c CSS class to check for.
		 * @return {Boolean} true/false if the specified element has the specified class.
		 */
		hasClass: function(elm, cls) {
			elm = this.get(elm);

			if (!elm || !cls) {
				return false;
			}

			return (' ' + elm.className + ' ').indexOf(' ' + cls + ' ') !== -1;
		},

		/**
		 * Toggles the specified class on/off.
		 *
		 * @method toggleClass
		 * @param {Element} elm Element to toggle class on.
		 * @param {[type]} cls Class to toggle on/off.
		 * @param {[type]} state Optional state to set.
		 */
		toggleClass: function(elm, cls, state) {
			state = state === undefined ? !this.hasClass(elm, cls) : state;

			if (this.hasClass(elm, cls) !== state) {
				if (state) {
					this.addClass(elm, cls);
				} else {
					this.removeClass(elm, cls);
				}
			}
		},

		/**
		 * Shows the specified element(s) by ID by setting the "display" style.
		 *
		 * @method show
		 * @param {String/Element/Array} elm ID of DOM element or DOM element or array with elements or IDs to show.
		 */
		show: function(elm) {
			return this.setStyle(elm, 'display', 'block');
		},

		/**
		 * Hides the specified element(s) by ID by setting the "display" style.
		 *
		 * @method hide
		 * @param {String/Element/Array} e ID of DOM element or DOM element or array with elements or IDs to hide.
		 * @example
		 * // Hides an element by id in the document
		 * tinymce.DOM.hide('myid');
		 */
		hide: function(elm) {
			return this.setStyle(elm, 'display', 'none');
		},

		/**
		 * Returns true/false if the element is hidden or not by checking the "display" style.
		 *
		 * @method isHidden
		 * @param {String/Element} e Id or element to check display state on.
		 * @return {Boolean} true/false if the element is hidden or not.
		 */
		isHidden: function(elm) {
			elm = this.get(elm);

			return !elm || elm.style.display == 'none' || this.getStyle(elm, 'display') == 'none';
		},

		/**
		 * Returns a unique id. This can be useful when generating elements on the fly.
		 * This method will not check if the element already exists.
		 *
		 * @method uniqueId
		 * @param {String} prefix Optional prefix to add in front of all ids - defaults to "mce_".
		 * @return {String} Unique id.
		 */
		uniqueId: function(prefix) {
			return (!prefix ? 'mce_' : prefix) + (this.counter++);
		},

		/**
		 * Sets the specified HTML content inside the element or elements. The HTML will first be processed. This means
		 * URLs will get converted, hex color values fixed etc. Check processHTML for details.
		 *
		 * @method setHTML
		 * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to set HTML inside of.
		 * @param {String} h HTML content to set as inner HTML of the element.
		 * @example
		 * // Sets the inner HTML of all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setHTML(tinymce.activeEditor.dom.select('p'), 'some inner html');
		 *
		 * // Sets the inner HTML of an element by id in the document
		 * tinymce.DOM.setHTML('mydiv', 'some inner html');
		 */
		setHTML: function(element, html) {
			var self = this;

			return self.run(element, function(element) {
				if (isIE) {
					// Remove all child nodes, IE keeps empty text nodes in DOM
					while (element.firstChild) {
						element.removeChild(element.firstChild);
					}

					try {
						// IE will remove comments from the beginning
						// unless you padd the contents with something
						element.innerHTML = '<br />' + html;
						element.removeChild(element.firstChild);
					} catch (ex) {
						// IE sometimes produces an unknown runtime error on innerHTML if it's a block element
						// within a block element for example a div inside a p
						// This seems to fix this problem

						// Create new div with HTML contents and a BR in front to keep comments
						var newElement = self.create('div');
						newElement.innerHTML = '<br />' + html;

						// Add all children from div to target
						each (grep(newElement.childNodes), function(node, i) {
							// Skip br element
							if (i && element.canHaveHTML) {
								element.appendChild(node);
							}
						});
					}
				} else {
					element.innerHTML = html;
				}

				return html;
			});
		},

		/**
		 * Returns the outer HTML of an element.
		 *
		 * @method getOuterHTML
		 * @param {String/Element} elm Element ID or element object to get outer HTML from.
		 * @return {String} Outer HTML string.
		 * @example
		 * tinymce.DOM.getOuterHTML(editorElement);
		 * tinymce.activeEditor.getOuterHTML(tinymce.activeEditor.getBody());
		 */
		getOuterHTML: function(elm) {
			var doc, self = this;

			elm = self.get(elm);

			if (!elm) {
				return null;
			}

			if (elm.nodeType === 1 && self.hasOuterHTML) {
				return elm.outerHTML;
			}

			doc = (elm.ownerDocument || self.doc).createElement("body");
			doc.appendChild(elm.cloneNode(true));

			return doc.innerHTML;
		},

		/**
		 * Sets the specified outer HTML on an element or elements.
		 *
		 * @method setOuterHTML
		 * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set outer HTML on.
		 * @param {Object} html HTML code to set as outer value for the element.
		 * @param {Document} doc Optional document scope to use in this process - defaults to the document of the DOM class.
		 * @example
		 * // Sets the outer HTML of all paragraphs in the active editor
		 * tinymce.activeEditor.dom.setOuterHTML(tinymce.activeEditor.dom.select('p'), '<div>some html</div>');
		 *
		 * // Sets the outer HTML of an element by id in the document
		 * tinymce.DOM.setOuterHTML('mydiv', '<div>some html</div>');
		 */
		setOuterHTML: function(elm, html, doc) {
			var self = this;

			return self.run(elm, function(elm) {
				function set() {
					var node, tempElm;

					tempElm = doc.createElement("body");
					tempElm.innerHTML = html;

					node = tempElm.lastChild;
					while (node) {
						self.insertAfter(node.cloneNode(true), elm);
						node = node.previousSibling;
					}

					self.remove(elm);
				}

				// Only set HTML on elements
				if (elm.nodeType == 1) {
					doc = doc || elm.ownerDocument || self.doc;

					if (isIE) {
						try {
							// Try outerHTML for IE it sometimes produces an unknown runtime error
							if (elm.nodeType == 1 && self.hasOuterHTML) {
								elm.outerHTML = html;
							} else {
								set();
							}
						} catch (ex) {
							// Fix for unknown runtime error
							set();
						}
					} else {
						set();
					}
				}
			});
		},

		/**
		 * Entity decodes a string. This method decodes any HTML entities, such as &aring;.
		 *
		 * @method decode
		 * @param {String} s String to decode entities on.
		 * @return {String} Entity decoded string.
		 */
		decode: Entities.decode,

		/**
		 * Entity encodes a string. This method encodes the most common entities, such as <>"&.
		 *
		 * @method encode
		 * @param {String} text String to encode with entities.
		 * @return {String} Entity encoded string.
		 */
		encode: Entities.encodeAllRaw,

		/**
		 * Inserts an element after the reference element.
		 *
		 * @method insertAfter
		 * @param {Element} node Element to insert after the reference.
		 * @param {Element/String/Array} reference_node Reference element, element id or array of elements to insert after.
		 * @return {Element/Array} Element that got added or an array with elements.
		 */
		insertAfter: function(node, reference_node) {
			reference_node = this.get(reference_node);

			return this.run(node, function(node) {
				var parent, nextSibling;

				parent = reference_node.parentNode;
				nextSibling = reference_node.nextSibling;

				if (nextSibling) {
					parent.insertBefore(node, nextSibling);
				} else {
					parent.appendChild(node);
				}

				return node;
			});
		},

		/**
		 * Replaces the specified element or elements with the new element specified. The new element will
		 * be cloned if multiple input elements are passed in.
		 *
		 * @method replace
		 * @param {Element} newElm New element to replace old ones with.
		 * @param {Element/String/Array} oldELm Element DOM node, element id or array of elements or ids to replace.
		 * @param {Boolean} k Optional keep children state, if set to true child nodes from the old object will be added to new ones.
		 */
		replace: function(newElm, oldElm, keepChildren) {
			var self = this;

			return self.run(oldElm, function(oldElm) {
				if (is(oldElm, 'array')) {
					newElm = newElm.cloneNode(true);
				}

				if (keepChildren) {
					each(grep(oldElm.childNodes), function(node) {
						newElm.appendChild(node);
					});
				}

				return oldElm.parentNode.replaceChild(newElm, oldElm);
			});
		},

		/**
		 * Renames the specified element and keeps its attributes and children.
		 *
		 * @method rename
		 * @param {Element} elm Element to rename.
		 * @param {String} name Name of the new element.
		 * @return {Element} New element or the old element if it needed renaming.
		 */
		rename: function(elm, name) {
			var self = this, newElm;

			if (elm.nodeName != name.toUpperCase()) {
				// Rename block element
				newElm = self.create(name);

				// Copy attribs to new block
				each(self.getAttribs(elm), function(attr_node) {
					self.setAttrib(newElm, attr_node.nodeName, self.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				self.replace(newElm, elm, 1);
			}

			return newElm || elm;
		},

		/**
		 * Find the common ancestor of two elements. This is a shorter method than using the DOM Range logic.
		 *
		 * @method findCommonAncestor
		 * @param {Element} a Element to find common ancestor of.
		 * @param {Element} b Element to find common ancestor of.
		 * @return {Element} Common ancestor element of the two input elements.
		 */
		findCommonAncestor: function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe) {
					pe = pe.parentNode;
				}

				if (ps == pe) {
					break;
				}

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument) {
				return a.ownerDocument.documentElement;
			}

			return ps;
		},

		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} rgbVal RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex: function(rgbVal) {
			return this.styles.toHex(Tools.trim(rgbVal));
		},

		/**
		 * Executes the specified function on the element by id or dom element node or array of elements/id.
		 *
		 * @method run
		 * @param {String/Element/Array} Element ID or DOM element object or array with ids or elements.
		 * @param {function} f Function to execute for each item.
		 * @param {Object} s Optional scope to execute the function in.
		 * @return {Object/Array} Single object, or an array of objects if multiple input elements were passed in.
		 */
		run: function(elm, func, scope) {
			var self = this, result;

			if (typeof(elm) === 'string') {
				elm = self.get(elm);
			}

			if (!elm) {
				return false;
			}

			scope = scope || this;
			if (!elm.nodeType && (elm.length || elm.length === 0)) {
				result = [];

				each(elm, function(elm, i) {
					if (elm) {
						if (typeof(elm) == 'string') {
							elm = self.get(elm);
						}

						result.push(func.call(scope, elm, i));
					}
				});

				return result;
			}

			return func.call(scope, elm);
		},

		/**
		 * Returns a NodeList with attributes for the element.
		 *
		 * @method getAttribs
		 * @param {HTMLElement/string} elm Element node or string id to get attributes from.
		 * @return {NodeList} NodeList with attributes.
		 */
		getAttribs: function(elm) {
			var attrs;

			elm = this.get(elm);

			if (!elm) {
				return [];
			}

			if (isIE) {
				attrs = [];

				// Object will throw exception in IE
				if (elm.nodeName == 'OBJECT') {
					return elm.attributes;
				}

				// IE doesn't keep the selected attribute if you clone option elements
				if (elm.nodeName === 'OPTION' && this.getAttrib(elm, 'selected')) {
					attrs.push({specified: 1, nodeName: 'selected'});
				}

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				var attrRegExp = /<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi;
				elm.cloneNode(false).outerHTML.replace(attrRegExp, '').replace(/[\w:\-]+/gi, function(a) {
					attrs.push({specified: 1, nodeName: a});
				});

				return attrs;
			}

			return elm.attributes;
		},

		/**
		 * Returns true/false if the specified node is to be considered empty or not.
		 *
		 * @example
		 * tinymce.DOM.isEmpty(node, {img: true});
		 * @method isEmpty
		 * @param {Object} elements Optional name/value object with elements that are automatically treated as non-empty elements.
		 * @return {Boolean} true/false if the node is empty or not.
		 */
		isEmpty: function(node, elements) {
			var self = this, i, attributes, type, walker, name, brCount = 0;

			node = node.firstChild;
			if (node) {
				walker = new TreeWalker(node, node.parentNode);
				elements = elements || self.schema ? self.schema.getNonEmptyElements() : null;

				do {
					type = node.nodeType;

					if (type === 1) {
						// Ignore bogus elements
						if (node.getAttribute('data-mce-bogus')) {
							continue;
						}

						// Keep empty elements like <img />
						name = node.nodeName.toLowerCase();
						if (elements && elements[name]) {
							// Ignore single BR elements in blocks like <p><br /></p> or <p><span><br /></span></p>
							if (name === 'br') {
								brCount++;
								continue;
							}

							return false;
						}

						// Keep elements with data-bookmark attributes or name attribute like <a name="1"></a>
						attributes = self.getAttribs(node);
						i = node.attributes.length;
						while (i--) {
							name = node.attributes[i].nodeName;
							if (name === "name" || name === 'data-mce-bookmark') {
								return false;
							}
						}
					}

					// Keep comment nodes
					if (type == 8) {
						return false;
					}

					// Keep non whitespace text nodes
					if ((type === 3 && !whiteSpaceRegExp.test(node.nodeValue))) {
						return false;
					}
				} while ((node = walker.next()));
			}

			return brCount <= 1;
		},

		/**
		 * Creates a new DOM Range object. This will use the native DOM Range API if it's
		 * available. If it's not, it will fall back to the custom TinyMCE implementation.
		 *
		 * @method createRng
		 * @return {DOMRange} DOM Range object.
		 * @example
		 * var rng = tinymce.DOM.createRng();
		 * alert(rng.startContainer + "," + rng.startOffset);
		 */
		createRng: function() {
			var doc = this.doc;

			return doc.createRange ? doc.createRange() : new Range(this);
		},

		/**
		 * Returns the index of the specified node within its parent.
		 *
		 * @method nodeIndex
		 * @param {Node} node Node to look for.
		 * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
		 * @return {Number} Index of the specified node.
		 */
		nodeIndex: function(node, normalized) {
			var idx = 0, lastNodeType, lastNode, nodeType;

			if (node) {
				for (lastNodeType = node.nodeType, node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
					nodeType = node.nodeType;

					// Normalize text nodes
					if (normalized && nodeType == 3) {
						if (nodeType == lastNodeType || !node.nodeValue.length) {
							continue;
						}
					}
					idx++;
					lastNodeType = nodeType;
				}
			}

			return idx;
		},

		/**
		 * Splits an element into two new elements and places the specified split
		 * element or elements between the new ones. For example splitting the paragraph at the bold element in
		 * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>.
		 *
		 * @method split
		 * @param {Element} parentElm Parent element to split.
		 * @param {Element} splitElm Element to split at.
		 * @param {Element} replacementElm Optional replacement element to replace the split element with.
		 * @return {Element} Returns the split element or the replacement element if that is specified.
		 */
		split: function(parentElm, splitElm, replacementElm) {
			var self = this, r = self.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents - this makes sense
			// but we don't want that in our code since it serves no purpose for the end user
			// For example splitting this html at the bold element:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim off empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trimNode(node) {
				var i, children = node.childNodes, type = node.nodeType;

				function surroundedBySpans(node) {
					var previousIsSpan = node.previousSibling && node.previousSibling.nodeName == 'SPAN';
					var nextIsSpan = node.nextSibling && node.nextSibling.nodeName == 'SPAN';
					return previousIsSpan && nextIsSpan;
				}

				if (type == 1 && node.getAttribute('data-mce-type') == 'bookmark') {
					return;
				}

				for (i = children.length - 1; i >= 0; i--) {
					trimNode(children[i]);
				}

				if (type != 9) {
					// Keep non whitespace text nodes
					if (type == 3 && node.nodeValue.length > 0) {
						// If parent element isn't a block or there isn't any useful contents for example "<p>   </p>"
						// Also keep text nodes with only spaces if surrounded by spans.
						// eg. "<p><span>a</span> <span>b</span></p>" should keep space between a and b
						var trimmedLength = trim(node.nodeValue).length;
						if (!self.isBlock(node.parentNode) || trimmedLength > 0 || trimmedLength === 0 && surroundedBySpans(node)) {
							return;
						}
					} else if (type == 1) {
						// If the only child is a bookmark then move it up
						children = node.childNodes;

						// TODO fix this complex if
						if (children.length == 1 && children[0] && children[0].nodeType == 1 &&
							children[0].getAttribute('data-mce-type') == 'bookmark') {
							node.parentNode.insertBefore(children[0], node);
						}

						// Keep non empty elements or img, hr etc
						if (children.length || /^(br|hr|input|img)$/i.test(node.nodeName)) {
							return;
						}
					}

					self.remove(node);
				}

				return node;
			}

			if (parentElm && splitElm) {
				// Get before chunk
				r.setStart(parentElm.parentNode, self.nodeIndex(parentElm));
				r.setEnd(splitElm.parentNode, self.nodeIndex(splitElm));
				bef = r.extractContents();

				// Get after chunk
				r = self.createRng();
				r.setStart(splitElm.parentNode, self.nodeIndex(splitElm) + 1);
				r.setEnd(parentElm.parentNode, self.nodeIndex(parentElm) + 1);
				aft = r.extractContents();

				// Insert before chunk
				pa = parentElm.parentNode;
				pa.insertBefore(trimNode(bef), parentElm);

				// Insert middle chunk
				if (replacementElm) {
					pa.replaceChild(replacementElm, splitElm);
				} else {
					pa.insertBefore(splitElm, parentElm);
				}

				// Insert after chunk
				pa.insertBefore(trimNode(aft), parentElm);
				self.remove(parentElm);

				return replacementElm || splitElm;
			}
		},

		/**
		 * Adds an event handler to the specified object.
		 *
		 * @method bind
		 * @param {Element/Document/Window/Array} target Target element to bind events to.
		 * handler to or an array of elements/ids/documents.
		 * @param {String} name Name of event handler to add, for example: click.
		 * @param {function} func Function to execute when the event occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 * @return {function} Function callback handler the same as the one passed in.
		 */
		bind: function(target, name, func, scope) {
			var self = this;

			if (Tools.isArray(target)) {
				var i = target.length;

				while (i--) {
					target[i] = self.bind(target[i], name, func, scope);
				}

				return target;
			}

			// Collect all window/document events bound by editor instance
			if (self.settings.collect && (target === self.doc || target === self.win)) {
				self.boundEvents.push([target, name, func, scope]);
			}

			return self.events.bind(target, name, func, scope || self);
		},

		/**
		 * Removes the specified event handler by name and function from an element or collection of elements.
		 *
		 * @method unbind
		 * @param {Element/Document/Window/Array} target Target element to unbind events on.
		 * @param {String} name Event handler name, for example: "click"
		 * @param {function} func Function to remove.
		 * @return {bool/Array} Bool state of true if the handler was removed, or an array of states if multiple input elements
		 * were passed in.
		 */
		unbind: function(target, name, func) {
			var self = this, i;

			if (Tools.isArray(target)) {
				i = target.length;

				while (i--) {
					target[i] = self.unbind(target[i], name, func);
				}

				return target;
			}

			// Remove any bound events matching the input
			if (self.boundEvents && (target === self.doc || target === self.win)) {
				i = self.boundEvents.length;

				while (i--) {
					var item = self.boundEvents[i];

					if (target == item[0] && (!name || name == item[1]) && (!func || func == item[2])) {
						this.events.unbind(item[0], item[1], item[2]);
					}
				}
			}

			return this.events.unbind(target, name, func);
		},

		/**
		 * Fires the specified event name with object on target.
		 *
		 * @method fire
		 * @param {Node/Document/Window} target Target element or object to fire event on.
		 * @param {String} name Name of the event to fire.
		 * @param {Object} evt Event object to send.
		 * @return {Event} Event object.
		 */
		fire: function(target, name, evt) {
			return this.events.fire(target, name, evt);
		},

		// Returns the content editable state of a node
		getContentEditable: function(node) {
			var contentEditable;

			// Check type
			if (node.nodeType != 1) {
				return null;
			}

			// Check for fake content editable
			contentEditable = node.getAttribute("data-mce-contenteditable");
			if (contentEditable && contentEditable !== "inherit") {
				return contentEditable;
			}

			// Check for real content editable
			return node.contentEditable !== "inherit" ? node.contentEditable : null;
		},

		/**
		 * Destroys all internal references to the DOM to solve IE leak issues.
		 *
		 * @method destroy
		 */
		destroy: function() {
			var self = this;

			// Unbind all events bound to window/document by editor instance
			if (self.boundEvents) {
				var i = self.boundEvents.length;

				while (i--) {
					var item = self.boundEvents[i];
					this.events.unbind(item[0], item[1], item[2]);
				}

				self.boundEvents = null;
			}

			// Restore sizzle document to window.document
			// Since the current document might be removed producing "Permission denied" on IE see #6325
			if (Sizzle.setDocument) {
				Sizzle.setDocument();
			}

			self.win = self.doc = self.root = self.events = self.frag = null;
		},

		// #ifdef debug

		dumpRng: function(r) {
			return (
				'startContainer: ' + r.startContainer.nodeName +
				', startOffset: ' + r.startOffset +
				', endContainer: ' + r.endContainer.nodeName +
				', endOffset: ' + r.endOffset
			);
		},

		// #endif

		_findSib: function(node, selector, name) {
			var self = this, func = selector;

			if (node) {
				// If expression make a function of it using is
				if (typeof(func) == 'string') {
					func = function(node) {
						return self.is(node, selector);
					};
				}

				// Loop all siblings
				for (node = node[name]; node; node = node[name]) {
					if (func(node)) {
						return node;
					}
				}
			}

			return null;
		}
	};

	/**
	 * Instance of DOMUtils for the current document.
	 *
	 * @static
	 * @property DOM
	 * @type tinymce.dom.DOMUtils
	 * @example
	 * // Example of how to add a class to some element by id
	 * tinymce.DOM.addClass('someid', 'someclass');
	 */
	DOMUtils.DOM = new DOMUtils(document);

	return DOMUtils;
});

// Included from: js/tinymce/classes/dom/ScriptLoader.js

/**
 * ScriptLoader.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*globals console*/

/**
 * This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks
 * when various items gets loaded. This class is useful to load external JavaScript files.
 *
 * @class tinymce.dom.ScriptLoader
 * @example
 * // Load a script from a specific URL using the global script loader
 * tinymce.ScriptLoader.load('somescript.js');
 *
 * // Load a script using a unique instance of the script loader
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.load('somescript.js');
 *
 * // Load multiple scripts
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.add('somescript1.js');
 * scriptLoader.add('somescript2.js');
 * scriptLoader.add('somescript3.js');
 *
 * scriptLoader.loadQueue(function() {
 *    alert('All scripts are now loaded.');
 * });
 */
define("tinymce/dom/ScriptLoader", [
	"tinymce/dom/DOMUtils",
	"tinymce/util/Tools"
], function(DOMUtils, Tools) {
	var DOM = DOMUtils.DOM;
	var each = Tools.each, grep = Tools.grep;

	function ScriptLoader() {
		var QUEUED = 0,
			LOADING = 1,
			LOADED = 2,
			states = {},
			queue = [],
			scriptLoadedCallbacks = {},
			queueLoadedCallbacks = [],
			loading = 0,
			undef;

		/**
		 * Loads a specific script directly without adding it to the load queue.
		 *
		 * @method load
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		function loadScript(url, callback) {
			var dom = DOM, elm, id;

			// Execute callback when script is loaded
			function done() {
				dom.remove(id);

				if (elm) {
					elm.onreadystatechange = elm.onload = elm = null;
				}

				callback();
			}

			function error() {
				// Report the error so it's easier for people to spot loading errors
				if (typeof(console) !== "undefined" && console.log) {
					console.log("Failed to load: " + url);
				}

				// We can't mark it as done if there is a load error since
				// A) We don't want to produce 404 errors on the server and
				// B) the onerror event won't fire on all browsers.
				// done();
			}

			id = dom.uniqueId();

			// Create new script element
			elm = document.createElement('script');
			elm.id = id;
			elm.type = 'text/javascript';
			elm.src = url;

			// Seems that onreadystatechange works better on IE 10 onload seems to fire incorrectly
			if ("onreadystatechange" in elm) {
				elm.onreadystatechange = function() {
					if (/loaded|complete/.test(elm.readyState)) {
						done();
					}
				};
			} else {
				elm.onload = done;
			}

			// Add onerror event will get fired on some browsers but not all of them
			elm.onerror = error;

			// Add script to document
			(document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
		}

		/**
		 * Returns true/false if a script has been loaded or not.
		 *
		 * @method isDone
		 * @param {String} url URL to check for.
		 * @return {Boolean} true/false if the URL is loaded.
		 */
		this.isDone = function(url) {
			return states[url] == LOADED;
		};

		/**
		 * Marks a specific script to be loaded. This can be useful if a script got loaded outside
		 * the script loader or to skip it from loading some script.
		 *
		 * @method markDone
		 * @param {string} u Absolute URL to the script to mark as loaded.
		 */
		this.markDone = function(url) {
			states[url] = LOADED;
		};

		/**
		 * Adds a specific script to the load queue of the script loader.
		 *
		 * @method add
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.add = this.load = function(url, callback, scope) {
			var state = states[url];

			// Add url to load queue
			if (state == undef) {
				queue.push(url);
				states[url] = QUEUED;
			}

			if (callback) {
				// Store away callback for later execution
				if (!scriptLoadedCallbacks[url]) {
					scriptLoadedCallbacks[url] = [];
				}

				scriptLoadedCallbacks[url].push({
					func: callback,
					scope: scope || this
				});
			}
		};

		/**
		 * Starts the loading of the queue.
		 *
		 * @method loadQueue
		 * @param {function} callback Optional callback to execute when all queued items are loaded.
		 * @param {Object} scope Optional scope to execute the callback in.
		 */
		this.loadQueue = function(callback, scope) {
			this.loadScripts(queue, callback, scope);
		};

		/**
		 * Loads the specified queue of files and executes the callback ones they are loaded.
		 * This method is generally not used outside this class but it might be useful in some scenarios.
		 *
		 * @method loadScripts
		 * @param {Array} scripts Array of queue items to load.
		 * @param {function} callback Optional callback to execute ones all items are loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.loadScripts = function(scripts, callback, scope) {
			var loadScripts;

			function execScriptLoadedCallbacks(url) {
				// Execute URL callback functions
				each(scriptLoadedCallbacks[url], function(callback) {
					callback.func.call(callback.scope);
				});

				scriptLoadedCallbacks[url] = undef;
			}

			queueLoadedCallbacks.push({
				func: callback,
				scope: scope || this
			});

			loadScripts = function() {
				var loadingScripts = grep(scripts);

				// Current scripts has been handled
				scripts.length = 0;

				// Load scripts that needs to be loaded
				each(loadingScripts, function(url) {
					// Script is already loaded then execute script callbacks directly
					if (states[url] == LOADED) {
						execScriptLoadedCallbacks(url);
						return;
					}

					// Is script not loading then start loading it
					if (states[url] != LOADING) {
						states[url] = LOADING;
						loading++;

						loadScript(url, function() {
							states[url] = LOADED;
							loading--;

							execScriptLoadedCallbacks(url);

							// Load more scripts if they where added by the recently loaded script
							loadScripts();
						});
					}
				});

				// No scripts are currently loading then execute all pending queue loaded callbacks
				if (!loading) {
					each(queueLoadedCallbacks, function(callback) {
						callback.func.call(callback.scope);
					});

					queueLoadedCallbacks.length = 0;
				}
			};

			loadScripts();
		};
	}

	ScriptLoader.ScriptLoader = new ScriptLoader();

	return ScriptLoader;
});

// Included from: js/tinymce/classes/AddOnManager.js

/**
 * AddOnManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the loading of themes/plugins or other add-ons and their language packs.
 *
 * @class tinymce.AddOnManager
 */
define("tinymce/AddOnManager", [
	"tinymce/dom/ScriptLoader",
	"tinymce/util/Tools"
], function(ScriptLoader, Tools) {
	var each = Tools.each;

	function AddOnManager() {
		var self = this;

		self.items = [];
		self.urls = {};
		self.lookup = {};
	}

	AddOnManager.prototype = {
		/**
		 * Returns the specified add on by the short name.
		 *
		 * @method get
		 * @param {String} name Add-on to look for.
		 * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
		 */
		get: function(name) {
			if (this.lookup[name]) {
				return this.lookup[name].instance;
			} else {
				return undefined;
			}
		},

		dependencies: function(name) {
			var result;

			if (this.lookup[name]) {
				result = this.lookup[name].dependencies;
			}

			return result || [];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @method requireLangPack
		 * @param {String} name Short name of the add-on.
		 * @param {String} languages Optional comma or space separated list of languages to check if it matches the name.
		 */
		requireLangPack: function(name, languages) {
			if (AddOnManager.language && AddOnManager.languageLoad !== false) {
				if (languages && new RegExp('([, ]|\\b)' + AddOnManager.language + '([, ]|\\b)').test(languages) === false) {
					return;
				}

				ScriptLoader.ScriptLoader.add(this.urls[name] + '/langs/' + AddOnManager.language + '.js');
			}
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
		 * @method add
		 * @param {String} id Short name/id for the add-on.
		 * @param {tinymce.Theme/tinymce.Plugin} addOn Theme or plugin to add.
		 * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
		 * @example
		 * // Create a simple plugin
		 * tinymce.create('tinymce.plugins.TestPlugin', {
		 *   TestPlugin: function(ed, url) {
		 *   ed.on('click', function(e) {
		 *      ed.windowManager.alert('Hello World!');
		 *   });
		 *   }
		 * });
		 *
		 * // Register plugin using the add method
		 * tinymce.PluginManager.add('test', tinymce.plugins.TestPlugin);
		 *
		 * // Initialize TinyMCE
		 * tinymce.init({
		 *  ...
		 *  plugins: '-test' // Init the plugin but don't try to load it
		 * });
		 */
		add: function(id, addOn, dependencies) {
			this.items.push(addOn);
			this.lookup[id] = {instance: addOn, dependencies: dependencies};

			return addOn;
		},

		createUrl: function(baseUrl, dep) {
			if (typeof dep === "object") {
				return dep;
			} else {
				return {prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix};
			}
		},

		/**
		 * Add a set of components that will make up the add-on. Using the url of the add-on name as the base url.
		 * This should be used in development mode.  A new compressor/javascript munger process will ensure that the
		 * components are put together into the plugin.js file and compressed correctly.
		 *
		 * @method addComponents
		 * @param {String} pluginName name of the plugin to load scripts from (will be used to get the base url for the plugins).
		 * @param {Array} scripts Array containing the names of the scripts to load.
		 */
		addComponents: function(pluginName, scripts) {
			var pluginUrl = this.urls[pluginName];

			each(scripts, function(script) {
				ScriptLoader.ScriptLoader.add(pluginUrl + "/" + script);
			});
		},

		/**
		 * Loads an add-on from a specific url.
		 *
		 * @method load
		 * @param {String} n Short name of the add-on that gets loaded.
		 * @param {String} u URL to the add-on that will get loaded.
		 * @param {function} cb Optional callback to execute ones the add-on is loaded.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Loads a plugin from an external URL
		 * tinymce.PluginManager.load('myplugin', '/some/dir/someplugin/plugin.js');
		 *
		 * // Initialize TinyMCE
		 * tinymce.init({
		 *  ...
		 *  plugins: '-myplugin' // Don't try to load it again
		 * });
		 */
		load: function(n, u, cb, s) {
			var t = this, url = u;

			function loadDependencies() {
				var dependencies = t.dependencies(n);

				each(dependencies, function(dep) {
					var newUrl = t.createUrl(u, dep);

					t.load(newUrl.resource, newUrl, undefined, undefined);
				});

				if (cb) {
					if (s) {
						cb.call(s);
					} else {
						cb.call(ScriptLoader);
					}
				}
			}

			if (t.urls[n]) {
				return;
			}

			if (typeof u === "object") {
				url = u.prefix + u.resource + u.suffix;
			}

			if (url.indexOf('/') !== 0 && url.indexOf('://') == -1) {
				url = AddOnManager.baseURL + '/' + url;
			}

			t.urls[n] = url.substring(0, url.lastIndexOf('/'));

			if (t.lookup[n]) {
				loadDependencies();
			} else {
				ScriptLoader.ScriptLoader.add(url, loadDependencies, s);
			}
		}
	};

	AddOnManager.PluginManager = new AddOnManager();
	AddOnManager.ThemeManager = new AddOnManager();

	return AddOnManager;
});

/**
 * TinyMCE theme class.
 *
 * @class tinymce.Theme
 */

/**
 * This method is responsible for rendering/generating the overall user interface with toolbars, buttons, iframe containers etc.
 *
 * @method renderUI
 * @param {Object} obj Object parameter containing the targetNode DOM node that will be replaced visually with an editor instance.
 * @return {Object} an object with items like iframeContainer, editorContainer, sizeContainer, deltaWidth, deltaHeight.
 */

/**
 * Plugin base class, this is a pseudo class that describes how a plugin is to be created for TinyMCE. The methods below are all optional.
 *
 * @class tinymce.Plugin
 * @example
 * tinymce.PluginManager.add('example', function(editor, url) {
 *     // Add a button that opens a window
 *     editor.addButton('example', {
 *         text: 'My button',
 *         icon: false,
 *         onclick: function() {
 *             // Open window
 *             editor.windowManager.open({
 *                 title: 'Example plugin',
 *                 body: [
 *                     {type: 'textbox', name: 'title', label: 'Title'}
 *                 ],
 *                 onsubmit: function(e) {
 *                     // Insert content when the window form is submitted
 *                     editor.insertContent('Title: ' + e.data.title);
 *                 }
 *             });
 *         }
 *     });
 *
 *     // Adds a menu item to the tools menu
 *     editor.addMenuItem('example', {
 *         text: 'Example plugin',
 *         context: 'tools',
 *         onclick: function() {
 *             // Open window with a specific url
 *             editor.windowManager.open({
 *                 title: 'TinyMCE site',
 *                 url: 'http://www.tinymce.com',
 *                 width: 800,
 *                 height: 600,
 *                 buttons: [{
 *                     text: 'Close',
 *                     onclick: 'close'
 *                 }]
 *             });
 *         }
 *     });
 * });
 */

// Included from: js/tinymce/classes/html/Node.js

/**
 * Node.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is a minimalistic implementation of a DOM like node used by the DomParser class.
 *
 * @example
 * var node = new tinymce.html.Node('strong', 1);
 * someRoot.append(node);
 *
 * @class tinymce.html.Node
 * @version 3.4
 */
define("tinymce/html/Node", [], function() {
	var whiteSpaceRegExp = /^[ \t\r\n]*$/, typeLookup = {
		'#text': 3,
		'#comment': 8,
		'#cdata': 4,
		'#pi': 7,
		'#doctype': 10,
		'#document-fragment': 11
	};

	// Walks the tree left/right
	function walk(node, root_node, prev) {
		var sibling, parent, startName = prev ? 'lastChild' : 'firstChild', siblingName = prev ? 'prev' : 'next';

		// Walk into nodes if it has a start
		if (node[startName]) {
			return node[startName];
		}

		// Return the sibling if it has one
		if (node !== root_node) {
			sibling = node[siblingName];

			if (sibling) {
				return sibling;
			}

			// Walk up the parents to look for siblings
			for (parent = node.parent; parent && parent !== root_node; parent = parent.parent) {
				sibling = parent[siblingName];

				if (sibling) {
					return sibling;
				}
			}
		}
	}

	/**
	 * Constructs a new Node instance.
	 *
	 * @constructor
	 * @method Node
	 * @param {String} name Name of the node type.
	 * @param {Number} type Numeric type representing the node.
	 */
	function Node(name, type) {
		this.name = name;
		this.type = type;

		if (type === 1) {
			this.attributes = [];
			this.attributes.map = {};
		}
	}

	Node.prototype = {
		/**
		 * Replaces the current node with the specified one.
		 *
		 * @example
		 * someNode.replace(someNewNode);
		 *
		 * @method replace
		 * @param {tinymce.html.Node} node Node to replace the current node with.
		 * @return {tinymce.html.Node} The old node that got replaced.
		 */
		replace: function(node) {
			var self = this;

			if (node.parent) {
				node.remove();
			}

			self.insert(node, self);
			self.remove();

			return self;
		},

		/**
		 * Gets/sets or removes an attribute by name.
		 *
		 * @example
		 * someNode.attr("name", "value"); // Sets an attribute
		 * console.log(someNode.attr("name")); // Gets an attribute
		 * someNode.attr("name", null); // Removes an attribute
		 *
		 * @method attr
		 * @param {String} name Attribute name to set or get.
		 * @param {String} value Optional value to set.
		 * @return {String/tinymce.html.Node} String or undefined on a get operation or the current node on a set operation.
		 */
		attr: function(name, value) {
			var self = this, attrs, i, undef;

			if (typeof name !== "string") {
				for (i in name) {
					self.attr(i, name[i]);
				}

				return self;
			}

			if ((attrs = self.attributes)) {
				if (value !== undef) {
					// Remove attribute
					if (value === null) {
						if (name in attrs.map) {
							delete attrs.map[name];

							i = attrs.length;
							while (i--) {
								if (attrs[i].name === name) {
									attrs = attrs.splice(i, 1);
									return self;
								}
							}
						}

						return self;
					}

					// Set attribute
					if (name in attrs.map) {
						// Set attribute
						i = attrs.length;
						while (i--) {
							if (attrs[i].name === name) {
								attrs[i].value = value;
								break;
							}
						}
					} else {
						attrs.push({name: name, value: value});
					}

					attrs.map[name] = value;

					return self;
				} else {
					return attrs.map[name];
				}
			}
		},

		/**
		 * Does a shallow clones the node into a new node. It will also exclude id attributes since
		 * there should only be one id per document.
		 *
		 * @example
		 * var clonedNode = node.clone();
		 *
		 * @method clone
		 * @return {tinymce.html.Node} New copy of the original node.
		 */
		clone: function() {
			var self = this, clone = new Node(self.name, self.type), i, l, selfAttrs, selfAttr, cloneAttrs;

			// Clone element attributes
			if ((selfAttrs = self.attributes)) {
				cloneAttrs = [];
				cloneAttrs.map = {};

				for (i = 0, l = selfAttrs.length; i < l; i++) {
					selfAttr = selfAttrs[i];

					// Clone everything except id
					if (selfAttr.name !== 'id') {
						cloneAttrs[cloneAttrs.length] = {name: selfAttr.name, value: selfAttr.value};
						cloneAttrs.map[selfAttr.name] = selfAttr.value;
					}
				}

				clone.attributes = cloneAttrs;
			}

			clone.value = self.value;
			clone.shortEnded = self.shortEnded;

			return clone;
		},

		/**
		 * Wraps the node in in another node.
		 *
		 * @example
		 * node.wrap(wrapperNode);
		 *
		 * @method wrap
		 */
		wrap: function(wrapper) {
			var self = this;

			self.parent.insert(wrapper, self);
			wrapper.append(self);

			return self;
		},

		/**
		 * Unwraps the node in other words it removes the node but keeps the children.
		 *
		 * @example
		 * node.unwrap();
		 *
		 * @method unwrap
		 */
		unwrap: function() {
			var self = this, node, next;

			for (node = self.firstChild; node; ) {
				next = node.next;
				self.insert(node, self, true);
				node = next;
			}

			self.remove();
		},

		/**
		 * Removes the node from it's parent.
		 *
		 * @example
		 * node.remove();
		 *
		 * @method remove
		 * @return {tinymce.html.Node} Current node that got removed.
		 */
		remove: function() {
			var self = this, parent = self.parent, next = self.next, prev = self.prev;

			if (parent) {
				if (parent.firstChild === self) {
					parent.firstChild = next;

					if (next) {
						next.prev = null;
					}
				} else {
					prev.next = next;
				}

				if (parent.lastChild === self) {
					parent.lastChild = prev;

					if (prev) {
						prev.next = null;
					}
				} else {
					next.prev = prev;
				}

				self.parent = self.next = self.prev = null;
			}

			return self;
		},

		/**
		 * Appends a new node as a child of the current node.
		 *
		 * @example
		 * node.append(someNode);
		 *
		 * @method append
		 * @param {tinymce.html.Node} node Node to append as a child of the current one.
		 * @return {tinymce.html.Node} The node that got appended.
		 */
		append: function(node) {
			var self = this, last;

			if (node.parent) {
				node.remove();
			}

			last = self.lastChild;
			if (last) {
				last.next = node;
				node.prev = last;
				self.lastChild = node;
			} else {
				self.lastChild = self.firstChild = node;
			}

			node.parent = self;

			return node;
		},

		/**
		 * Inserts a node at a specific position as a child of the current node.
		 *
		 * @example
		 * parentNode.insert(newChildNode, oldChildNode);
		 *
		 * @method insert
		 * @param {tinymce.html.Node} node Node to insert as a child of the current node.
		 * @param {tinymce.html.Node} ref_node Reference node to set node before/after.
		 * @param {Boolean} before Optional state to insert the node before the reference node.
		 * @return {tinymce.html.Node} The node that got inserted.
		 */
		insert: function(node, ref_node, before) {
			var parent;

			if (node.parent) {
				node.remove();
			}

			parent = ref_node.parent || this;

			if (before) {
				if (ref_node === parent.firstChild) {
					parent.firstChild = node;
				} else {
					ref_node.prev.next = node;
				}

				node.prev = ref_node.prev;
				node.next = ref_node;
				ref_node.prev = node;
			} else {
				if (ref_node === parent.lastChild) {
					parent.lastChild = node;
				} else {
					ref_node.next.prev = node;
				}

				node.next = ref_node.next;
				node.prev = ref_node;
				ref_node.next = node;
			}

			node.parent = parent;

			return node;
		},

		/**
		 * Get all children by name.
		 *
		 * @method getAll
		 * @param {String} name Name of the child nodes to collect.
		 * @return {Array} Array with child nodes matchin the specified name.
		 */
		getAll: function(name) {
			var self = this, node, collection = [];

			for (node = self.firstChild; node; node = walk(node, self)) {
				if (node.name === name) {
					collection.push(node);
				}
			}

			return collection;
		},

		/**
		 * Removes all children of the current node.
		 *
		 * @method empty
		 * @return {tinymce.html.Node} The current node that got cleared.
		 */
		empty: function() {
			var self = this, nodes, i, node;

			// Remove all children
			if (self.firstChild) {
				nodes = [];

				// Collect the children
				for (node = self.firstChild; node; node = walk(node, self)) {
					nodes.push(node);
				}

				// Remove the children
				i = nodes.length;
				while (i--) {
					node = nodes[i];
					node.parent = node.firstChild = node.lastChild = node.next = node.prev = null;
				}
			}

			self.firstChild = self.lastChild = null;

			return self;
		},

		/**
		 * Returns true/false if the node is to be considered empty or not.
		 *
		 * @example
		 * node.isEmpty({img: true});
		 * @method isEmpty
		 * @param {Object} elements Name/value object with elements that are automatically treated as non empty elements.
		 * @return {Boolean} true/false if the node is empty or not.
		 */
		isEmpty: function(elements) {
			var self = this, node = self.firstChild, i, name;

			if (node) {
				do {
					if (node.type === 1) {
						// Ignore bogus elements
						if (node.attributes.map['data-mce-bogus']) {
							continue;
						}

						// Keep empty elements like <img />
						if (elements[node.name]) {
							return false;
						}

						// Keep elements with data attributes or name attribute like <a name="1"></a>
						i = node.attributes.length;
						while (i--) {
							name = node.attributes[i].name;
							if (name === "name" || name.indexOf('data-mce-') === 0) {
								return false;
							}
						}
					}

					// Keep comments
					if (node.type === 8) {
						return false;
					}

					// Keep non whitespace text nodes
					if ((node.type === 3 && !whiteSpaceRegExp.test(node.value))) {
						return false;
					}
				} while ((node = walk(node, self)));
			}

			return true;
		},

		/**
		 * Walks to the next or previous node and returns that node or null if it wasn't found.
		 *
		 * @method walk
		 * @param {Boolean} prev Optional previous node state defaults to false.
		 * @return {tinymce.html.Node} Node that is next to or previous of the current node.
		 */
		walk: function(prev) {
			return walk(this, null, prev);
		}
	};

	/**
	 * Creates a node of a specific type.
	 *
	 * @static
	 * @method create
	 * @param {String} name Name of the node type to create for example "b" or "#text".
	 * @param {Object} attrs Name/value collection of attributes that will be applied to elements.
	 */
	Node.create = function(name, attrs) {
		var node, attrName;

		// Create node
		node = new Node(name, typeLookup[name] || 1);

		// Add attributes if needed
		if (attrs) {
			for (attrName in attrs) {
				node.attr(attrName, attrs[attrName]);
			}
		}

		return node;
	};

	return Node;
});

// Included from: js/tinymce/classes/html/Schema.js

/**
 * Schema.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Schema validator class.
 *
 * @class tinymce.html.Schema
 * @example
 *  if (tinymce.activeEditor.schema.isValidChild('p', 'span'))
 *    alert('span is valid child of p.');
 *
 *  if (tinymce.activeEditor.schema.getElementRule('p'))
 *    alert('P is a valid element.');
 *
 * @class tinymce.html.Schema
 * @version 3.4
 */
define("tinymce/html/Schema", [
	"tinymce/util/Tools"
], function(Tools) {
	var mapCache = {};
	var makeMap = Tools.makeMap, each = Tools.each, extend = Tools.extend, explode = Tools.explode, inArray = Tools.inArray;

	function split(items, delim) {
		return items ? items.split(delim || ' ') : [];
	}

	/**
	 * Builds a schema lookup table
	 *
	 * @private
	 * @param {String} type html4, html5 or html5-strict schema type.
	 * @return {Object} Schema lookup table.
	 */
	function compileSchema(type) {
		var schema = {}, globalAttributes, eventAttributes, blockContent;
		var phrasingContent, flowContent, html4BlockContent, html4PhrasingContent;

		function add(name, attributes, children) {
			var ni, i, attributesOrder, args = arguments;

			function arrayToMap(array) {
				var map = {}, i, l;

				for (i = 0, l = array.length; i < l; i++) {
					map[array[i]] = {};
				}

				return map;
			}

			children = children || [];
			attributes = attributes || "";

			if (typeof(children) === "string") {
				children = split(children);
			}

			// Split string children
			for (i = 3; i < args.length; i++) {
				if (typeof(args[i]) === "string") {
					args[i] = split(args[i]);
				}

				children.push.apply(children, args[i]);
			}

			name = split(name);
			ni = name.length;
			while (ni--) {
				attributesOrder = [].concat(globalAttributes, split(attributes));
				schema[name[ni]] = {
					attributes: arrayToMap(attributesOrder),
					attributesOrder: attributesOrder,
					children: arrayToMap(children)
				};
			}
		}

		function addAttrs(name, attributes) {
			var ni, schemaItem, i, l;

			name = split(name);
			ni = name.length;
			attributes = split(attributes);
			while (ni--) {
				schemaItem = schema[name[ni]];
				for (i = 0, l = attributes.length; i < l; i++) {
					schemaItem.attributes[attributes[i]] = {};
					schemaItem.attributesOrder.push(attributes[i]);
				}
			}
		}

		// Use cached schema
		if (mapCache[type]) {
			return mapCache[type];
		}

		// Attributes present on all elements
		globalAttributes = split("id accesskey class dir lang style tabindex title");

		// Event attributes can be opt-in/opt-out
		eventAttributes = split("onabort onblur oncancel oncanplay oncanplaythrough onchange onclick onclose oncontextmenu oncuechange " +
				"ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended " +
				"onerror onfocus oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart " +
				"onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onpause onplay onplaying onprogress onratechange " +
				"onreset onscroll onseeked onseeking onseeking onselect onshow onstalled onsubmit onsuspend ontimeupdate onvolumechange " +
				"onwaiting"
		);

		// Block content elements
		blockContent = split(
			"address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul"
		);

		// Phrasing content elements from the HTML5 spec (inline)
		phrasingContent = split(
			"a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd " +
			"label map noscript object q s samp script select small span strong sub sup " +
			"textarea u var #text #comment"
		);

		// Add HTML5 items to globalAttributes, blockContent, phrasingContent
		if (type != "html4") {
			globalAttributes.push.apply(globalAttributes, split("contenteditable contextmenu draggable dropzone " +
				"hidden spellcheck translate"));
			blockContent.push.apply(blockContent, split("article aside details dialog figure header footer hgroup section nav"));
			phrasingContent.push.apply(phrasingContent, split("audio canvas command datalist mark meter output progress time wbr " +
				"video ruby bdi keygen"));
		}

		// Add HTML4 elements unless it's html5-strict
		if (type != "html5-strict") {
			globalAttributes.push("xml:lang");

			html4PhrasingContent = split("acronym applet basefont big font strike tt");
			phrasingContent.push.apply(phrasingContent, html4PhrasingContent);

			each(html4PhrasingContent, function(name) {
				add(name, "", phrasingContent);
			});

			html4BlockContent = split("center dir isindex noframes");
			blockContent.push.apply(blockContent, html4BlockContent);

			// Flow content elements from the HTML5 spec (block+inline)
			flowContent = [].concat(blockContent, phrasingContent);

			each(html4BlockContent, function(name) {
				add(name, "", flowContent);
			});
		}

		// Flow content elements from the HTML5 spec (block+inline)
		flowContent = flowContent || [].concat(blockContent, phrasingContent);

		// HTML4 base schema TODO: Move HTML5 specific attributes to HTML5 specific if statement
		// Schema items <element name>, <specific attributes>, <children ..>
		add("html", "manifest", "head body");
		add("head", "", "base command link meta noscript script style title");
		add("title hr noscript br");
		add("base", "href target");
		add("link", "href rel media hreflang type sizes hreflang");
		add("meta", "name http-equiv content charset");
		add("style", "media type scoped");
		add("script", "src async defer type charset");
		add("body", "onafterprint onbeforeprint onbeforeunload onblur onerror onfocus " +
				"onhashchange onload onmessage onoffline ononline onpagehide onpageshow " +
				"onpopstate onresize onscroll onstorage onunload", flowContent);
		add("address dt dd div caption", "", flowContent);
		add("h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn", "", phrasingContent);
		add("blockquote", "cite", flowContent);
		add("ol", "reversed start type", "li");
		add("ul", "", "li");
		add("li", "value", flowContent);
		add("dl", "", "dt dd");
		add("a", "href target rel media hreflang type", phrasingContent);
		add("q", "cite", phrasingContent);
		add("ins del", "cite datetime", flowContent);
		add("img", "src alt usemap ismap width height");
		add("iframe", "src name width height", flowContent);
		add("embed", "src type width height");
		add("object", "data type typemustmatch name usemap form width height", flowContent, "param");
		add("param", "name value");
		add("map", "name", flowContent, "area");
		add("area", "alt coords shape href target rel media hreflang type");
		add("table", "border", "caption colgroup thead tfoot tbody tr" + (type == "html4" ? " col" : ""));
		add("colgroup", "span", "col");
		add("col", "span");
		add("tbody thead tfoot", "", "tr");
		add("tr", "", "td th");
		add("td", "colspan rowspan headers", flowContent);
		add("th", "colspan rowspan headers scope abbr", flowContent);
		add("form", "accept-charset action autocomplete enctype method name novalidate target", flowContent);
		add("fieldset", "disabled form name", flowContent, "legend");
		add("label", "form for", phrasingContent);
		add("input", "accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate " +
				"formtarget height list max maxlength min multiple name pattern readonly required size src step type value width"
		);
		add("button", "disabled form formaction formenctype formmethod formnovalidate formtarget name type value",
			type == "html4" ? flowContent : phrasingContent);
		add("select", "disabled form multiple name required size", "option optgroup");
		add("optgroup", "disabled label", "option");
		add("option", "disabled label selected value");
		add("textarea", "cols dirname disabled form maxlength name readonly required rows wrap");
		add("menu", "type label", flowContent, "li");
		add("noscript", "", flowContent);

		// Extend with HTML5 elements
		if (type != "html4") {
			add("wbr");
			add("ruby", "", phrasingContent, "rt rp");
			add("figcaption", "", flowContent);
			add("mark rt rp summary bdi", "", phrasingContent);
			add("canvas", "width height", flowContent);
			add("video", "src crossorigin poster preload autoplay mediagroup loop " +
				"muted controls width height", flowContent, "track source");
			add("audio", "src crossorigin preload autoplay mediagroup loop muted controls", flowContent, "track source");
			add("source", "src type media");
			add("track", "kind src srclang label default");
			add("datalist", "", phrasingContent, "option");
			add("article section nav aside header footer", "", flowContent);
			add("hgroup", "", "h1 h2 h3 h4 h5 h6");
			add("figure", "", flowContent, "figcaption");
			add("time", "datetime", phrasingContent);
			add("dialog", "open", flowContent);
			add("command", "type label icon disabled checked radiogroup command");
			add("output", "for form name", phrasingContent);
			add("progress", "value max", phrasingContent);
			add("meter", "value min max low high optimum", phrasingContent);
			add("details", "open", flowContent, "summary");
			add("keygen", "autofocus challenge disabled form keytype name");
		}

		// Extend with HTML4 attributes unless it's html5-strict
		if (type != "html5-strict") {
			addAttrs("script", "language xml:space");
			addAttrs("style", "xml:space");
			addAttrs("object", "declare classid codebase codetype archive standby align border hspace vspace");
			addAttrs("param", "valuetype type");
			addAttrs("a", "charset name rev shape coords");
			addAttrs("br", "clear");
			addAttrs("applet", "codebase archive code object alt name width height align hspace vspace");
			addAttrs("img", "name longdesc align border hspace vspace");
			addAttrs("iframe", "longdesc frameborder marginwidth marginheight scrolling align");
			addAttrs("font basefont", "size color face");
			addAttrs("input", "usemap align");
			addAttrs("select", "onchange");
			addAttrs("textarea");
			addAttrs("h1 h2 h3 h4 h5 h6 div p legend caption", "align");
			addAttrs("ul", "type compact");
			addAttrs("li", "type");
			addAttrs("ol dl menu dir", "compact");
			addAttrs("pre", "width xml:space");
			addAttrs("hr", "align noshade size width");
			addAttrs("isindex", "prompt");
			addAttrs("table", "summary width frame rules cellspacing cellpadding align bgcolor");
			addAttrs("col", "width align char charoff valign");
			addAttrs("colgroup", "width align char charoff valign");
			addAttrs("thead", "align char charoff valign");
			addAttrs("tr", "align char charoff valign bgcolor");
			addAttrs("th", "axis align char charoff valign nowrap bgcolor width height");
			addAttrs("form", "accept");
			addAttrs("td", "abbr axis scope align char charoff valign nowrap bgcolor width height");
			addAttrs("tfoot", "align char charoff valign");
			addAttrs("tbody", "align char charoff valign");
			addAttrs("area", "nohref");
			addAttrs("body", "background bgcolor text link vlink alink");
		}

		// Extend with HTML5 attributes unless it's html4
		if (type != "html4") {
			addAttrs("input button select textarea", "autofocus");
			addAttrs("input textarea", "placeholder");
			addAttrs("a", "download");
			addAttrs("link script img", "crossorigin");
			addAttrs("iframe", "srcdoc sandbox seamless allowfullscreen");
		}

		// Special: iframe, ruby, video, audio, label

		// Delete children of the same name from it's parent
		// For example: form can't have a child of the name form
		each(split('a form meter progress dfn'), function(name) {
			if (schema[name]) {
				delete schema[name].children[name];
			}
		});

		// Delete header, footer, sectioning and heading content descendants
		/*each('dt th address', function(name) {
			delete schema[name].children[name];
		});*/

		// Caption can't have tables
		delete schema.caption.children.table;

		// TODO: LI:s can only have value if parent is OL

		// TODO: Handle transparent elements
		// a ins del canvas map

		mapCache[type] = schema;

		return schema;
	}

	/**
	 * Constructs a new Schema instance.
	 *
	 * @constructor
	 * @method Schema
	 * @param {Object} settings Name/value settings object.
	 */
	return function(settings) {
		var self = this, elements = {}, children = {}, patternElements = [], validStyles, schemaItems;
		var whiteSpaceElementsMap, selfClosingElementsMap, shortEndedElementsMap, boolAttrMap;
		var blockElementsMap, nonEmptyElementsMap, textBlockElementsMap, customElementsMap = {}, specialElements = {};

		// Creates an lookup table map object for the specified option or the default value
		function createLookupTable(option, default_value, extendWith) {
			var value = settings[option];

			if (!value) {
				// Get cached default map or make it if needed
				value = mapCache[option];

				if (!value) {
					value = makeMap(default_value, ' ', makeMap(default_value.toUpperCase(), ' '));
					value = extend(value, extendWith);

					mapCache[option] = value;
				}
			} else {
				// Create custom map
				value = makeMap(value, ',', makeMap(value.toUpperCase(), ' '));
			}

			return value;
		}

		settings = settings || {};
		schemaItems = compileSchema(settings.schema);

		// Allow all elements and attributes if verify_html is set to false
		if (settings.verify_html === false) {
			settings.valid_elements = '*[*]';
		}

		// Build styles list
		if (settings.valid_styles) {
			validStyles = {};

			// Convert styles into a rule list
			each(settings.valid_styles, function(value, key) {
				validStyles[key] = explode(value);
			});
		}

		// Setup map objects
		whiteSpaceElementsMap = createLookupTable('whitespace_elements', 'pre script noscript style textarea video audio iframe object');
		selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
		shortEndedElementsMap = createLookupTable('short_ended_elements', 'area base basefont br col frame hr img input isindex link ' +
			'meta param embed source wbr track');
		boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' +
			'noshade nowrap readonly selected autoplay loop controls');
		nonEmptyElementsMap = createLookupTable('non_empty_elements', 'td th iframe video audio object script', shortEndedElementsMap);
		textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' +
						'blockquote center dir fieldset header footer article section hgroup aside nav figure');
		blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' +
						'th tr td li ol ul caption dl dt dd noscript menu isindex option ' +
						'datalist select optgroup', textBlockElementsMap);

		each((settings.special || 'script noscript style textarea').split(' '), function(name) {
			specialElements[name] = new RegExp('<\/' + name + '[^>]*>','gi');
		});

		// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
		function patternToRegExp(str) {
			return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
		}

		// Parses the specified valid_elements string and adds to the current rules
		// This function is a bit hard to read since it's heavily optimized for speed
		function addValidElements(valid_elements) {
			var ei, el, ai, al, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder,
				prefix, outputName, globalAttributes, globalAttributesOrder, key, value,
				elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/,
				attrRuleRegExp = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
				hasPatternsRegExp = /[*?+]/;

			if (valid_elements) {
				// Split valid elements into an array with rules
				valid_elements = split(valid_elements, ',');

				if (elements['@']) {
					globalAttributes = elements['@'].attributes;
					globalAttributesOrder = elements['@'].attributesOrder;
				}

				// Loop all rules
				for (ei = 0, el = valid_elements.length; ei < el; ei++) {
					// Parse element rule
					matches = elementRuleRegExp.exec(valid_elements[ei]);
					if (matches) {
						// Setup local names for matches
						prefix = matches[1];
						elementName = matches[2];
						outputName = matches[3];
						attrData = matches[5];

						// Create new attributes and attributesOrder
						attributes = {};
						attributesOrder = [];

						// Create the new element
						element = {
							attributes: attributes,
							attributesOrder: attributesOrder
						};

						// Padd empty elements prefix
						if (prefix === '#') {
							element.paddEmpty = true;
						}

						// Remove empty elements prefix
						if (prefix === '-') {
							element.removeEmpty = true;
						}

						if (matches[4] === '!') {
							element.removeEmptyAttrs = true;
						}

						// Copy attributes from global rule into current rule
						if (globalAttributes) {
							for (key in globalAttributes) {
								attributes[key] = globalAttributes[key];
							}

							attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
						}

						// Attributes defined
						if (attrData) {
							attrData = split(attrData, '|');
							for (ai = 0, al = attrData.length; ai < al; ai++) {
								matches = attrRuleRegExp.exec(attrData[ai]);
								if (matches) {
									attr = {};
									attrType = matches[1];
									attrName = matches[2].replace(/::/g, ':');
									prefix = matches[3];
									value = matches[4];

									// Required
									if (attrType === '!') {
										element.attributesRequired = element.attributesRequired || [];
										element.attributesRequired.push(attrName);
										attr.required = true;
									}

									// Denied from global
									if (attrType === '-') {
										delete attributes[attrName];
										attributesOrder.splice(inArray(attributesOrder, attrName), 1);
										continue;
									}

									// Default value
									if (prefix) {
										// Default value
										if (prefix === '=') {
											element.attributesDefault = element.attributesDefault || [];
											element.attributesDefault.push({name: attrName, value: value});
											attr.defaultValue = value;
										}

										// Forced value
										if (prefix === ':') {
											element.attributesForced = element.attributesForced || [];
											element.attributesForced.push({name: attrName, value: value});
											attr.forcedValue = value;
										}

										// Required values
										if (prefix === '<') {
											attr.validValues = makeMap(value, '?');
										}
									}

									// Check for attribute patterns
									if (hasPatternsRegExp.test(attrName)) {
										element.attributePatterns = element.attributePatterns || [];
										attr.pattern = patternToRegExp(attrName);
										element.attributePatterns.push(attr);
									} else {
										// Add attribute to order list if it doesn't already exist
										if (!attributes[attrName]) {
											attributesOrder.push(attrName);
										}

										attributes[attrName] = attr;
									}
								}
							}
						}

						// Global rule, store away these for later usage
						if (!globalAttributes && elementName == '@') {
							globalAttributes = attributes;
							globalAttributesOrder = attributesOrder;
						}

						// Handle substitute elements such as b/strong
						if (outputName) {
							element.outputName = elementName;
							elements[outputName] = element;
						}

						// Add pattern or exact element
						if (hasPatternsRegExp.test(elementName)) {
							element.pattern = patternToRegExp(elementName);
							patternElements.push(element);
						} else {
							elements[elementName] = element;
						}
					}
				}
			}
		}

		function setValidElements(valid_elements) {
			elements = {};
			patternElements = [];

			addValidElements(valid_elements);

			each(schemaItems, function(element, name) {
				children[name] = element.children;
			});
		}

		// Adds custom non HTML elements to the schema
		function addCustomElements(custom_elements) {
			var customElementRegExp = /^(~)?(.+)$/;

			if (custom_elements) {
				each(split(custom_elements, ','), function(rule) {
					var matches = customElementRegExp.exec(rule),
						inline = matches[1] === '~',
						cloneName = inline ? 'span' : 'div',
						name = matches[2];

					children[name] = children[cloneName];
					customElementsMap[name] = cloneName;

					// If it's not marked as inline then add it to valid block elements
					if (!inline) {
						blockElementsMap[name.toUpperCase()] = {};
						blockElementsMap[name] = {};
					}

					// Add elements clone if needed
					if (!elements[name]) {
						var customRule = elements[cloneName];

						customRule = extend({}, customRule);
						delete customRule.removeEmptyAttrs;
						delete customRule.removeEmpty;

						elements[name] = customRule;
					}

					// Add custom elements at span/div positions
					each(children, function(element) {
						if (element[cloneName]) {
							element[name] = element[cloneName];
						}
					});
				});
			}
		}

		// Adds valid children to the schema object
		function addValidChildren(valid_children) {
			var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;

			if (valid_children) {
				each(split(valid_children, ','), function(rule) {
					var matches = childRuleRegExp.exec(rule), parent, prefix;

					if (matches) {
						prefix = matches[1];

						// Add/remove items from default
						if (prefix) {
							parent = children[matches[2]];
						} else {
							parent = children[matches[2]] = {'#comment': {}};
						}

						parent = children[matches[2]];

						each(split(matches[3], '|'), function(child) {
							if (prefix === '-') {
								delete parent[child];
							} else {
								parent[child] = {};
							}
						});
					}
				});
			}
		}

		function getElementRule(name) {
			var element = elements[name], i;

			// Exact match found
			if (element) {
				return element;
			}

			// No exact match then try the patterns
			i = patternElements.length;
			while (i--) {
				element = patternElements[i];

				if (element.pattern.test(name)) {
					return element;
				}
			}
		}

		if (!settings.valid_elements) {
			// No valid elements defined then clone the elements from the schema spec
			each(schemaItems, function(element, name) {
				elements[name] = {
					attributes: element.attributes,
					attributesOrder: element.attributesOrder
				};

				children[name] = element.children;
			});

			// Switch these on HTML4
			if (settings.schema != "html5") {
				each(split('strong/b em/i'), function(item) {
					item = split(item, '/');
					elements[item[1]].outputName = item[0];
				});
			}

			// Add default alt attribute for images
			elements.img.attributesDefault = [{name: 'alt', value: ''}];

			// Remove these if they are empty by default
			each(split('ol ul sub sup blockquote span font a table tbody tr strong em b i'), function(name) {
				if (elements[name]) {
					elements[name].removeEmpty = true;
				}
			});

			// Padd these by default
			each(split('p h1 h2 h3 h4 h5 h6 th td pre div address caption'), function(name) {
				elements[name].paddEmpty = true;
			});

			// Remove these if they have no attributes
			each(split('span'), function(name) {
				elements[name].removeEmptyAttrs = true;
			});

			// Remove these by default
			// TODO: Reenable in 4.1
			/*each(split('script style'), function(name) {
				delete elements[name];
			});*/
		} else {
			setValidElements(settings.valid_elements);
		}

		addCustomElements(settings.custom_elements);
		addValidChildren(settings.valid_children);
		addValidElements(settings.extended_valid_elements);

		// Todo: Remove this when we fix list handling to be valid
		addValidChildren('+ol[ul|ol],+ul[ul|ol]');

		// Delete invalid elements
		if (settings.invalid_elements) {
			each(explode(settings.invalid_elements), function(item) {
				if (elements[item]) {
					delete elements[item];
				}
			});
		}

		// If the user didn't allow span only allow internal spans
		if (!getElementRule('span')) {
			addValidElements('span[!data-mce-type|*]');
		}

		/**
		 * Name/value map object with valid parents and children to those parents.
		 *
		 * @example
		 * children = {
		 *    div:{p:{}, h1:{}}
		 * };
		 * @field children
		 * @type Object
		 */
		self.children = children;

		/**
		 * Name/value map object with valid styles for each element.
		 *
		 * @field styles
		 * @type Object
		 */
		self.styles = validStyles;

		/**
		 * Returns a map with boolean attributes.
		 *
		 * @method getBoolAttrs
		 * @return {Object} Name/value lookup map for boolean attributes.
		 */
		self.getBoolAttrs = function() {
			return boolAttrMap;
		};

		/**
		 * Returns a map with block elements.
		 *
		 * @method getBlockElements
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getBlockElements = function() {
			return blockElementsMap;
		};

		/**
		 * Returns a map with text block elements. Such as: p,h1-h6,div,address
		 *
		 * @method getTextBlockElements
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getTextBlockElements = function() {
			return textBlockElementsMap;
		};

		/**
		 * Returns a map with short ended elements such as BR or IMG.
		 *
		 * @method getShortEndedElements
		 * @return {Object} Name/value lookup map for short ended elements.
		 */
		self.getShortEndedElements = function() {
			return shortEndedElementsMap;
		};

		/**
		 * Returns a map with self closing tags such as <li>.
		 *
		 * @method getSelfClosingElements
		 * @return {Object} Name/value lookup map for self closing tags elements.
		 */
		self.getSelfClosingElements = function() {
			return selfClosingElementsMap;
		};

		/**
		 * Returns a map with elements that should be treated as contents regardless if it has text
		 * content in them or not such as TD, VIDEO or IMG.
		 *
		 * @method getNonEmptyElements
		 * @return {Object} Name/value lookup map for non empty elements.
		 */
		self.getNonEmptyElements = function() {
			return nonEmptyElementsMap;
		};

		/**
		 * Returns a map with elements where white space is to be preserved like PRE or SCRIPT.
		 *
		 * @method getWhiteSpaceElements
		 * @return {Object} Name/value lookup map for white space elements.
		 */
		self.getWhiteSpaceElements = function() {
			return whiteSpaceElementsMap;
		};

		/**
		 * Returns a map with special elements. These are elements that needs to be parsed
		 * in a special way such as script, style, textarea etc. The map object values
		 * are regexps used to find the end of the element.
		 *
		 * @method getSpecialElements
		 * @return {Object} Name/value lookup map for special elements.
		 */
		self.getSpecialElements = function() {
			return specialElements;
		};

		/**
		 * Returns true/false if the specified element and it's child is valid or not
		 * according to the schema.
		 *
		 * @method isValidChild
		 * @param {String} name Element name to check for.
		 * @param {String} child Element child to verify.
		 * @return {Boolean} True/false if the element is a valid child of the specified parent.
		 */
		self.isValidChild = function(name, child) {
			var parent = children[name];

			return !!(parent && parent[child]);
		};

		/**
		 * Returns true/false if the specified element name and optional attribute is
		 * valid according to the schema.
		 *
		 * @method isValid
		 * @param {String} name Name of element to check.
		 * @param {String} attr Optional attribute name to check for.
		 * @return {Boolean} True/false if the element and attribute is valid.
		 */
		self.isValid = function(name, attr) {
			var attrPatterns, i, rule = getElementRule(name);

			// Check if it's a valid element
			if (rule) {
				if (attr) {
					// Check if attribute name exists
					if (rule.attributes[attr]) {
						return true;
					}

					// Check if attribute matches a regexp pattern
					attrPatterns = rule.attributePatterns;
					if (attrPatterns) {
						i = attrPatterns.length;
						while (i--) {
							if (attrPatterns[i].pattern.test(name)) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			}

			// No match
			return false;
		};

		/**
		 * Returns true/false if the specified element is valid or not
		 * according to the schema.
		 *
		 * @method getElementRule
		 * @param {String} name Element name to check for.
		 * @return {Object} Element object or undefined if the element isn't valid.
		 */
		self.getElementRule = getElementRule;

		/**
		 * Returns an map object of all custom elements.
		 *
		 * @method getCustomElements
		 * @return {Object} Name/value map object of all custom elements.
		 */
		self.getCustomElements = function() {
			return customElementsMap;
		};

		/**
		 * Parses a valid elements string and adds it to the schema. The valid elements
		 * format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method addValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.addValidElements = addValidElements;

		/**
		 * Parses a valid elements string and sets it to the schema. The valid elements
		 * format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method setValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.setValidElements = setValidElements;

		/**
		 * Adds custom non HTML elements to the schema.
		 *
		 * @method addCustomElements
		 * @param {String} custom_elements Comma separated list of custom elements to add.
		 */
		self.addCustomElements = addCustomElements;

		/**
		 * Parses a valid children string and adds them to the schema structure. The valid children
		 * format is for example: "element[child1|child2]".
		 *
		 * @method addValidChildren
		 * @param {String} valid_children Valid children elements string to parse
		 */
		self.addValidChildren = addValidChildren;

		self.elements = elements;
	};
});

// Included from: js/tinymce/classes/html/SaxParser.js

/**
 * SaxParser.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class parses HTML code using pure JavaScript and executes various events for each item it finds. It will
 * always execute the events in the right order for tag soup code like <b><p></b></p>. It will also remove elements
 * and attributes that doesn't fit the schema if the validate setting is enabled.
 *
 * @example
 * var parser = new tinymce.html.SaxParser({
 *     validate: true,
 *
 *     comment: function(text) {
 *         console.log('Comment:', text);
 *     },
 *
 *     cdata: function(text) {
 *         console.log('CDATA:', text);
 *     },
 *
 *     text: function(text, raw) {
 *         console.log('Text:', text, 'Raw:', raw);
 *     },
 *
 *     start: function(name, attrs, empty) {
 *         console.log('Start:', name, attrs, empty);
 *     },
 *
 *     end: function(name) {
 *         console.log('End:', name);
 *     },
 *
 *     pi: function(name, text) {
 *         console.log('PI:', name, text);
 *     },
 *
 *     doctype: function(text) {
 *         console.log('DocType:', text);
 *     }
 * }, schema);
 * @class tinymce.html.SaxParser
 * @version 3.4
 */
define("tinymce/html/SaxParser", [
	"tinymce/html/Schema",
	"tinymce/html/Entities",
	"tinymce/util/Tools"
], function(Schema, Entities, Tools) {
	var each = Tools.each;

	/**
	 * Constructs a new SaxParser instance.
	 *
	 * @constructor
	 * @method SaxParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	return function(settings, schema) {
		var self = this, noop = function() {};

		settings = settings || {};
		self.schema = schema = schema || new Schema();

		if (settings.fix_self_closing !== false) {
			settings.fix_self_closing = true;
		}

		// Add handler functions from settings and setup default handlers
		each('comment cdata text start end pi doctype'.split(' '), function(name) {
			if (name) {
				self[name] = settings[name] || noop;
			}
		});

		/**
		 * Parses the specified HTML string and executes the callbacks for each item it finds.
		 *
		 * @example
		 * new SaxParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 */
		self.parse = function(html) {
			var self = this, matches, index = 0, value, endRegExp, stack = [], attrList, i, text, name;
			var isInternalElement, removeInternalElements, shortEndedElements, fillAttrsMap, isShortEnded;
			var validate, elementRule, isValidElement, attr, attribsValue, validAttributesMap, validAttributePatterns;
			var attributesRequired, attributesDefault, attributesForced;
			var anyAttributesRequired, selfClosing, tokenRegExp, attrRegExp, specialElements, attrValue, idCount = 0;
			var decode = Entities.decode, fixSelfClosing, filteredUrlAttrs = Tools.makeMap('src,href');
			var scriptUriRegExp = /(java|vb)script:/i;

			function processEndTag(name) {
				var pos, i;

				// Find position of parent of the same type
				pos = stack.length;
				while (pos--) {
					if (stack[pos].name === name) {
						break;
					}
				}

				// Found parent
				if (pos >= 0) {
					// Close all the open elements
					for (i = stack.length - 1; i >= pos; i--) {
						name = stack[i];

						if (name.valid) {
							self.end(name.name);
						}
					}

					// Remove the open elements from the stack
					stack.length = pos;
				}
			}

			function parseAttribute(match, name, value, val2, val3) {
				var attrRule, i, trimRegExp = /[\s\u0000-\u001F]+/g;

				name = name.toLowerCase();
				value = name in fillAttrsMap ? name : decode(value || val2 || val3 || ''); // Handle boolean attribute than value attribute

				// Validate name and value pass through all data- attributes
				if (validate && !isInternalElement && name.indexOf('data-') !== 0) {
					attrRule = validAttributesMap[name];

					// Find rule by pattern matching
					if (!attrRule && validAttributePatterns) {
						i = validAttributePatterns.length;
						while (i--) {
							attrRule = validAttributePatterns[i];
							if (attrRule.pattern.test(name)) {
								break;
							}
						}

						// No rule matched
						if (i === -1) {
							attrRule = null;
						}
					}

					// No attribute rule found
					if (!attrRule) {
						return;
					}

					// Validate value
					if (attrRule.validValues && !(value in attrRule.validValues)) {
						return;
					}
				}

				// Block any javascript: urls
				if (filteredUrlAttrs[name] && !settings.allow_script_urls) {
					var uri = value.replace(trimRegExp, '');

					try {
						// Might throw malformed URI sequence
						uri = decodeURIComponent(uri);
						if (scriptUriRegExp.test(uri)) {
							return;
						}
					} catch (ex) {
						// Fallback to non UTF-8 decoder
						uri = unescape(uri);
						if (scriptUriRegExp.test(uri)) {
							return;
						}
					}
				}

				// Add attribute to list and map
				attrList.map[name] = value;
				attrList.push({
					name: name,
					value: value
				});
			}

			// Precompile RegExps and map objects
			tokenRegExp = new RegExp('<(?:' +
				'(?:!--([\\w\\W]*?)-->)|' + // Comment
				'(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
				'(?:!DOCTYPE([\\w\\W]*?)>)|' + // DOCTYPE
				'(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + // PI
				'(?:\\/([^>]+)>)|' + // End element
				'(?:([A-Za-z0-9\\-\\:\\.]+)((?:\\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\\/|\\s+)>)' + // Start element
			')', 'g');

			attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g;

			// Setup lookup tables for empty elements and boolean attributes
			shortEndedElements = schema.getShortEndedElements();
			selfClosing = settings.self_closing_elements || schema.getSelfClosingElements();
			fillAttrsMap = schema.getBoolAttrs();
			validate = settings.validate;
			removeInternalElements = settings.remove_internals;
			fixSelfClosing = settings.fix_self_closing;
			specialElements = schema.getSpecialElements();

			while ((matches = tokenRegExp.exec(html))) {
				// Text
				if (index < matches.index) {
					self.text(decode(html.substr(index, matches.index - index)));
				}

				if ((value = matches[6])) { // End element
					value = value.toLowerCase();

					// IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
					if (value.charAt(0) === ':') {
						value = value.substr(1);
					}

					processEndTag(value);
				} else if ((value = matches[7])) { // Start element
					value = value.toLowerCase();

					// IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
					if (value.charAt(0) === ':') {
						value = value.substr(1);
					}

					isShortEnded = value in shortEndedElements;

					// Is self closing tag for example an <li> after an open <li>
					if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value) {
						processEndTag(value);
					}

					// Validate element
					if (!validate || (elementRule = schema.getElementRule(value))) {
						isValidElement = true;

						// Grab attributes map and patters when validation is enabled
						if (validate) {
							validAttributesMap = elementRule.attributes;
							validAttributePatterns = elementRule.attributePatterns;
						}

						// Parse attributes
						if ((attribsValue = matches[8])) {
							isInternalElement = attribsValue.indexOf('data-mce-type') !== -1; // Check if the element is an internal element

							// If the element has internal attributes then remove it if we are told to do so
							if (isInternalElement && removeInternalElements) {
								isValidElement = false;
							}

							attrList = [];
							attrList.map = {};

							attribsValue.replace(attrRegExp, parseAttribute);
						} else {
							attrList = [];
							attrList.map = {};
						}

						// Process attributes if validation is enabled
						if (validate && !isInternalElement) {
							attributesRequired = elementRule.attributesRequired;
							attributesDefault = elementRule.attributesDefault;
							attributesForced = elementRule.attributesForced;
							anyAttributesRequired = elementRule.removeEmptyAttrs;

							// Check if any attribute exists
							if (anyAttributesRequired && !attrList.length) {
								isValidElement = false;
							}

							// Handle forced attributes
							if (attributesForced) {
								i = attributesForced.length;
								while (i--) {
									attr = attributesForced[i];
									name = attr.name;
									attrValue = attr.value;

									if (attrValue === '{$uid}') {
										attrValue = 'mce_' + idCount++;
									}

									attrList.map[name] = attrValue;
									attrList.push({name: name, value: attrValue});
								}
							}

							// Handle default attributes
							if (attributesDefault) {
								i = attributesDefault.length;
								while (i--) {
									attr = attributesDefault[i];
									name = attr.name;

									if (!(name in attrList.map)) {
										attrValue = attr.value;

										if (attrValue === '{$uid}') {
											attrValue = 'mce_' + idCount++;
										}

										attrList.map[name] = attrValue;
										attrList.push({name: name, value: attrValue});
									}
								}
							}

							// Handle required attributes
							if (attributesRequired) {
								i = attributesRequired.length;
								while (i--) {
									if (attributesRequired[i] in attrList.map) {
										break;
									}
								}

								// None of the required attributes where found
								if (i === -1) {
									isValidElement = false;
								}
							}

							// Invalidate element if it's marked as bogus
							if (attrList.map['data-mce-bogus']) {
								isValidElement = false;
							}
						}

						if (isValidElement) {
							self.start(value, attrList, isShortEnded);
						}
					} else {
						isValidElement = false;
					}

					// Treat script, noscript and style a bit different since they may include code that looks like elements
					if ((endRegExp = specialElements[value])) {
						endRegExp.lastIndex = index = matches.index + matches[0].length;

						if ((matches = endRegExp.exec(html))) {
							if (isValidElement) {
								text = html.substr(index, matches.index - index);
							}

							index = matches.index + matches[0].length;
						} else {
							text = html.substr(index);
							index = html.length;
						}

						if (isValidElement) {
							if (text.length > 0) {
								self.text(text, true);
							}

							self.end(value);
						}

						tokenRegExp.lastIndex = index;
						continue;
					}

					// Push value on to stack
					if (!isShortEnded) {
						if (!attribsValue || attribsValue.indexOf('/') != attribsValue.length - 1) {
							stack.push({name: value, valid: isValidElement});
						} else if (isValidElement) {
							self.end(value);
						}
					}
				} else if ((value = matches[1])) { // Comment
					// Padd comment value to avoid browsers from parsing invalid comments as HTML
					if (value.charAt(0) === '>') {
						value = ' ' + value;
					}

					if (!settings.allow_conditional_comments && value.substr(0, 3) === '[if') {
						value = ' ' + value;
					}

					self.comment(value);
				} else if ((value = matches[2])) { // CDATA
					self.cdata(value);
				} else if ((value = matches[3])) { // DOCTYPE
					self.doctype(value);
				} else if ((value = matches[4])) { // PI
					self.pi(value, matches[5]);
				}

				index = matches.index + matches[0].length;
			}

			// Text
			if (index < html.length) {
				self.text(decode(html.substr(index)));
			}

			// Close any open elements
			for (i = stack.length - 1; i >= 0; i--) {
				value = stack[i];

				if (value.valid) {
					self.end(value.name);
				}
			}
		};
	};
});

// Included from: js/tinymce/classes/html/DomParser.js

/**
 * DomParser.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class parses HTML code into a DOM like structure of nodes it will remove redundant whitespace and make
 * sure that the node tree is valid according to the specified schema.
 * So for example: <p>a<p>b</p>c</p> will become <p>a</p><p>b</p><p>c</p>
 *
 * @example
 * var parser = new tinymce.html.DomParser({validate: true}, schema);
 * var rootNode = parser.parse('<h1>content</h1>');
 *
 * @class tinymce.html.DomParser
 * @version 3.4
 */
define("tinymce/html/DomParser", [
	"tinymce/html/Node",
	"tinymce/html/Schema",
	"tinymce/html/SaxParser",
	"tinymce/util/Tools"
], function(Node, Schema, SaxParser, Tools) {
	var makeMap = Tools.makeMap, each = Tools.each, explode = Tools.explode, extend = Tools.extend;

	/**
	 * Constructs a new DomParser instance.
	 *
	 * @constructor
	 * @method DomParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	return function(settings, schema) {
		var self = this, nodeFilters = {}, attributeFilters = [], matchedNodes = {}, matchedAttributes = {};

		settings = settings || {};
		settings.validate = "validate" in settings ? settings.validate : true;
		settings.root_name = settings.root_name || 'body';
		self.schema = schema = schema || new Schema();

		function fixInvalidChildren(nodes) {
			var ni, node, parent, parents, newParent, currentNode, tempNode, childNode, i;
			var nonEmptyElements, nonSplitableElements, textBlockElements, sibling, nextNode;

			nonSplitableElements = makeMap('tr,td,th,tbody,thead,tfoot,table');
			nonEmptyElements = schema.getNonEmptyElements();
			textBlockElements = schema.getTextBlockElements();

			for (ni = 0; ni < nodes.length; ni++) {
				node = nodes[ni];

				// Already removed or fixed
				if (!node.parent || node.fixed) {
					continue;
				}

				// If the invalid element is a text block and the text block is within a parent LI element
				// Then unwrap the first text block and convert other sibling text blocks to LI elements similar to Word/Open Office
				if (textBlockElements[node.name] && node.parent.name == 'li') {
					// Move sibling text blocks after LI element
					sibling = node.next;
					while (sibling) {
						if (textBlockElements[sibling.name]) {
							sibling.name = 'li';
							sibling.fixed = true;
							node.parent.insert(sibling, node.parent);
						} else {
							break;
						}

						sibling = sibling.next;
					}

					// Unwrap current text block
					node.unwrap(node);
					continue;
				}

				// Get list of all parent nodes until we find a valid parent to stick the child into
				parents = [node];
				for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) &&
					!nonSplitableElements[parent.name]; parent = parent.parent) {
					parents.push(parent);
				}

				// Found a suitable parent
				if (parent && parents.length > 1) {
					// Reverse the array since it makes looping easier
					parents.reverse();

					// Clone the related parent and insert that after the moved node
					newParent = currentNode = self.filterNode(parents[0].clone());

					// Start cloning and moving children on the left side of the target node
					for (i = 0; i < parents.length - 1; i++) {
						if (schema.isValidChild(currentNode.name, parents[i].name)) {
							tempNode = self.filterNode(parents[i].clone());
							currentNode.append(tempNode);
						} else {
							tempNode = currentNode;
						}

						for (childNode = parents[i].firstChild; childNode && childNode != parents[i + 1]; ) {
							nextNode = childNode.next;
							tempNode.append(childNode);
							childNode = nextNode;
						}

						currentNode = tempNode;
					}

					if (!newParent.isEmpty(nonEmptyElements)) {
						parent.insert(newParent, parents[0], true);
						parent.insert(node, newParent);
					} else {
						parent.insert(node, parents[0], true);
					}

					// Check if the element is empty by looking through it's contents and special treatment for <p><br /></p>
					parent = parents[0];
					if (parent.isEmpty(nonEmptyElements) || parent.firstChild === parent.lastChild && parent.firstChild.name === 'br') {
						parent.empty().remove();
					}
				} else if (node.parent) {
					// If it's an LI try to find a UL/OL for it or wrap it
					if (node.name === 'li') {
						sibling = node.prev;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.append(node);
							continue;
						}

						sibling = node.next;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.insert(node, sibling.firstChild, true);
							continue;
						}

						node.wrap(self.filterNode(new Node('ul', 1)));
						continue;
					}

					// Try wrapping the element in a DIV
					if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
						node.wrap(self.filterNode(new Node('div', 1)));
					} else {
						// We failed wrapping it, then remove or unwrap it
						if (node.name === 'style' || node.name === 'script') {
							node.empty().remove();
						} else {
							node.unwrap();
						}
					}
				}
			}
		}

		/**
		 * Runs the specified node though the element and attributes filters.
		 *
		 * @method filterNode
		 * @param {tinymce.html.Node} Node the node to run filters on.
		 * @return {tinymce.html.Node} The passed in node.
		 */
		self.filterNode = function(node) {
			var i, name, list;

			// Run element filters
			if (name in nodeFilters) {
				list = matchedNodes[name];

				if (list) {
					list.push(node);
				} else {
					matchedNodes[name] = [node];
				}
			}

			// Run attribute filters
			i = attributeFilters.length;
			while (i--) {
				name = attributeFilters[i].name;

				if (name in node.attributes.map) {
					list = matchedAttributes[name];

					if (list) {
						list.push(node);
					} else {
						matchedAttributes[name] = [node];
					}
				}
			}

			return node;
		};

		/**
		 * Adds a node filter function to the parser, the parser will collect the specified nodes by name
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addNodeFilter('p,h1', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addNodeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addNodeFilter = function(name, callback) {
			each(explode(name), function(name) {
				var list = nodeFilters[name];

				if (!list) {
					nodeFilters[name] = list = [];
				}

				list.push(callback);
			});
		};

		/**
		 * Adds a attribute filter function to the parser, the parser will collect nodes that has the specified attributes
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addAttributeFilter('src,href', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addAttributeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addAttributeFilter = function(name, callback) {
			each(explode(name), function(name) {
				var i;

				for (i = 0; i < attributeFilters.length; i++) {
					if (attributeFilters[i].name === name) {
						attributeFilters[i].callbacks.push(callback);
						return;
					}
				}

				attributeFilters.push({name: name, callbacks: [callback]});
			});
		};

		/**
		 * Parses the specified HTML string into a DOM like node tree and returns the result.
		 *
		 * @example
		 * var rootNode = new DomParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 * @param {Object} args Optional args object that gets passed to all filter functions.
		 * @return {tinymce.html.Node} Root node containing the tree.
		 */
		self.parse = function(html, args) {
			var parser, rootNode, node, nodes, i, l, fi, fl, list, name, validate;
			var blockElements, startWhiteSpaceRegExp, invalidChildren = [], isInWhiteSpacePreservedElement;
			var endWhiteSpaceRegExp, allWhiteSpaceRegExp, isAllWhiteSpaceRegExp, whiteSpaceElements;
			var children, nonEmptyElements, rootBlockName;

			args = args || {};
			matchedNodes = {};
			matchedAttributes = {};
			blockElements = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
			nonEmptyElements = schema.getNonEmptyElements();
			children = schema.children;
			validate = settings.validate;
			rootBlockName = "forced_root_block" in args ? args.forced_root_block : settings.forced_root_block;

			whiteSpaceElements = schema.getWhiteSpaceElements();
			startWhiteSpaceRegExp = /^[ \t\r\n]+/;
			endWhiteSpaceRegExp = /[ \t\r\n]+$/;
			allWhiteSpaceRegExp = /[ \t\r\n]+/g;
			isAllWhiteSpaceRegExp = /^[ \t\r\n]+$/;

			function addRootBlocks() {
				var node = rootNode.firstChild, next, rootBlockNode;

				// Removes whitespace at beginning and end of block so:
				// <p> x </p> -> <p>x</p>
				function trim(rootBlockNode) {
					if (rootBlockNode) {
						node = rootBlockNode.firstChild;
						if (node && node.type == 3) {
							node.value = node.value.replace(startWhiteSpaceRegExp, '');
						}

						node = rootBlockNode.lastChild;
						if (node && node.type == 3) {
							node.value = node.value.replace(endWhiteSpaceRegExp, '');
						}
					}
				}

				// Check if rootBlock is valid within rootNode for example if P is valid in H1 if H1 is the contentEditabe root
				if (!schema.isValidChild(rootNode.name, rootBlockName.toLowerCase())) {
					return;
				}

				while (node) {
					next = node.next;

					if (node.type == 3 || (node.type == 1 && node.name !== 'p' &&
						!blockElements[node.name] && !node.attr('data-mce-type'))) {
						if (!rootBlockNode) {
							// Create a new root block element
							rootBlockNode = createNode(rootBlockName, 1);
							rootBlockNode.attr(settings.forced_root_block_attrs);
							rootNode.insert(rootBlockNode, node);
							rootBlockNode.append(node);
						} else {
							rootBlockNode.append(node);
						}
					} else {
						trim(rootBlockNode);
						rootBlockNode = null;
					}

					node = next;
				}

				trim(rootBlockNode);
			}

			function createNode(name, type) {
				var node = new Node(name, type), list;

				if (name in nodeFilters) {
					list = matchedNodes[name];

					if (list) {
						list.push(node);
					} else {
						matchedNodes[name] = [node];
					}
				}

				return node;
			}

			function removeWhitespaceBefore(node) {
				var textNode, textVal, sibling;

				for (textNode = node.prev; textNode && textNode.type === 3; ) {
					textVal = textNode.value.replace(endWhiteSpaceRegExp, '');

					if (textVal.length > 0) {
						textNode.value = textVal;
						textNode = textNode.prev;
					} else {
						sibling = textNode.prev;
						textNode.remove();
						textNode = sibling;
					}
				}
			}

			function cloneAndExcludeBlocks(input) {
				var name, output = {};

				for (name in input) {
					if (name !== 'li' && name != 'p') {
						output[name] = input[name];
					}
				}

				return output;
			}

			parser = new SaxParser({
				validate: validate,
				allow_script_urls: settings.allow_script_urls,
				allow_conditional_comments: settings.allow_conditional_comments,

				// Exclude P and LI from DOM parsing since it's treated better by the DOM parser
				self_closing_elements: cloneAndExcludeBlocks(schema.getSelfClosingElements()),

				cdata: function(text) {
					node.append(createNode('#cdata', 4)).value = text;
				},

				text: function(text, raw) {
					var textNode;

					// Trim all redundant whitespace on non white space elements
					if (!isInWhiteSpacePreservedElement) {
						text = text.replace(allWhiteSpaceRegExp, ' ');

						if (node.lastChild && blockElements[node.lastChild.name]) {
							text = text.replace(startWhiteSpaceRegExp, '');
						}
					}

					// Do we need to create the node
					if (text.length !== 0) {
						textNode = createNode('#text', 3);
						textNode.raw = !!raw;
						node.append(textNode).value = text;
					}
				},

				comment: function(text) {
					node.append(createNode('#comment', 8)).value = text;
				},

				pi: function(name, text) {
					node.append(createNode(name, 7)).value = text;
					removeWhitespaceBefore(node);
				},

				doctype: function(text) {
					var newNode;

					newNode = node.append(createNode('#doctype', 10));
					newNode.value = text;
					removeWhitespaceBefore(node);
				},

				start: function(name, attrs, empty) {
					var newNode, attrFiltersLen, elementRule, attrName, parent;

					elementRule = validate ? schema.getElementRule(name) : {};
					if (elementRule) {
						newNode = createNode(elementRule.outputName || name, 1);
						newNode.attributes = attrs;
						newNode.shortEnded = empty;

						node.append(newNode);

						// Check if node is valid child of the parent node is the child is
						// unknown we don't collect it since it's probably a custom element
						parent = children[node.name];
						if (parent && children[newNode.name] && !parent[newNode.name]) {
							invalidChildren.push(newNode);
						}

						attrFiltersLen = attributeFilters.length;
						while (attrFiltersLen--) {
							attrName = attributeFilters[attrFiltersLen].name;

							if (attrName in attrs.map) {
								list = matchedAttributes[attrName];

								if (list) {
									list.push(newNode);
								} else {
									matchedAttributes[attrName] = [newNode];
								}
							}
						}

						// Trim whitespace before block
						if (blockElements[name]) {
							removeWhitespaceBefore(newNode);
						}

						// Change current node if the element wasn't empty i.e not <br /> or <img />
						if (!empty) {
							node = newNode;
						}

						// Check if we are inside a whitespace preserved element
						if (!isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
							isInWhiteSpacePreservedElement = true;
						}
					}
				},

				end: function(name) {
					var textNode, elementRule, text, sibling, tempNode;

					elementRule = validate ? schema.getElementRule(name) : {};
					if (elementRule) {
						if (blockElements[name]) {
							if (!isInWhiteSpacePreservedElement) {
								// Trim whitespace of the first node in a block
								textNode = node.firstChild;
								if (textNode && textNode.type === 3) {
									text = textNode.value.replace(startWhiteSpaceRegExp, '');

									// Any characters left after trim or should we remove it
									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.next;
									} else {
										sibling = textNode.next;
										textNode.remove();
										textNode = sibling;

										// Remove any pure whitespace siblings
										while (textNode && textNode.type === 3) {
											text = textNode.value;
											sibling = textNode.next;

											if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
												textNode.remove();
												textNode = sibling;
											}

											textNode = sibling;
										}
									}
								}

								// Trim whitespace of the last node in a block
								textNode = node.lastChild;
								if (textNode && textNode.type === 3) {
									text = textNode.value.replace(endWhiteSpaceRegExp, '');

									// Any characters left after trim or should we remove it
									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.prev;
									} else {
										sibling = textNode.prev;
										textNode.remove();
										textNode = sibling;

										// Remove any pure whitespace siblings
										while (textNode && textNode.type === 3) {
											text = textNode.value;
											sibling = textNode.prev;

											if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
												textNode.remove();
												textNode = sibling;
											}

											textNode = sibling;
										}
									}
								}
							}

							// Trim start white space
							// Removed due to: #5424
							/*textNode = node.prev;
							if (textNode && textNode.type === 3) {
								text = textNode.value.replace(startWhiteSpaceRegExp, '');

								if (text.length > 0)
									textNode.value = text;
								else
									textNode.remove();
							}*/
						}

						// Check if we exited a whitespace preserved element
						if (isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
							isInWhiteSpacePreservedElement = false;
						}

						// Handle empty nodes
						if (elementRule.removeEmpty || elementRule.paddEmpty) {
							if (node.isEmpty(nonEmptyElements)) {
								if (elementRule.paddEmpty) {
									node.empty().append(new Node('#text', '3')).value = '\u00a0';
								} else {
									// Leave nodes that have a name like <a name="name">
									if (!node.attributes.map.name && !node.attributes.map.id) {
										tempNode = node.parent;
										node.empty().remove();
										node = tempNode;
										return;
									}
								}
							}
						}

						node = node.parent;
					}
				}
			}, schema);

			rootNode = node = new Node(args.context || settings.root_name, 11);

			parser.parse(html);

			// Fix invalid children or report invalid children in a contextual parsing
			if (validate && invalidChildren.length) {
				if (!args.context) {
					fixInvalidChildren(invalidChildren);
				} else {
					args.invalid = true;
				}
			}

			// Wrap nodes in the root into block elements if the root is body
			if (rootBlockName && (rootNode.name == 'body' || args.isRootContent)) {
				addRootBlocks();
			}

			// Run filters only when the contents is valid
			if (!args.invalid) {
				// Run node filters
				for (name in matchedNodes) {
					list = nodeFilters[name];
					nodes = matchedNodes[name];

					// Remove already removed children
					fi = nodes.length;
					while (fi--) {
						if (!nodes[fi].parent) {
							nodes.splice(fi, 1);
						}
					}

					for (i = 0, l = list.length; i < l; i++) {
						list[i](nodes, name, args);
					}
				}

				// Run attribute filters
				for (i = 0, l = attributeFilters.length; i < l; i++) {
					list = attributeFilters[i];

					if (list.name in matchedAttributes) {
						nodes = matchedAttributes[list.name];

						// Remove already removed children
						fi = nodes.length;
						while (fi--) {
							if (!nodes[fi].parent) {
								nodes.splice(fi, 1);
							}
						}

						for (fi = 0, fl = list.callbacks.length; fi < fl; fi++) {
							list.callbacks[fi](nodes, list.name, args);
						}
					}
				}
			}

			return rootNode;
		};

		// Remove <br> at end of block elements Gecko and WebKit injects BR elements to
		// make it possible to place the caret inside empty blocks. This logic tries to remove
		// these elements and keep br elements that where intended to be there intact
		if (settings.remove_trailing_brs) {
			self.addNodeFilter('br', function(nodes) {
				var i, l = nodes.length, node, blockElements = extend({}, schema.getBlockElements());
				var nonEmptyElements = schema.getNonEmptyElements(), parent, lastParent, prev, prevName;
				var elementRule, textNode;

				// Remove brs from body element as well
				blockElements.body = 1;

				// Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
				for (i = 0; i < l; i++) {
					node = nodes[i];
					parent = node.parent;

					if (blockElements[node.parent.name] && node === parent.lastChild) {
						// Loop all nodes to the left of the current node and check for other BR elements
						// excluding bookmarks since they are invisible
						prev = node.prev;
						while (prev) {
							prevName = prev.name;

							// Ignore bookmarks
							if (prevName !== "span" || prev.attr('data-mce-type') !== 'bookmark') {
								// Found a non BR element
								if (prevName !== "br") {
									break;
								}

								// Found another br it's a <br><br> structure then don't remove anything
								if (prevName === 'br') {
									node = null;
									break;
								}
							}

							prev = prev.prev;
						}

						if (node) {
							node.remove();

							// Is the parent to be considered empty after we removed the BR
							if (parent.isEmpty(nonEmptyElements)) {
								elementRule = schema.getElementRule(parent.name);

								// Remove or padd the element depending on schema rule
								if (elementRule) {
									if (elementRule.removeEmpty) {
										parent.remove();
									} else if (elementRule.paddEmpty) {
										parent.empty().append(new Node('#text', 3)).value = '\u00a0';
									}
								}
							}
						}
					} else {
						// Replaces BR elements inside inline elements like <p><b><i><br></i></b></p>
						// so they become <p><b><i>&nbsp;</i></b></p>
						lastParent = node;
						while (parent && parent.firstChild === lastParent && parent.lastChild === lastParent) {
							lastParent = parent;

							if (blockElements[parent.name]) {
								break;
							}

							parent = parent.parent;
						}

						if (lastParent === parent) {
							textNode = new Node('#text', 3);
							textNode.value = '\u00a0';
							node.replace(textNode);
						}
					}
				}
			});
		}

		// Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
		if (!settings.allow_html_in_named_anchor) {
			self.addAttributeFilter('id,name', function(nodes) {
				var i = nodes.length, sibling, prevSibling, parent, node;

				while (i--) {
					node = nodes[i];
					if (node.name === 'a' && node.firstChild && !node.attr('href')) {
						parent = node.parent;

						// Move children after current node
						sibling = node.lastChild;
						do {
							prevSibling = sibling.prev;
							parent.insert(sibling, node);
							sibling = prevSibling;
						} while (sibling);
					}
				}
			});
		}
	};
});

// Included from: js/tinymce/classes/html/Writer.js

/**
 * Writer.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to write HTML tags out it can be used with the Serializer or the SaxParser.
 *
 * @class tinymce.html.Writer
 * @example
 * var writer = new tinymce.html.Writer({indent: true});
 * var parser = new tinymce.html.SaxParser(writer).parse('<p><br></p>');
 * console.log(writer.getContent());
 *
 * @class tinymce.html.Writer
 * @version 3.4
 */
define("tinymce/html/Writer", [
	"tinymce/html/Entities",
	"tinymce/util/Tools"
], function(Entities, Tools) {
	var makeMap = Tools.makeMap;

	/**
	 * Constructs a new Writer instance.
	 *
	 * @constructor
	 * @method Writer
	 * @param {Object} settings Name/value settings object.
	 */
	return function(settings) {
		var html = [], indent, indentBefore, indentAfter, encode, htmlOutput;

		settings = settings || {};
		indent = settings.indent;
		indentBefore = makeMap(settings.indent_before || '');
		indentAfter = makeMap(settings.indent_after || '');
		encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
		htmlOutput = settings.element_format == "html";

		return {
			/**
			 * Writes the a start element such as <p id="a">.
			 *
			 * @method start
			 * @param {String} name Name of the element.
			 * @param {Array} attrs Optional attribute array or undefined if it hasn't any.
			 * @param {Boolean} empty Optional empty state if the tag should end like <br />.
			 */
			start: function(name, attrs, empty) {
				var i, l, attr, value;

				if (indent && indentBefore[name] && html.length > 0) {
					value = html[html.length - 1];

					if (value.length > 0 && value !== '\n') {
						html.push('\n');
					}
				}

				html.push('<', name);

				if (attrs) {
					for (i = 0, l = attrs.length; i < l; i++) {
						attr = attrs[i];
						html.push(' ', attr.name, '="', encode(attr.value, true), '"');
					}
				}

				if (!empty || htmlOutput) {
					html[html.length] = '>';
				} else {
					html[html.length] = ' />';
				}

				if (empty && indent && indentAfter[name] && html.length > 0) {
					value = html[html.length - 1];

					if (value.length > 0 && value !== '\n') {
						html.push('\n');
					}
				}
			},

			/**
			 * Writes the a end element such as </p>.
			 *
			 * @method end
			 * @param {String} name Name of the element.
			 */
			end: function(name) {
				var value;

				/*if (indent && indentBefore[name] && html.length > 0) {
					value = html[html.length - 1];

					if (value.length > 0 && value !== '\n')
						html.push('\n');
				}*/

				html.push('</', name, '>');

				if (indent && indentAfter[name] && html.length > 0) {
					value = html[html.length - 1];

					if (value.length > 0 && value !== '\n') {
						html.push('\n');
					}
				}
			},

			/**
			 * Writes a text node.
			 *
			 * @method text
			 * @param {String} text String to write out.
			 * @param {Boolean} raw Optional raw state if true the contents wont get encoded.
			 */
			text: function(text, raw) {
				if (text.length > 0) {
					html[html.length] = raw ? text : encode(text);
				}
			},

			/**
			 * Writes a cdata node such as <![CDATA[data]]>.
			 *
			 * @method cdata
			 * @param {String} text String to write out inside the cdata.
			 */
			cdata: function(text) {
				html.push('<![CDATA[', text, ']]>');
			},

			/**
			 * Writes a comment node such as <!-- Comment -->.
			 *
			 * @method cdata
			 * @param {String} text String to write out inside the comment.
			 */
			comment: function(text) {
				html.push('<!--', text, '-->');
			},

			/**
			 * Writes a PI node such as <?xml attr="value" ?>.
			 *
			 * @method pi
			 * @param {String} name Name of the pi.
			 * @param {String} text String to write out inside the pi.
			 */
			pi: function(name, text) {
				if (text) {
					html.push('<?', name, ' ', text, '?>');
				} else {
					html.push('<?', name, '?>');
				}

				if (indent) {
					html.push('\n');
				}
			},

			/**
			 * Writes a doctype node such as <!DOCTYPE data>.
			 *
			 * @method doctype
			 * @param {String} text String to write out inside the doctype.
			 */
			doctype: function(text) {
				html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
			},

			/**
			 * Resets the internal buffer if one wants to reuse the writer.
			 *
			 * @method reset
			 */
			reset: function() {
				html.length = 0;
			},

			/**
			 * Returns the contents that got serialized.
			 *
			 * @method getContent
			 * @return {String} HTML contents that got written down.
			 */
			getContent: function() {
				return html.join('').replace(/\n$/, '');
			}
		};
	};
});

// Included from: js/tinymce/classes/html/Serializer.js

/**
 * Serializer.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to serialize down the DOM tree into a string using a Writer instance.
 *
 *
 * @example
 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
 * @class tinymce.html.Serializer
 * @version 3.4
 */
define("tinymce/html/Serializer", [
	"tinymce/html/Writer",
	"tinymce/html/Schema"
], function(Writer, Schema) {
	/**
	 * Constructs a new Serializer instance.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Name/value settings object.
	 * @param {tinymce.html.Schema} schema Schema instance to use.
	 */
	return function(settings, schema) {
		var self = this, writer = new Writer(settings);

		settings = settings || {};
		settings.validate = "validate" in settings ? settings.validate : true;

		self.schema = schema = schema || new Schema();
		self.writer = writer;

		/**
		 * Serializes the specified node into a string.
		 *
		 * @example
		 * new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
		 * @method serialize
		 * @param {tinymce.html.Node} node Node instance to serialize.
		 * @return {String} String with HTML based on DOM tree.
		 */
		self.serialize = function(node) {
			var handlers, validate;

			validate = settings.validate;

			handlers = {
				// #text
				3: function(node) {
					writer.text(node.value, node.raw);
				},

				// #comment
				8: function(node) {
					writer.comment(node.value);
				},

				// Processing instruction
				7: function(node) {
					writer.pi(node.name, node.value);
				},

				// Doctype
				10: function(node) {
					writer.doctype(node.value);
				},

				// CDATA
				4: function(node) {
					writer.cdata(node.value);
				},

				// Document fragment
				11: function(node) {
					if ((node = node.firstChild)) {
						do {
							walk(node);
						} while ((node = node.next));
					}
				}
			};

			writer.reset();

			function walk(node) {
				var handler = handlers[node.type], name, isEmpty, attrs, attrName, attrValue, sortedAttrs, i, l, elementRule;

				if (!handler) {
					name = node.name;
					isEmpty = node.shortEnded;
					attrs = node.attributes;

					// Sort attributes
					if (validate && attrs && attrs.length > 1) {
						sortedAttrs = [];
						sortedAttrs.map = {};

						elementRule = schema.getElementRule(node.name);
						for (i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
							attrName = elementRule.attributesOrder[i];

							if (attrName in attrs.map) {
								attrValue = attrs.map[attrName];
								sortedAttrs.map[attrName] = attrValue;
								sortedAttrs.push({name: attrName, value: attrValue});
							}
						}

						for (i = 0, l = attrs.length; i < l; i++) {
							attrName = attrs[i].name;

							if (!(attrName in sortedAttrs.map)) {
								attrValue = attrs.map[attrName];
								sortedAttrs.map[attrName] = attrValue;
								sortedAttrs.push({name: attrName, value: attrValue});
							}
						}

						attrs = sortedAttrs;
					}

					writer.start(node.name, attrs, isEmpty);

					if (!isEmpty) {
						if ((node = node.firstChild)) {
							do {
								walk(node);
							} while ((node = node.next));
						}

						writer.end(name);
					}
				} else {
					handler(node);
				}
			}

			// Serialize element and treat all non elements as fragments
			if (node.type == 1 && !settings.inner) {
				walk(node);
			} else {
				handlers[11](node);
			}

			return writer.getContent();
		};
	};
});

// Included from: js/tinymce/classes/dom/Serializer.js

/**
 * Serializer.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to serialize DOM trees into a string. Consult the TinyMCE Wiki API for
 * more details and examples on how to use this class.
 *
 * @class tinymce.dom.Serializer
 */
define("tinymce/dom/Serializer", [
	"tinymce/dom/DOMUtils",
	"tinymce/html/DomParser",
	"tinymce/html/Entities",
	"tinymce/html/Serializer",
	"tinymce/html/Node",
	"tinymce/html/Schema",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(DOMUtils, DomParser, Entities, Serializer, Node, Schema, Env, Tools) {
	var each = Tools.each, trim = Tools.trim;
	var DOM = DOMUtils.DOM;

	/**
	 * Constructs a new DOM serializer class.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Serializer settings object.
	 * @param {tinymce.Editor} editor Optional editor to bind events to and get schema/dom from.
	 */
	return function(settings, editor) {
		var dom, schema, htmlParser;

		if (editor) {
			dom = editor.dom;
			schema = editor.schema;
		}

		// Default DOM and Schema if they are undefined
		dom = dom || DOM;
		schema = schema || new Schema(settings);
		settings.entity_encoding = settings.entity_encoding || 'named';
		settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

		htmlParser = new DomParser(settings, schema);

		// Convert move data-mce-src, data-mce-href and data-mce-style into nodes or process them if needed
		htmlParser.addAttributeFilter('src,href,style', function(nodes, name) {
			var i = nodes.length, node, value, internalName = 'data-mce-' + name;
			var urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope, undef;

			while (i--) {
				node = nodes[i];

				value = node.attributes.map[internalName];
				if (value !== undef) {
					// Set external name to internal value and remove internal
					node.attr(name, value.length > 0 ? value : null);
					node.attr(internalName, null);
				} else {
					// No internal attribute found then convert the value we have in the DOM
					value = node.attributes.map[name];

					if (name === "style") {
						value = dom.serializeStyle(dom.parseStyle(value), node.name);
					} else if (urlConverter) {
						value = urlConverter.call(urlConverterScope, value, name, node.name);
					}

					node.attr(name, value.length > 0 ? value : null);
				}
			}
		});

		// Remove internal classes mceItem<..> or mceSelected
		htmlParser.addAttributeFilter('class', function(nodes) {
			var i = nodes.length, node, value;

			while (i--) {
				node = nodes[i];
				value = node.attr('class').replace(/(?:^|\s)mce-item-\w+(?!\S)/g, '');
				node.attr('class', value.length > 0 ? value : null);
			}
		});

		// Remove bookmark elements
		htmlParser.addAttributeFilter('data-mce-type', function(nodes, name, args) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.attributes.map['data-mce-type'] === 'bookmark' && !args.cleanup) {
					node.remove();
				}
			}
		});

		// Remove expando attributes
		htmlParser.addAttributeFilter('data-mce-expando', function(nodes, name) {
			var i = nodes.length;

			while (i--) {
				nodes[i].attr(name, null);
			}
		});

		htmlParser.addNodeFilter('noscript', function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i].firstChild;

				if (node) {
					node.value = Entities.decode(node.value);
				}
			}
		});

		// Force script into CDATA sections and remove the mce- prefix also add comments around styles
		htmlParser.addNodeFilter('script,style', function(nodes, name) {
			var i = nodes.length, node, value;

			function trim(value) {
				/*jshint maxlen:255 */
				return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
						.replace(/^[\r\n]*|[\r\n]*$/g, '')
						.replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
						.replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
			}

			while (i--) {
				node = nodes[i];
				value = node.firstChild ? node.firstChild.value : '';

				if (name === "script") {
					// Remove mce- prefix from script elements and remove default text/javascript mime type (HTML5)
					var type = (node.attr('type') || 'text/javascript').replace(/^mce\-/, '');
					node.attr('type', type === 'text/javascript' ? null : type);

					if (value.length > 0) {
						node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
					}
				} else {
					if (value.length > 0) {
						node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
					}
				}
			}
		});

		// Convert comments to cdata and handle protected comments
		htmlParser.addNodeFilter('#comment', function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.value.indexOf('[CDATA[') === 0) {
					node.name = '#cdata';
					node.type = 4;
					node.value = node.value.replace(/^\[CDATA\[|\]\]$/g, '');
				} else if (node.value.indexOf('mce:protected ') === 0) {
					node.name = "#text";
					node.type = 3;
					node.raw = true;
					node.value = unescape(node.value).substr(14);
				}
			}
		});

		htmlParser.addNodeFilter('xml:namespace,input', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];
				if (node.type === 7) {
					node.remove();
				} else if (node.type === 1) {
					if (name === "input" && !("type" in node.attributes.map)) {
						node.attr('type', 'text');
					}
				}
			}
		});

		// Fix list elements, TODO: Replace this later
		if (settings.fix_list_elements) {
			htmlParser.addNodeFilter('ul,ol', function(nodes) {
				var i = nodes.length, node, parentNode;

				while (i--) {
					node = nodes[i];
					parentNode = node.parent;

					if (parentNode.name === 'ul' || parentNode.name === 'ol') {
						if (node.prev && node.prev.name === 'li') {
							node.prev.append(node);
						}
					}
				}
			});
		}

		// Remove internal data attributes
		htmlParser.addAttributeFilter('data-mce-src,data-mce-href,data-mce-style,data-mce-selected', function(nodes, name) {
			var i = nodes.length;

			while (i--) {
				nodes[i].attr(name, null);
			}
		});

		// Return public methods
		return {
			/**
			 * Schema instance that was used to when the Serializer was constructed.
			 *
			 * @field {tinymce.html.Schema} schema
			 */
			schema: schema,

			/**
			 * Adds a node filter function to the parser used by the serializer, the parser will collect the specified nodes by name
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addNodeFilter('p,h1', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addNodeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addNodeFilter: htmlParser.addNodeFilter,

			/**
			 * Adds a attribute filter function to the parser used by the serializer, the parser will
			 * collect nodes that has the specified attributes
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addAttributeFilter('src,href', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addAttributeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addAttributeFilter: htmlParser.addAttributeFilter,

			/**
			 * Serializes the specified browser DOM node into a HTML string.
			 *
			 * @method serialize
			 * @param {DOMNode} node DOM node to serialize.
			 * @param {Object} args Arguments option that gets passed to event handlers.
			 */
			serialize: function(node, args) {
				var self = this, impl, doc, oldDoc, htmlSerializer, content;

				// Explorer won't clone contents of script and style and the
				// selected index of select elements are cleared on a clone operation.
				if (Env.ie && dom.select('script,style,select,map').length > 0) {
					content = node.innerHTML;
					node = node.cloneNode(false);
					dom.setHTML(node, content);
				} else {
					node = node.cloneNode(true);
				}

				// Nodes needs to be attached to something in WebKit/Opera
				// This fix will make DOM ranges and make Sizzle happy!
				impl = node.ownerDocument.implementation;
				if (impl.createHTMLDocument) {
					// Create an empty HTML document
					doc = impl.createHTMLDocument("");

					// Add the element or it's children if it's a body element to the new document
					each(node.nodeName == 'BODY' ? node.childNodes : [node], function(node) {
						doc.body.appendChild(doc.importNode(node, true));
					});

					// Grab first child or body element for serialization
					if (node.nodeName != 'BODY') {
						node = doc.body.firstChild;
					} else {
						node = doc.body;
					}

					// set the new document in DOMUtils so createElement etc works
					oldDoc = dom.doc;
					dom.doc = doc;
				}

				args = args || {};
				args.format = args.format || 'html';

				// Don't wrap content if we want selected html
				if (args.selection) {
					args.forced_root_block = '';
				}

				// Pre process
				if (!args.no_events) {
					args.node = node;
					self.onPreProcess(args);
				}

				// Setup serializer
				htmlSerializer = new Serializer(settings, schema);

				// Parse and serialize HTML
				args.content = htmlSerializer.serialize(
					htmlParser.parse(trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node)), args)
				);

				// Replace all BOM characters for now until we can find a better solution
				if (!args.cleanup) {
					args.content = args.content.replace(/\uFEFF/g, '');
				}

				// Post process
				if (!args.no_events) {
					self.onPostProcess(args);
				}

				// Restore the old document if it was changed
				if (oldDoc) {
					dom.doc = oldDoc;
				}

				args.node = null;

				return args.content;
			},

			/**
			 * Adds valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method addRules
			 * @param {String} rules Valid elements rules string to add to schema.
			 */
			addRules: function(rules) {
				schema.addValidElements(rules);
			},

			/**
			 * Sets the valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method setRules
			 * @param {String} rules Valid elements rules string.
			 */
			setRules: function(rules) {
				schema.setValidElements(rules);
			},

			onPreProcess: function(args) {
				if (editor) {
					editor.fire('PreProcess', args);
				}
			},

			onPostProcess: function(args) {
				if (editor) {
					editor.fire('PostProcess', args);
				}
			}
		};
	};
});

// Included from: js/tinymce/classes/dom/TridentSelection.js

/**
 * TridentSelection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Selection class for old explorer versions. This one fakes the
 * native selection object available on modern browsers.
 *
 * @class tinymce.dom.TridentSelection
 */
define("tinymce/dom/TridentSelection", [], function() {
	function Selection(selection) {
		var self = this, dom = selection.dom, FALSE = false;

		function getPosition(rng, start) {
			var checkRng, startIndex = 0, endIndex, inside,
				children, child, offset, index, position = -1, parent;

			// Setup test range, collapse it and get the parent
			checkRng = rng.duplicate();
			checkRng.collapse(start);
			parent = checkRng.parentElement();

			// Check if the selection is within the right document
			if (parent.ownerDocument !== selection.dom.doc) {
				return;
			}

			// IE will report non editable elements as it's parent so look for an editable one
			while (parent.contentEditable === "false") {
				parent = parent.parentNode;
			}

			// If parent doesn't have any children then return that we are inside the element
			if (!parent.hasChildNodes()) {
				return {node: parent, inside: 1};
			}

			// Setup node list and endIndex
			children = parent.children;
			endIndex = children.length - 1;

			// Perform a binary search for the position
			while (startIndex <= endIndex) {
				index = Math.floor((startIndex + endIndex) / 2);

				// Move selection to node and compare the ranges
				child = children[index];
				checkRng.moveToElementText(child);
				position = checkRng.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', rng);

				// Before/after or an exact match
				if (position > 0) {
					endIndex = index - 1;
				} else if (position < 0) {
					startIndex = index + 1;
				} else {
					return {node: child};
				}
			}

			// Check if child position is before or we didn't find a position
			if (position < 0) {
				// No element child was found use the parent element and the offset inside that
				if (!child) {
					checkRng.moveToElementText(parent);
					checkRng.collapse(true);
					child = parent;
					inside = true;
				} else {
					checkRng.collapse(false);
				}

				// Walk character by character in text node until we hit the selected range endpoint,
				// hit the end of document or parent isn't the right one
				// We need to walk char by char since rng.text or rng.htmlText will trim line endings
				offset = 0;
				while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
					if (checkRng.move('character', 1) === 0 || parent != checkRng.parentElement()) {
						break;
					}

					offset++;
				}
			} else {
				// Child position is after the selection endpoint
				checkRng.collapse(true);

				// Walk character by character in text node until we hit the selected range endpoint, hit
				// the end of document or parent isn't the right one
				offset = 0;
				while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
					if (checkRng.move('character', -1) === 0 || parent != checkRng.parentElement()) {
						break;
					}

					offset++;
				}
			}

			return {node: child, position: position, offset: offset, inside: inside};
		}

		// Returns a W3C DOM compatible range object by using the IE Range API
		function getRange() {
			var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed, tmpRange, element2, bookmark;

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc) {
				return domRange;
			}

			collapsed = selection.isCollapsed();

			// Handle control selection
			if (ieRange.item) {
				domRange.setStart(element.parentNode, dom.nodeIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			function findEndPoint(start) {
				var endPoint = getPosition(ieRange, start), container, offset, textNodeOffset = 0, sibling, undef, nodeValue;

				container = endPoint.node;
				offset = endPoint.offset;

				if (endPoint.inside && !container.hasChildNodes()) {
					domRange[start ? 'setStart' : 'setEnd'](container, 0);
					return;
				}

				if (offset === undef) {
					domRange[start ? 'setStartBefore' : 'setEndAfter'](container);
					return;
				}

				if (endPoint.position < 0) {
					sibling = endPoint.inside ? container.firstChild : container.nextSibling;

					if (!sibling) {
						domRange[start ? 'setStartAfter' : 'setEndAfter'](container);
						return;
					}

					if (!offset) {
						if (sibling.nodeType == 3) {
							domRange[start ? 'setStart' : 'setEnd'](sibling, 0);
						} else {
							domRange[start ? 'setStartBefore' : 'setEndBefore'](sibling);
						}

						return;
					}

					// Find the text node and offset
					while (sibling) {
						nodeValue = sibling.nodeValue;
						textNodeOffset += nodeValue.length;

						// We are at or passed the position we where looking for
						if (textNodeOffset >= offset) {
							container = sibling;
							textNodeOffset -= offset;
							textNodeOffset = nodeValue.length - textNodeOffset;
							break;
						}

						sibling = sibling.nextSibling;
					}
				} else {
					// Find the text node and offset
					sibling = container.previousSibling;

					if (!sibling) {
						return domRange[start ? 'setStartBefore' : 'setEndBefore'](container);
					}

					// If there isn't any text to loop then use the first position
					if (!offset) {
						if (container.nodeType == 3) {
							domRange[start ? 'setStart' : 'setEnd'](sibling, container.nodeValue.length);
						} else {
							domRange[start ? 'setStartAfter' : 'setEndAfter'](sibling);
						}

						return;
					}

					while (sibling) {
						textNodeOffset += sibling.nodeValue.length;

						// We are at or passed the position we where looking for
						if (textNodeOffset >= offset) {
							container = sibling;
							textNodeOffset -= offset;
							break;
						}

						sibling = sibling.previousSibling;
					}
				}

				domRange[start ? 'setStart' : 'setEnd'](container, textNodeOffset);
			}

			try {
				// Find start point
				findEndPoint(true);

				// Find end point if needed
				if (!collapsed) {
					findEndPoint();
				}
			} catch (ex) {
				// IE has a nasty bug where text nodes might throw "invalid argument" when you
				// access the nodeValue or other properties of text nodes. This seems to happend when
				// text nodes are split into two nodes by a delete/backspace call. So lets detect it and try to fix it.
				if (ex.number == -2147024809) {
					// Get the current selection
					bookmark = self.getBookmark(2);

					// Get start element
					tmpRange = ieRange.duplicate();
					tmpRange.collapse(true);
					element = tmpRange.parentElement();

					// Get end element
					if (!collapsed) {
						tmpRange = ieRange.duplicate();
						tmpRange.collapse(false);
						element2 = tmpRange.parentElement();
						element2.innerHTML = element2.innerHTML;
					}

					// Remove the broken elements
					element.innerHTML = element.innerHTML;

					// Restore the selection
					self.moveToBookmark(bookmark);

					// Since the range has moved we need to re-get it
					ieRange = selection.getRng();

					// Find start point
					findEndPoint(true);

					// Find end point if needed
					if (!collapsed) {
						findEndPoint();
					}
				} else {
					throw ex; // Throw other errors
				}
			}

			return domRange;
		}

		this.getBookmark = function(type) {
			var rng = selection.getRng(), bookmark = {};

			function getIndexes(node) {
				var parent, root, children, i, indexes = [];

				parent = node.parentNode;
				root = dom.getRoot().parentNode;

				while (parent != root && parent.nodeType !== 9) {
					children = parent.children;

					i = children.length;
					while (i--) {
						if (node === children[i]) {
							indexes.push(i);
							break;
						}
					}

					node = parent;
					parent = parent.parentNode;
				}

				return indexes;
			}

			function getBookmarkEndPoint(start) {
				var position;

				position = getPosition(rng, start);
				if (position) {
					return {
						position: position.position,
						offset: position.offset,
						indexes: getIndexes(position.node),
						inside: position.inside
					};
				}
			}

			// Non ubstructive bookmark
			if (type === 2) {
				// Handle text selection
				if (!rng.item) {
					bookmark.start = getBookmarkEndPoint(true);

					if (!selection.isCollapsed()) {
						bookmark.end = getBookmarkEndPoint();
					}
				} else {
					bookmark.start = {ctrl: true, indexes: getIndexes(rng.item(0))};
				}
			}

			return bookmark;
		};

		this.moveToBookmark = function(bookmark) {
			var rng, body = dom.doc.body;

			function resolveIndexes(indexes) {
				var node, i, idx, children;

				node = dom.getRoot();
				for (i = indexes.length - 1; i >= 0; i--) {
					children = node.children;
					idx = indexes[i];

					if (idx <= children.length - 1) {
						node = children[idx];
					}
				}

				return node;
			}

			function setBookmarkEndPoint(start) {
				var endPoint = bookmark[start ? 'start' : 'end'], moveLeft, moveRng, undef, offset;

				if (endPoint) {
					moveLeft = endPoint.position > 0;

					moveRng = body.createTextRange();
					moveRng.moveToElementText(resolveIndexes(endPoint.indexes));

					offset = endPoint.offset;
					if (offset !== undef) {
						moveRng.collapse(endPoint.inside || moveLeft);
						moveRng.moveStart('character', moveLeft ? -offset : offset);
					} else {
						moveRng.collapse(start);
					}

					rng.setEndPoint(start ? 'StartToStart' : 'EndToStart', moveRng);

					if (start) {
						rng.collapse(true);
					}
				}
			}

			if (bookmark.start) {
				if (bookmark.start.ctrl) {
					rng = body.createControlRange();
					rng.addElement(resolveIndexes(bookmark.start.indexes));
					rng.select();
				} else {
					rng = body.createTextRange();
					setBookmarkEndPoint(true);
					setBookmarkEndPoint();
					rng.select();
				}
			}
		};

		this.addRange = function(rng) {
			var ieRng, ctrlRng, startContainer, startOffset, endContainer, endOffset, sibling,
				doc = selection.dom.doc, body = doc.body, nativeRng, ctrlElm;

			function setEndPoint(start) {
				var container, offset, marker, tmpRng, nodes;

				marker = dom.create('a');
				container = start ? startContainer : endContainer;
				offset = start ? startOffset : endOffset;
				tmpRng = ieRng.duplicate();

				if (container == doc || container == doc.documentElement) {
					container = body;
					offset = 0;
				}

				if (container.nodeType == 3) {
					container.parentNode.insertBefore(marker, container);
					tmpRng.moveToElementText(marker);
					tmpRng.moveStart('character', offset);
					dom.remove(marker);
					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
				} else {
					nodes = container.childNodes;

					if (nodes.length) {
						if (offset >= nodes.length) {
							dom.insertAfter(marker, nodes[nodes.length - 1]);
						} else {
							container.insertBefore(marker, nodes[offset]);
						}

						tmpRng.moveToElementText(marker);
					} else if (container.canHaveHTML) {
						// Empty node selection for example <div>|</div>
						// Setting innerHTML with a span marker then remove that marker seems to keep empty block elements open
						container.innerHTML = '<span>&#xFEFF;</span>';
						marker = container.firstChild;
						tmpRng.moveToElementText(marker);
						tmpRng.collapse(FALSE); // Collapse false works better than true for some odd reason
					}

					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
					dom.remove(marker);
				}
			}

			// Setup some shorter versions
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
			ieRng = body.createTextRange();

			// If single element selection then try making a control selection out of it
			if (startContainer == endContainer && startContainer.nodeType == 1) {
				// Trick to place the caret inside an empty block element like <p></p>
				if (startOffset == endOffset && !startContainer.hasChildNodes()) {
					if (startContainer.canHaveHTML) {
						// Check if previous sibling is an empty block if it is then we need to render it
						// IE would otherwise move the caret into the sibling instead of the empty startContainer see: #5236
						// Example this: <p></p><p>|</p> would become this: <p>|</p><p></p>
						sibling = startContainer.previousSibling;
						if (sibling && !sibling.hasChildNodes() && dom.isBlock(sibling)) {
							sibling.innerHTML = '&#xFEFF;';
						} else {
							sibling = null;
						}

						startContainer.innerHTML = '<span>&#xFEFF;</span><span>&#xFEFF;</span>';
						ieRng.moveToElementText(startContainer.lastChild);
						ieRng.select();
						dom.doc.selection.clear();
						startContainer.innerHTML = '';

						if (sibling) {
							sibling.innerHTML = '';
						}
						return;
					} else {
						startOffset = dom.nodeIndex(startContainer);
						startContainer = startContainer.parentNode;
					}
				}

				if (startOffset == endOffset - 1) {
					try {
						ctrlElm = startContainer.childNodes[startOffset];
						ctrlRng = body.createControlRange();
						ctrlRng.addElement(ctrlElm);
						ctrlRng.select();

						// Check if the range produced is on the correct element and is a control range
						// On IE 8 it will select the parent contentEditable container if you select an inner element see: #5398
						nativeRng = selection.getRng();
						if (nativeRng.item && ctrlElm === nativeRng.item(0)) {
							return;
						}
					} catch (ex) {
						// Ignore
					}
				}
			}

			// Set start/end point of selection
			setEndPoint(true);
			setEndPoint();

			// Select the new range and scroll it into view
			ieRng.select();
		};

		// Expose range method
		this.getRangeAt = getRange;
	}

	return Selection;
});

// Included from: js/tinymce/classes/util/VK.js

/**
 * VK.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This file exposes a set of the common KeyCodes for use.  Please grow it as needed.
 */
define("tinymce/util/VK", [
	"tinymce/Env"
], function(Env) {
	return {
		BACKSPACE: 8,
		DELETE: 46,
		DOWN: 40,
		ENTER: 13,
		LEFT: 37,
		RIGHT: 39,
		SPACEBAR: 32,
		TAB: 9,
		UP: 38,

		modifierPressed: function(e) {
			return e.shiftKey || e.ctrlKey || e.altKey;
		},

		metaKeyPressed: function(e) {
			// Check if ctrl or meta key is pressed also check if alt is false for Polish users
			return (Env.mac ? e.metaKey : e.ctrlKey) && !e.altKey;
		}
	};
});

// Included from: js/tinymce/classes/dom/ControlSelection.js

/**
 * ControlSelection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles control selection of elements. Controls are elements
 * that can be resized and needs to be selected as a whole. It adds custom resize handles
 * to all browser engines that support properly disabling the built in resize logic.
 *
 * @class tinymce.dom.ControlSelection
 */
define("tinymce/dom/ControlSelection", [
	"tinymce/util/VK",
	"tinymce/util/Tools",
	"tinymce/Env"
], function(VK, Tools, Env) {
	return function(selection, editor) {
		var dom = editor.dom, each = Tools.each;
		var selectedElm, selectedElmGhost, resizeHandles, selectedHandle, lastMouseDownEvent;
		var startX, startY, selectedElmX, selectedElmY, startW, startH, ratio, resizeStarted;
		var width, height, editableDoc = editor.getDoc(), rootDocument = document, isIE = Env.ie && Env.ie < 11;

		// Details about each resize handle how to scale etc
		resizeHandles = {
			// Name: x multiplier, y multiplier, delta size x, delta size y
			n:  [0.5,   0,     0,   -1],
			e:  [1,    0.5,    1,    0],
			s:  [0.5,   1,     0,    1],
			w:  [0,    0.5,   -1,    0],
			nw: [0,     0,    -1,   -1],
			ne: [1,     0,     1,   -1],
			se: [1,     1,     1,    1],
			sw: [0,     1,    -1,    1]
		};

		// Add CSS for resize handles, cloned element and selected
		var rootClass = '.mce-content-body';
		editor.contentStyles.push(
			rootClass + ' div.mce-resizehandle {' +
				'position: absolute;' +
				'border: 1px solid black;' +
				'background: #FFF;' +
				'width: 5px;' +
				'height: 5px;' +
				'z-index: 10000' +
			'}' +
			rootClass + ' .mce-resizehandle:hover {' +
				'background: #000' +
			'}' +
			rootClass + ' img[data-mce-selected], hr[data-mce-selected] {' +
				'outline: 1px solid black;' +
				'resize: none' + // Have been talks about implementing this in browsers
			'}' +
			rootClass + ' .mce-clonedresizable {' +
				'position: absolute;' +
				(Env.gecko ? '' : 'outline: 1px dashed black;') + // Gecko produces trails while resizing
				'opacity: .5;' +
				'filter: alpha(opacity=50);' +
				'z-index: 10000' +
			'}'
		);

		function isResizable(elm) {
			if (editor.settings.object_resizing === false) {
				return false;
			}

			if (!/TABLE|IMG|DIV/.test(elm.nodeName)) {
				return false;
			}

			if (elm.getAttribute('data-mce-resize') === 'false') {
				return false;
			}

			return true;
		}

		function resizeGhostElement(e) {
			var deltaX, deltaY;

			// Calc new width/height
			deltaX = e.screenX - startX;
			deltaY = e.screenY - startY;

			// Calc new size
			width = deltaX * selectedHandle[2] + startW;
			height = deltaY * selectedHandle[3] + startH;

			// Never scale down lower than 5 pixels
			width = width < 5 ? 5 : width;
			height = height < 5 ? 5 : height;

			// Constrain proportions when modifier key is pressed or if the nw, ne, sw, se corners are moved on an image
			if (VK.modifierPressed(e) || (selectedElm.nodeName == "IMG" && selectedHandle[2] * selectedHandle[3] !== 0)) {
				width = Math.round(height / ratio);
				height = Math.round(width * ratio);
			}

			// Update ghost size
			dom.setStyles(selectedElmGhost, {
				width: width,
				height: height
			});

			// Update ghost X position if needed
			if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
				dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
			}

			// Update ghost Y position if needed
			if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
				dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
			}

			if (!resizeStarted) {
				editor.fire('ObjectResizeStart', {target: selectedElm, width: startW, height: startH});
				resizeStarted = true;
			}
		}

		function endGhostResize() {
			resizeStarted = false;

			function setSizeProp(name, value) {
				if (value) {
					// Resize by using style or attribute
					if (selectedElm.style[name] || !editor.schema.isValid(selectedElm.nodeName.toLowerCase(), name)) {
						dom.setStyle(selectedElm, name, value);
					} else {
						dom.setAttrib(selectedElm, name, value);
					}
				}
			}

			// Set width/height properties
			setSizeProp('width', width);
			setSizeProp('height', height);

			dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
			dom.unbind(editableDoc, 'mouseup', endGhostResize);

			if (rootDocument != editableDoc) {
				dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
				dom.unbind(rootDocument, 'mouseup', endGhostResize);
			}

			// Remove ghost and update resize handle positions
			dom.remove(selectedElmGhost);

			if (!isIE || selectedElm.nodeName == "TABLE") {
				showResizeRect(selectedElm);
			}

			editor.fire('ObjectResized', {target: selectedElm, width: width, height: height});
			editor.nodeChanged();
		}

		function showResizeRect(targetElm, mouseDownHandleName, mouseDownEvent) {
			var position, targetWidth, targetHeight, e, rect, offsetParent = editor.getBody();

			// Get position and size of target
			position = dom.getPos(targetElm, offsetParent);
			selectedElmX = position.x;
			selectedElmY = position.y;
			rect = targetElm.getBoundingClientRect(); // Fix for Gecko offsetHeight for table with caption
			targetWidth = rect.width || (rect.right - rect.left);
			targetHeight = rect.height || (rect.bottom - rect.top);

			// Reset width/height if user selects a new image/table
			if (selectedElm != targetElm) {
				detachResizeStartListener();
				selectedElm = targetElm;
				width = height = 0;
			}

			// Makes it possible to disable resizing
			e = editor.fire('ObjectSelected', {target: targetElm});

			if (isResizable(targetElm) && !e.isDefaultPrevented()) {
				each(resizeHandles, function(handle, name) {
					var handleElm, handlerContainerElm;

					function startDrag(e) {
						resizeStarted = true;

						startX = e.screenX;
						startY = e.screenY;
						startW = selectedElm.clientWidth;
						startH = selectedElm.clientHeight;
						ratio = startH / startW;
						selectedHandle = handle;

						selectedElmGhost = selectedElm.cloneNode(true);
						dom.addClass(selectedElmGhost, 'mce-clonedresizable');
						selectedElmGhost.contentEditable = false; // Hides IE move layer cursor
						selectedElmGhost.unSelectabe = true;
						dom.setStyles(selectedElmGhost, {
							left: selectedElmX,
							top: selectedElmY,
							margin: 0
						});

						selectedElmGhost.removeAttribute('data-mce-selected');
						editor.getBody().appendChild(selectedElmGhost);

						dom.bind(editableDoc, 'mousemove', resizeGhostElement);
						dom.bind(editableDoc, 'mouseup', endGhostResize);

						if (rootDocument != editableDoc) {
							dom.bind(rootDocument, 'mousemove', resizeGhostElement);
							dom.bind(rootDocument, 'mouseup', endGhostResize);
						}
					}

					if (mouseDownHandleName) {
						// Drag started by IE native resizestart
						if (name == mouseDownHandleName) {
							startDrag(mouseDownEvent);
						}

						return;
					}

					// Get existing or render resize handle
					handleElm = dom.get('mceResizeHandle' + name);
					if (!handleElm) {
						handlerContainerElm = editor.getBody();

						handleElm = dom.add(handlerContainerElm, 'div', {
							id: 'mceResizeHandle' + name,
							'data-mce-bogus': true,
							'class': 'mce-resizehandle',
							contentEditable: false, // Hides IE move layer cursor
							unSelectabe: true,
							style: 'cursor:' + name + '-resize; margin:0; padding:0'
						});

						dom.bind(handleElm, 'mousedown', function(e) {
							e.preventDefault();
							startDrag(e);
						});
					} else {
						dom.show(handleElm);
					}

					/*
					var halfHandleW = handleElm.offsetWidth / 2;
					var halfHandleH = handleElm.offsetHeight / 2;

					// Position element
					dom.setStyles(handleElm, {
						left: Math.floor((targetWidth * handle[0] + selectedElmX) - halfHandleW + (handle[2] * halfHandleW)),
						top: Math.floor((targetHeight * handle[1] + selectedElmY) - halfHandleH + (handle[3] * halfHandleH))
					});
					*/

					// Position element
					dom.setStyles(handleElm, {
						left: (targetWidth * handle[0] + selectedElmX) - (handleElm.offsetWidth / 2),
						top: (targetHeight * handle[1] + selectedElmY) - (handleElm.offsetHeight / 2)
					});
				});
			} else {
				hideResizeRect();
			}

			selectedElm.setAttribute('data-mce-selected', '1');
		}

		function hideResizeRect() {
			var name, handleElm;

			if (selectedElm) {
				selectedElm.removeAttribute('data-mce-selected');
			}

			for (name in resizeHandles) {
				handleElm = dom.get('mceResizeHandle' + name);
				if (handleElm) {
					dom.unbind(handleElm);
					dom.remove(handleElm);
				}
			}
		}

		function updateResizeRect(e) {
			var controlElm;

			function isChildOrEqual(node, parent) {
				if (node) {
					do {
						if (node === parent) {
							return true;
						}
					} while ((node = node.parentNode));
				}
			}

			// Remove data-mce-selected from all elements since they might have been copied using Ctrl+c/v
			each(dom.select('img[data-mce-selected],hr[data-mce-selected]'), function(img) {
				img.removeAttribute('data-mce-selected');
			});

			controlElm = e.type == 'mousedown' ? e.target : selection.getNode();
			controlElm = dom.getParent(controlElm, isIE ? 'table' : 'table,img,hr');

			if (isChildOrEqual(controlElm, editor.getBody())) {
				disableGeckoResize();

				if (isChildOrEqual(selection.getStart(), controlElm) && isChildOrEqual(selection.getEnd(), controlElm)) {
					if (!isIE || (controlElm != selection.getStart() && selection.getStart().nodeName !== 'IMG')) {
						showResizeRect(controlElm);
						return;
					}
				}
			}

			hideResizeRect();
		}

		function attachEvent(elm, name, func) {
			if (elm && elm.attachEvent) {
				elm.attachEvent('on' + name, func);
			}
		}

		function detachEvent(elm, name, func) {
			if (elm && elm.detachEvent) {
				elm.detachEvent('on' + name, func);
			}
		}

		function resizeNativeStart(e) {
			var target = e.srcElement, pos, name, corner, cornerX, cornerY, relativeX, relativeY;

			pos = target.getBoundingClientRect();
			relativeX = lastMouseDownEvent.clientX - pos.left;
			relativeY = lastMouseDownEvent.clientY - pos.top;

			// Figure out what corner we are draging on
			for (name in resizeHandles) {
				corner = resizeHandles[name];

				cornerX = target.offsetWidth * corner[0];
				cornerY = target.offsetHeight * corner[1];

				if (Math.abs(cornerX - relativeX) < 8 && Math.abs(cornerY - relativeY) < 8) {
					selectedHandle = corner;
					break;
				}
			}

			// Remove native selection and let the magic begin
			resizeStarted = true;
			editor.getDoc().selection.empty();
			showResizeRect(target, name, lastMouseDownEvent);
		}

		function nativeControlSelect(e) {
			var target = e.srcElement;

			if (target != selectedElm) {
				detachResizeStartListener();

				if (target.id.indexOf('mceResizeHandle') === 0) {
					e.returnValue = false;
					return;
				}

				if (target.nodeName == 'IMG' || target.nodeName == 'TABLE') {
					hideResizeRect();
					selectedElm = target;
					attachEvent(target, 'resizestart', resizeNativeStart);
				}
			}
		}

		function detachResizeStartListener() {
			detachEvent(selectedElm, 'resizestart', resizeNativeStart);
		}

		function disableGeckoResize() {
			try {
				// Disable object resizing on Gecko
				editor.getDoc().execCommand('enableObjectResizing', false, false);
			} catch (ex) {
				// Ignore
			}
		}

		function controlSelect(elm) {
			var ctrlRng;

			if (!isIE) {
				return;
			}

			ctrlRng = editableDoc.body.createControlRange();

			try {
				ctrlRng.addElement(elm);
				ctrlRng.select();
				return true;
			} catch (ex) {
				// Ignore since the element can't be control selected for example a P tag
			}
		}

		editor.on('init', function() {
			if (isIE) {
				// Hide the resize rect on resize and reselect the image
				editor.on('ObjectResized', function(e) {
					if (e.target.nodeName != 'TABLE') {
						hideResizeRect();
						controlSelect(e.target);
					}
				});

				attachEvent(editor.getBody(), 'controlselect', nativeControlSelect);

				editor.on('mousedown', function(e) {
					lastMouseDownEvent = e;
				});
			} else {
				disableGeckoResize();

				if (Env.ie >= 11) {
					// TODO: Drag/drop doesn't work
					editor.on('mouseup', function(e) {
						var nodeName = e.target.nodeName;

						if (/^(TABLE|IMG|HR)$/.test(nodeName)) {
							editor.selection.select(e.target, nodeName == 'TABLE');
							editor.nodeChanged();
						}
					});

					editor.dom.bind(editor.getBody(), 'mscontrolselect', function(e) {
						if (/^(TABLE|IMG|HR)$/.test(e.target.nodeName)) {
							e.preventDefault();
						}
					});
				}
			}

			editor.on('nodechange mousedown mouseup ResizeEditor', updateResizeRect);

			// Update resize rect while typing in a table
			editor.on('keydown keyup', function(e) {
				if (selectedElm && selectedElm.nodeName == "TABLE") {
					updateResizeRect(e);
				}
			});

			// Hide rect on focusout since it would float on top of windows otherwise
			//editor.on('focusout', hideResizeRect);
		});

		function destroy() {
			selectedElm = selectedElmGhost = null;

			if (isIE) {
				detachResizeStartListener();
				detachEvent(editor.getBody(), 'controlselect', nativeControlSelect);
			}
		}

		return {
			isResizable: isResizable,
			showResizeRect: showResizeRect,
			hideResizeRect: hideResizeRect,
			updateResizeRect: updateResizeRect,
			controlSelect: controlSelect,
			destroy: destroy
		};
	};
});

// Included from: js/tinymce/classes/dom/RangeUtils.js

/**
 * Range.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * RangeUtils
 *
 * @class tinymce.dom.RangeUtils
 * @private
 */
define("tinymce/dom/RangeUtils", [
	"tinymce/util/Tools",
	"tinymce/dom/TreeWalker"
], function(Tools, TreeWalker) {
	var each = Tools.each;

	function RangeUtils(dom) {
		/**
		 * Walks the specified range like object and executes the callback for each sibling collection it finds.
		 *
		 * @method walk
		 * @param {Object} rng Range like object.
		 * @param {function} callback Callback function to execute for each sibling collection.
		 */
		this.walk = function(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mce-item-selected,th.mce-item-selected');
			if (nodes.length > 0) {
				each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			/**
			 * Excludes start/end text node if they are out side the range
			 *
			 * @private
			 * @param {Array} nodes Nodes to exclude items from.
			 * @return {Array} Array with nodes excluding the start/end container if needed.
			 */
			function exclude(nodes) {
				var node;

				// First node is excluded
				node = nodes[0];
				if (node.nodeType === 3 && node === startContainer && startOffset >= node.nodeValue.length) {
					nodes.splice(0, 1);
				}

				// Last node is excluded
				node = nodes[nodes.length - 1];
				if (endOffset === 0 && nodes.length > 0 && node === endContainer && node.nodeType === 3) {
					nodes.splice(nodes.length - 1, 1);
				}

				return nodes;
			}

			/**
			 * Collects siblings
			 *
			 * @private
			 * @param {Node} node Node to collect siblings from.
			 * @param {String} name Name of the sibling to check for.
			 * @return {Array} Array of collected siblings.
			 */
			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name]) {
					siblings.push(node);
				}

				return siblings;
			}

			/**
			 * Find an end point this is the node just before the common ancestor root.
			 *
			 * @private
			 * @param {Node} node Node to start at.
			 * @param {Node} root Root/ancestor element to stop just before.
			 * @return {Node} Node just before the root element.
			 */
			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root) {
						return node;
					}

					node = node.parentNode;
				} while(node);
			}

			function walkBoundary(start_node, end_node, next) {
				var siblingName = next ? 'nextSibling' : 'previousSibling';

				for (node = start_node, parent = node.parentNode; node && node != end_node; node = parent) {
					parent = node.parentNode;
					siblings = collectSiblings(node == start_node ? node : node[siblingName], siblingName);

					if (siblings.length) {
						if (!next) {
							siblings.reverse();
						}

						callback(exclude(siblings));
					}
				}
			}

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				startContainer = startContainer.childNodes[startOffset];
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				endContainer = endContainer.childNodes[Math.min(endOffset - 1, endContainer.childNodes.length - 1)];
			}

			// Same container
			if (startContainer == endContainer) {
				return callback(exclude([startContainer]));
			}

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);

			// Process left side
			for (node = startContainer; node; node = node.parentNode) {
				if (node === endContainer) {
					return walkBoundary(startContainer, ancestor, true);
				}

				if (node === ancestor) {
					break;
				}
			}

			// Process right side
			for (node = endContainer; node; node = node.parentNode) {
				if (node === startContainer) {
					return walkBoundary(endContainer, ancestor);
				}

				if (node === ancestor) {
					break;
				}
			}

			// Find start/end point
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			walkBoundary(startContainer, startPoint, true);

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length) {
				callback(exclude(siblings));
			}

			// Walk right leaf
			walkBoundary(endContainer, endPoint);
		};

		/**
		 * Splits the specified range at it's start/end points.
		 *
		 * @private
		 * @param {Range/RangeObject} rng Range to split.
		 * @return {Object} Range position object.
		 */
		this.split = function(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			function splitText(node, offset) {
				return node.splitText(offset);
			}

			// Handle single text node
			if (startContainer == endContainer && startContainer.nodeType == 3) {
				if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					endContainer = splitText(startContainer, startOffset);
					startContainer = endContainer.previousSibling;

					if (endOffset > startOffset) {
						endOffset = endOffset - startOffset;
						startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
						endOffset = endContainer.nodeValue.length;
						startOffset = 0;
					} else {
						endOffset = 0;
					}
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			return {
				startContainer: startContainer,
				startOffset: startOffset,
				endContainer: endContainer,
				endOffset: endOffset
			};
		};

		/**
		 * Normalizes the specified range by finding the closest best suitable caret location.
		 *
		 * @private
		 * @param {Range} rng Range to normalize.
		 * @return {Boolean} True/false if the specified range was normalized or not.
		 */
		this.normalize = function(rng) {
			var normalized, collapsed;

			function normalizeEndPoint(start) {
				var container, offset, walker, body = dom.getRoot(), node, nonEmptyElementsMap, nodeName;
				var directionLeft, isAfterNode;

				function hasBrBeforeAfter(node, left) {
					var walker = new TreeWalker(node, dom.getParent(node.parentNode, dom.isBlock) || body);

					while ((node = walker[left ? 'prev' : 'next']())) {
						if (node.nodeName === "BR") {
							return true;
						}
					}
				}

				function isPrevNode(node, name) {
					return node.previousSibling && node.previousSibling.nodeName == name;
				}

				// Walks the dom left/right to find a suitable text node to move the endpoint into
				// It will only walk within the current parent block or body and will stop if it hits a block or a BR/IMG
				function findTextNodeRelative(left, startNode) {
					var walker, lastInlineElement, parentBlockContainer;

					startNode = startNode || container;
					parentBlockContainer = dom.getParent(startNode.parentNode, dom.isBlock) || body;

					// Lean left before the BR element if it's the only BR within a block element. Gecko bug: #6680
					// This: <p><br>|</p> becomes <p>|<br></p>
					if (left && startNode.nodeName == 'BR' && isAfterNode && dom.isEmpty(parentBlockContainer)) {
						container = startNode.parentNode;
						offset = dom.nodeIndex(startNode);
						normalized = true;
						return;
					}

					// Walk left until we hit a text node we can move to or a block/br/img
					walker = new TreeWalker(startNode, parentBlockContainer);
					while ((node = walker[left ? 'prev' : 'next']())) {
						// Found text node that has a length
						if (node.nodeType === 3 && node.nodeValue.length > 0) {
							container = node;
							offset = left ? node.nodeValue.length : 0;
							normalized = true;
							return;
						}

						// Break if we find a block or a BR/IMG/INPUT etc
						if (dom.isBlock(node) || nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
							return;
						}

						lastInlineElement = node;
					}

					// Only fetch the last inline element when in caret mode for now
					if (collapsed && lastInlineElement) {
						container = lastInlineElement;
						normalized = true;
						offset = 0;
					}
				}

				container = rng[(start ? 'start' : 'end') + 'Container'];
				offset = rng[(start ? 'start' : 'end') + 'Offset'];
				isAfterNode = container.nodeType == 1 && offset === container.childNodes.length;
				nonEmptyElementsMap = dom.schema.getNonEmptyElements();
				directionLeft = start;

				if (container.nodeType == 1 && offset > container.childNodes.length - 1) {
					directionLeft = false;
				}

				// If the container is a document move it to the body element
				if (container.nodeType === 9) {
					container = dom.getRoot();
					offset = 0;
				}

				// If the container is body try move it into the closest text node or position
				if (container === body) {
					// If start is before/after a image, table etc
					if (directionLeft) {
						node = container.childNodes[offset > 0 ? offset - 1 : 0];
						if (node) {
							nodeName = node.nodeName.toLowerCase();
							if (nonEmptyElementsMap[node.nodeName] || node.nodeName == "TABLE") {
								return;
							}
						}
					}

					// Resolve the index
					if (container.hasChildNodes()) {
						offset = Math.min(!directionLeft && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1);
						container = container.childNodes[offset];
						offset = 0;

						// Don't walk into elements that doesn't have any child nodes like a IMG
						if (container.hasChildNodes() && !/TABLE/.test(container.nodeName)) {
							// Walk the DOM to find a text node to place the caret at or a BR
							node = container;
							walker = new TreeWalker(container, body);

							do {
								// Found a text node use that position
								if (node.nodeType === 3 && node.nodeValue.length > 0) {
									offset = directionLeft ? 0 : node.nodeValue.length;
									container = node;
									normalized = true;
									break;
								}

								// Found a BR/IMG element that we can place the caret before
								if (nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
									offset = dom.nodeIndex(node);
									container = node.parentNode;

									// Put caret after image when moving the end point
									if (node.nodeName ==  "IMG" && !directionLeft) {
										offset++;
									}

									normalized = true;
									break;
								}
							} while ((node = (directionLeft ? walker.next() : walker.prev())));
						}
					}
				}

				// Lean the caret to the left if possible
				if (collapsed) {
					// So this: <b>x</b><i>|x</i>
					// Becomes: <b>x|</b><i>x</i>
					// Seems that only gecko has issues with this
					if (container.nodeType === 3 && offset === 0) {
						findTextNodeRelative(true);
					}

					// Lean left into empty inline elements when the caret is before a BR
					// So this: <i><b></b><i>|<br></i>
					// Becomes: <i><b>|</b><i><br></i>
					// Seems that only gecko has issues with this.
					// Special edge case for <p><a>x</a>|<br></p> since we don't want <p><a>x|</a><br></p>
					if (container.nodeType === 1) {
						node = container.childNodes[offset];

						// Offset is after the containers last child
						// then use the previous child for normalization
						if (!node) {
							node = container.childNodes[offset - 1];
						}

						if (node && node.nodeName === 'BR' && !isPrevNode(node, 'A') &&
							!hasBrBeforeAfter(node) && !hasBrBeforeAfter(node, true)) {
							findTextNodeRelative(true, node);
						}
					}
				}

				// Lean the start of the selection right if possible
				// So this: x[<b>x]</b>
				// Becomes: x<b>[x]</b>
				if (directionLeft && !collapsed && container.nodeType === 3 && offset === container.nodeValue.length) {
					findTextNodeRelative(false);
				}

				// Set endpoint if it was normalized
				if (normalized) {
					rng['set' + (start ? 'Start' : 'End')](container, offset);
				}
			}

			collapsed = rng.collapsed;

			normalizeEndPoint(true);

			if (!collapsed) {
				normalizeEndPoint();
			}

			// If it was collapsed then make sure it still is
			if (normalized && collapsed) {
				rng.collapse(true);
			}

			return normalized;
		};
	}

	/**
	 * Compares two ranges and checks if they are equal.
	 *
	 * @static
	 * @method compareRanges
	 * @param {DOMRange} rng1 First range to compare.
	 * @param {DOMRange} rng2 First range to compare.
	 * @return {Boolean} true/false if the ranges are equal.
	 */
	RangeUtils.compareRanges = function(rng1, rng2) {
		if (rng1 && rng2) {
			// Compare native IE ranges
			if (rng1.item || rng1.duplicate) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0)) {
					return true;
				}

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1)) {
					return true;
				}
			} else {
				// Compare w3c ranges
				return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
			}
		}

		return false;
	};

	return RangeUtils;
});

// Included from: js/tinymce/classes/dom/Selection.js

/**
 * Selection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles text and control selection it's an crossbrowser utility class.
 * Consult the TinyMCE Wiki API for more details and examples on how to use this class.
 *
 * @class tinymce.dom.Selection
 * @example
 * // Getting the currently selected node for the active editor
 * alert(tinymce.activeEditor.selection.getNode().nodeName);
 */
define("tinymce/dom/Selection", [
	"tinymce/dom/TreeWalker",
	"tinymce/dom/TridentSelection",
	"tinymce/dom/ControlSelection",
	"tinymce/dom/RangeUtils",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(TreeWalker, TridentSelection, ControlSelection, RangeUtils, Env, Tools) {
	var each = Tools.each, grep = Tools.grep, trim = Tools.trim;
	var isIE = Env.ie, isOpera = Env.opera;

	/**
	 * Constructs a new selection instance.
	 *
	 * @constructor
	 * @method Selection
	 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
	 * @param {Window} win Window to bind the selection object to.
	 * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
	 */
	function Selection(dom, win, serializer, editor) {
		var self = this;

		self.dom = dom;
		self.win = win;
		self.serializer = serializer;
		self.editor = editor;

		self.controlSelection = new ControlSelection(self, editor);

		// No W3C Range support
		if (!self.win.getSelection) {
			self.tridentSel = new TridentSelection(self);
		}
	}

	Selection.prototype = {
		/**
		 * Move the selection cursor range to the specified node and offset.
		 * If there is no node specified it will move it to the first suitable location within the body.
		 *
		 * @method setCursorLocation
		 * @param {Node} node Optional node to put the cursor in.
		 * @param {Number} offset Optional offset from the start of the node to put the cursor at.
		 */
		setCursorLocation: function(node, offset) {
			var self = this, rng = self.dom.createRng();

			if (!node) {
				self._moveEndPoint(rng, self.editor.getBody(), true);
				self.setRng(rng);
			} else {
				rng.setStart(node, offset);
				rng.setEnd(node, offset);
				self.setRng(rng);
				self.collapse(false);
			}
		},

		/**
		 * Returns the selected contents using the DOM serializer passed in to this class.
		 *
		 * @method getContent
		 * @param {Object} s Optional settings class with for example output format text or html.
		 * @return {String} Selected contents in for example HTML format.
		 * @example
		 * // Alerts the currently selected contents
		 * alert(tinymce.activeEditor.selection.getContent());
		 *
		 * // Alerts the currently selected contents as plain text
		 * alert(tinymce.activeEditor.selection.getContent({format: 'text'}));
		 */
		getContent: function(args) {
			var self = this, rng = self.getRng(), tmpElm = self.dom.create("body");
			var se = self.getSel(), whiteSpaceBefore, whiteSpaceAfter, fragment;

			args = args || {};
			whiteSpaceBefore = whiteSpaceAfter = '';
			args.get = true;
			args.format = args.format || 'html';
			args.selection = true;
			self.editor.fire('BeforeGetContent', args);

			if (args.format == 'text') {
				return self.isCollapsed() ? '' : (rng.text || (se.toString ? se.toString() : ''));
			}

			if (rng.cloneContents) {
				fragment = rng.cloneContents();

				if (fragment) {
					tmpElm.appendChild(fragment);
				}
			} else if (rng.item !== undefined || rng.htmlText !== undefined) {
				// IE will produce invalid markup if elements are present that
				// it doesn't understand like custom elements or HTML5 elements.
				// Adding a BR in front of the contents and then remoiving it seems to fix it though.
				tmpElm.innerHTML = '<br>' + (rng.item ? rng.item(0).outerHTML : rng.htmlText);
				tmpElm.removeChild(tmpElm.firstChild);
			} else {
				tmpElm.innerHTML = rng.toString();
			}

			// Keep whitespace before and after
			if (/^\s/.test(tmpElm.innerHTML)) {
				whiteSpaceBefore = ' ';
			}

			if (/\s+$/.test(tmpElm.innerHTML)) {
				whiteSpaceAfter = ' ';
			}

			args.getInner = true;

			args.content = self.isCollapsed() ? '' : whiteSpaceBefore + self.serializer.serialize(tmpElm, args) + whiteSpaceAfter;
			self.editor.fire('GetContent', args);

			return args.content;
		},

		/**
		 * Sets the current selection to the specified content. If any contents is selected it will be replaced
		 * with the contents passed in to this function. If there is no selection the contents will be inserted
		 * where the caret is placed in the editor/page.
		 *
		 * @method setContent
		 * @param {String} content HTML contents to set could also be other formats depending on settings.
		 * @param {Object} args Optional settings object with for example data format.
		 * @example
		 * // Inserts some HTML contents at the current selection
		 * tinymce.activeEditor.selection.setContent('<strong>Some contents</strong>');
		 */
		setContent: function(content, args) {
			var self = this, rng = self.getRng(), caretNode, doc = self.win.document, frag, temp;

			args = args || {format: 'html'};
			args.set = true;
			args.selection = true;
			content = args.content = content;

			// Dispatch before set content event
			if (!args.no_events) {
				self.editor.fire('BeforeSetContent', args);
			}

			content = args.content;

			if (rng.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				content += '<span id="__caret">_</span>';

				// Delete and insert new node
				if (rng.startContainer == doc && rng.endContainer == doc) {
					// WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
					doc.body.innerHTML = content;
				} else {
					rng.deleteContents();

					if (doc.body.childNodes.length === 0) {
						doc.body.innerHTML = content;
					} else {
						// createContextualFragment doesn't exists in IE 9 DOMRanges
						if (rng.createContextualFragment) {
							rng.insertNode(rng.createContextualFragment(content));
						} else {
							// Fake createContextualFragment call in IE 9
							frag = doc.createDocumentFragment();
							temp = doc.createElement('div');

							frag.appendChild(temp);
							temp.outerHTML = content;

							rng.insertNode(frag);
						}
					}
				}

				// Move to caret marker
				caretNode = self.dom.get('__caret');

				// Make sure we wrap it compleatly, Opera fails with a simple select call
				rng = doc.createRange();
				rng.setStartBefore(caretNode);
				rng.setEndBefore(caretNode);
				self.setRng(rng);

				// Remove the caret position
				self.dom.remove('__caret');

				try {
					self.setRng(rng);
				} catch (ex) {
					// Might fail on Opera for some odd reason
				}
			} else {
				if (rng.item) {
					// Delete content and get caret text selection
					doc.execCommand('Delete', false, null);
					rng = self.getRng();
				}

				// Explorer removes spaces from the beginning of pasted contents
				if (/^\s+/.test(content)) {
					rng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
					self.dom.remove('__mce_tmp');
				} else {
					rng.pasteHTML(content);
				}
			}

			// Dispatch set content event
			if (!args.no_events) {
				self.editor.fire('SetContent', args);
			}
		},

		/**
		 * Returns the start element of a selection range. If the start is in a text
		 * node the parent element will be returned.
		 *
		 * @method getStart
		 * @return {Element} Start element of selection range.
		 */
		getStart: function() {
			var self = this, rng = self.getRng(), startElement, parentElement, checkRng, node;

			if (rng.duplicate || rng.item) {
				// Control selection, return first item
				if (rng.item) {
					return rng.item(0);
				}

				// Get start element
				checkRng = rng.duplicate();
				checkRng.collapse(1);
				startElement = checkRng.parentElement();
				if (startElement.ownerDocument !== self.dom.doc) {
					startElement = self.dom.getRoot();
				}

				// Check if range parent is inside the start element, then return the inner parent element
				// This will fix issues when a single element is selected, IE would otherwise return the wrong start element
				parentElement = node = rng.parentElement();
				while ((node = node.parentNode)) {
					if (node == startElement) {
						startElement = parentElement;
						break;
					}
				}

				return startElement;
			} else {
				startElement = rng.startContainer;

				if (startElement.nodeType == 1 && startElement.hasChildNodes()) {
					startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];
				}

				if (startElement && startElement.nodeType == 3) {
					return startElement.parentNode;
				}

				return startElement;
			}
		},

		/**
		 * Returns the end element of a selection range. If the end is in a text
		 * node the parent element will be returned.
		 *
		 * @method getEnd
		 * @return {Element} End element of selection range.
		 */
		getEnd: function() {
			var self = this, rng = self.getRng(), endElement, endOffset;

			if (rng.duplicate || rng.item) {
				if (rng.item) {
					return rng.item(0);
				}

				rng = rng.duplicate();
				rng.collapse(0);
				endElement = rng.parentElement();
				if (endElement.ownerDocument !== self.dom.doc) {
					endElement = self.dom.getRoot();
				}

				if (endElement && endElement.nodeName == 'BODY') {
					return endElement.lastChild || endElement;
				}

				return endElement;
			} else {
				endElement = rng.endContainer;
				endOffset = rng.endOffset;

				if (endElement.nodeType == 1 && endElement.hasChildNodes()) {
					endElement = endElement.childNodes[endOffset > 0 ? endOffset - 1 : endOffset];
				}

				if (endElement && endElement.nodeType == 3) {
					return endElement.parentNode;
				}

				return endElement;
			}
		},

		/**
		 * Returns a bookmark location for the current selection. This bookmark object
		 * can then be used to restore the selection after some content modification to the document.
		 *
		 * @method getBookmark
		 * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
		 * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
		 * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinymce.activeEditor.selection.getBookmark();
		 *
		 * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinymce.activeEditor.selection.moveToBookmark(bm);
		 */
		getBookmark: function(type, normalized) {
			var t = this, dom = t.dom, rng, rng2, id, collapsed, name, element, chr = '&#xFEFF;', styles;

			function findIndex(name, element) {
				var index = 0;

				each(dom.select(name), function(node, i) {
					if (node == element) {
						index = i;
					}
				});

				return index;
			}

			function normalizeTableCellSelection(rng) {
				function moveEndPoint(start) {
					var container, offset, childNodes, prefix = start ? 'start' : 'end';

					container = rng[prefix + 'Container'];
					offset = rng[prefix + 'Offset'];

					if (container.nodeType == 1 && container.nodeName == "TR") {
						childNodes = container.childNodes;
						container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
						if (container) {
							offset = start ? 0 : container.childNodes.length;
							rng['set' + (start ? 'Start' : 'End')](container, offset);
						}
					}
				}

				moveEndPoint(true);
				moveEndPoint();

				return rng;
			}

			function getLocation() {
				var rng = t.getRng(true), root = dom.getRoot(), bookmark = {};

				function getPoint(rng, start) {
					var container = rng[start ? 'startContainer' : 'endContainer'],
						offset = rng[start ? 'startOffset' : 'endOffset'], point = [], node, childNodes, after = 0;

					if (container.nodeType == 3) {
						if (normalized) {
							for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling) {
								offset += node.nodeValue.length;
							}
						}

						point.push(offset);
					} else {
						childNodes = container.childNodes;

						if (offset >= childNodes.length && childNodes.length) {
							after = 1;
							offset = Math.max(0, childNodes.length - 1);
						}

						point.push(t.dom.nodeIndex(childNodes[offset], normalized) + after);
					}

					for (; container && container != root; container = container.parentNode) {
						point.push(t.dom.nodeIndex(container, normalized));
					}

					return point;
				}

				bookmark.start = getPoint(rng, true);

				if (!t.isCollapsed()) {
					bookmark.end = getPoint(rng);
				}

				return bookmark;
			}

			if (type == 2) {
				element = t.getNode();
				name = element ? element.nodeName : null;

				if (name == 'IMG') {
					return {name: name, index: findIndex(name, element)};
				}

				if (t.tridentSel) {
					return t.tridentSel.getBookmark(type);
				}

				return getLocation();
			}

			// Handle simple range
			if (type) {
				return {rng: t.getRng()};
			}

			rng = t.getRng();
			id = dom.uniqueId();
			collapsed = t.isCollapsed();
			styles = 'overflow:hidden;line-height:0px';

			// Explorer method
			if (rng.duplicate || rng.item) {
				// Text selection
				if (!rng.item) {
					rng2 = rng.duplicate();

					try {
						// Insert start marker
						rng.collapse();
						rng.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

						// Insert end marker
						if (!collapsed) {
							rng2.collapse(false);

							// Detect the empty space after block elements in IE and move the
							// end back one character <p></p>] becomes <p>]</p>
							rng.moveToElementText(rng2.parentElement());
							if (rng.compareEndPoints('StartToEnd', rng2) === 0) {
								rng2.move('character', -1);
							}

							rng2.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
						}
					} catch (ex) {
						// IE might throw unspecified error so lets ignore it
						return null;
					}
				} else {
					// Control selection
					element = rng.item(0);
					name = element.nodeName;

					return {name: name, index: findIndex(name, element)};
				}
			} else {
				element = t.getNode();
				name = element.nodeName;
				if (name == 'IMG') {
					return {name: name, index: findIndex(name, element)};
				}

				// W3C method
				rng2 = normalizeTableCellSelection(rng.cloneRange());

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {'data-mce-type': "bookmark", id: id + '_end', style: styles}, chr));
				}

				rng = normalizeTableCellSelection(rng);
				rng.collapse(true);
				rng.insertNode(dom.create('span', {'data-mce-type': "bookmark", id: id + '_start', style: styles}, chr));
			}

			t.moveToBookmark({id: id, keep: 1});

			return {id: id};
		},

		/**
		 * Restores the selection to the specified bookmark.
		 *
		 * @method moveToBookmark
		 * @param {Object} bookmark Bookmark to restore selection from.
		 * @return {Boolean} true/false if it was successful or not.
		 * @example
		 * // Stores a bookmark of the current selection
		 * var bm = tinymce.activeEditor.selection.getBookmark();
		 *
		 * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
		 *
		 * // Restore the selection bookmark
		 * tinymce.activeEditor.selection.moveToBookmark(bm);
		 */
		moveToBookmark: function(bookmark) {
			var t = this, dom = t.dom, rng, root, startContainer, endContainer, startOffset, endOffset;

			function setEndPoint(start) {
				var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

				if (point) {
					offset = point[0];

					// Find container node
					for (node = root, i = point.length - 1; i >= 1; i--) {
						children = node.childNodes;

						if (point[i] > children.length - 1) {
							return;
						}

						node = children[point[i]];
					}

					// Move text offset to best suitable location
					if (node.nodeType === 3) {
						offset = Math.min(point[0], node.nodeValue.length);
					}

					// Move element offset to best suitable location
					if (node.nodeType === 1) {
						offset = Math.min(point[0], node.childNodes.length);
					}

					// Set offset within container node
					if (start) {
						rng.setStart(node, offset);
					} else {
						rng.setEnd(node, offset);
					}
				}

				return true;
			}

			function restoreEndPoint(suffix) {
				var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

				if (marker) {
					node = marker.parentNode;

					if (suffix == 'start') {
						if (!keep) {
							idx = dom.nodeIndex(marker);
						} else {
							node = marker.firstChild;
							idx = 1;
						}

						startContainer = endContainer = node;
						startOffset = endOffset = idx;
					} else {
						if (!keep) {
							idx = dom.nodeIndex(marker);
						} else {
							node = marker.firstChild;
							idx = 1;
						}

						endContainer = node;
						endOffset = idx;
					}

					if (!keep) {
						prev = marker.previousSibling;
						next = marker.nextSibling;

						// Remove all marker text nodes
						each(grep(marker.childNodes), function(node) {
							if (node.nodeType == 3) {
								node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
							}
						});

						// Remove marker but keep children if for example contents where inserted into the marker
						// Also remove duplicated instances of the marker for example by a
						// split operation or by WebKit auto split on paste feature
						while ((marker = dom.get(bookmark.id + '_' + suffix))) {
							dom.remove(marker, 1);
						}

						// If siblings are text nodes then merge them unless it's Opera since it some how removes the node
						// and we are sniffing since adding a lot of detection code for a browser with 3% of the market
						// isn't worth the effort. Sorry, Opera but it's just a fact
						if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !isOpera) {
							idx = prev.nodeValue.length;
							prev.appendData(next.nodeValue);
							dom.remove(next);

							if (suffix == 'start') {
								startContainer = endContainer = prev;
								startOffset = endOffset = idx;
							} else {
								endContainer = prev;
								endOffset = idx;
							}
						}
					}
				}
			}

			function addBogus(node) {
				// Adds a bogus BR element for empty block elements
				if (dom.isBlock(node) && !node.innerHTML && !isIE) {
					node.innerHTML = '<br data-mce-bogus="1" />';
				}

				return node;
			}

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					root = dom.getRoot();

					if (t.tridentSel) {
						return t.tridentSel.moveToBookmark(bookmark);
					}

					if (setEndPoint(true) && setEndPoint()) {
						t.setRng(rng);
					}
				} else if (bookmark.id) {
					// Restore start/end points
					restoreEndPoint('start');
					restoreEndPoint('end');

					if (startContainer) {
						rng = dom.createRng();
						rng.setStart(addBogus(startContainer), startOffset);
						rng.setEnd(addBogus(endContainer), endOffset);
						t.setRng(rng);
					}
				} else if (bookmark.name) {
					t.select(dom.select(bookmark.name)[bookmark.index]);
				} else if (bookmark.rng) {
					t.setRng(bookmark.rng);
				}
			}
		},

		/**
		 * Selects the specified element. This will place the start and end of the selection range around the element.
		 *
		 * @method select
		 * @param {Element} node HMTL DOM element to select.
		 * @param {Boolean} content Optional bool state if the contents should be selected or not on non IE browser.
		 * @return {Element} Selected element the same element as the one that got passed in.
		 * @example
		 * // Select the first paragraph in the active editor
		 * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
		 */
		select: function(node, content) {
			var self = this, dom = self.dom, rng = dom.createRng(), idx;

			// Clear stored range set by FocusManager
			self.lastFocusBookmark = null;

			if (node) {
				if (!content && self.controlSelection.controlSelect(node)) {
					return;
				}

				idx = dom.nodeIndex(node);
				rng.setStart(node.parentNode, idx);
				rng.setEnd(node.parentNode, idx + 1);

				// Find first/last text node or BR element
				if (content) {
					self._moveEndPoint(rng, node, true);
					self._moveEndPoint(rng, node);
				}

				self.setRng(rng);
			}

			return node;
		},

		/**
		 * Returns true/false if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
		 *
		 * @method isCollapsed
		 * @return {Boolean} true/false state if the selection range is collapsed or not.
		 * Collapsed means if it's a caret or a larger selection.
		 */
		isCollapsed: function() {
			var self = this, rng = self.getRng(), sel = self.getSel();

			if (!rng || rng.item) {
				return false;
			}

			if (rng.compareEndPoints) {
				return rng.compareEndPoints('StartToEnd', rng) === 0;
			}

			return !sel || rng.collapsed;
		},

		/**
		 * Collapse the selection to start or end of range.
		 *
		 * @method collapse
		 * @param {Boolean} to_start Optional boolean state if to collapse to end or not. Defaults to start.
		 */
		collapse: function(to_start) {
			var self = this, rng = self.getRng(), node;

			// Control range on IE
			if (rng.item) {
				node = rng.item(0);
				rng = self.win.document.body.createTextRange();
				rng.moveToElementText(node);
			}

			rng.collapse(!!to_start);
			self.setRng(rng);
		},

		/**
		 * Returns the browsers internal selection object.
		 *
		 * @method getSel
		 * @return {Selection} Internal browser selection object.
		 */
		getSel: function() {
			var win = this.win;

			return win.getSelection ? win.getSelection() : win.document.selection;
		},

		/**
		 * Returns the browsers internal range object.
		 *
		 * @method getRng
		 * @param {Boolean} w3c Forces a compatible W3C range on IE.
		 * @return {Range} Internal browser range object.
		 * @see http://www.quirksmode.org/dom/range_intro.html
		 * @see http://www.dotvoid.com/2001/03/using-the-range-object-in-mozilla/
		 */
		getRng: function(w3c) {
			var self = this, selection, rng, elm, doc = self.win.document, ieRng;

			function tryCompareBounderyPoints(how, sourceRange, destinationRange) {
				try {
					return sourceRange.compareBoundaryPoints(how, destinationRange);
				} catch (ex) {
					// Gecko throws wrong document exception if the range points
					// to nodes that where removed from the dom #6690
					// Browsers should mutate existing DOMRange instances so that they always point
					// to something in the document this is not the case in Gecko works fine in IE/WebKit/Blink
					// For performance reasons just return -1
					return -1;
				}
			}

			// Use last rng passed from FocusManager if it's available this enables
			// calls to editor.selection.getStart() to work when caret focus is lost on IE
			if (!w3c && self.lastFocusBookmark) {
				var bookmark = self.lastFocusBookmark;

				// Convert bookmark to range IE 11 fix
				if (bookmark.startContainer) {
					rng = doc.createRange();
					rng.setStart(bookmark.startContainer, bookmark.startOffset);
					rng.setEnd(bookmark.endContainer, bookmark.endOffset);
				} else {
					rng = bookmark;
				}

				return rng;
			}

			// Found tridentSel object then we need to use that one
			if (w3c && self.tridentSel) {
				return self.tridentSel.getRangeAt(0);
			}

			try {
				if ((selection = self.getSel())) {
					if (selection.rangeCount > 0) {
						rng = selection.getRangeAt(0);
					} else {
						rng = selection.createRange ? selection.createRange() : doc.createRange();
					}
				}
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// We have W3C ranges and it's IE then fake control selection since IE9 doesn't handle that correctly yet
			// IE 11 doesn't support the selection object so we check for that as well
			if (isIE && rng && rng.setStart && doc.selection) {
				try {
					// IE will sometimes throw an exception here
					ieRng = doc.selection.createRange();
				} catch (ex) {

				}

				if (ieRng && ieRng.item) {
					elm = ieRng.item(0);
					rng = doc.createRange();
					rng.setStartBefore(elm);
					rng.setEndAfter(elm);
				}
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!rng) {
				rng = doc.createRange ? doc.createRange() : doc.body.createTextRange();
			}

			// If range is at start of document then move it to start of body
			if (rng.setStart && rng.startContainer.nodeType === 9 && rng.collapsed) {
				elm = self.dom.getRoot();
				rng.setStart(elm, 0);
				rng.setEnd(elm, 0);
			}

			if (self.selectedRange && self.explicitRange) {
				if (tryCompareBounderyPoints(rng.START_TO_START, rng, self.selectedRange) === 0 &&
					tryCompareBounderyPoints(rng.END_TO_END, rng, self.selectedRange) === 0) {
					// Safari, Opera and Chrome only ever select text which causes the range to change.
					// This lets us use the originally set range if the selection hasn't been changed by the user.
					rng = self.explicitRange;
				} else {
					self.selectedRange = null;
					self.explicitRange = null;
				}
			}

			return rng;
		},

		/**
		 * Changes the selection to the specified DOM range.
		 *
		 * @method setRng
		 * @param {Range} rng Range to select.
		 */
		setRng: function(rng, forward) {
			var self = this, sel;

			// Is IE specific range
			if (rng.select) {
				try {
					rng.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}

				return;
			}

			if (!self.tridentSel) {
				sel = self.getSel();

				if (sel) {
					self.explicitRange = rng;

					try {
						sel.removeAllRanges();
						sel.addRange(rng);
					} catch (ex) {
						// IE might throw errors here if the editor is within a hidden container and selection is changed
					}

					// Forward is set to false and we have an extend function
					if (forward === false && sel.extend) {
						sel.collapse(rng.endContainer, rng.endOffset);
						sel.extend(rng.startContainer, rng.startOffset);
					}

					// adding range isn't always successful so we need to check range count otherwise an exception can occur
					self.selectedRange = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
				}
			} else {
				// Is W3C Range fake range on IE
				if (rng.cloneRange) {
					try {
						self.tridentSel.addRange(rng);
						return;
					} catch (ex) {
						//IE9 throws an error here if called before selection is placed in the editor
					}
				}
			}
		},

		/**
		 * Sets the current selection to the specified DOM element.
		 *
		 * @method setNode
		 * @param {Element} elm Element to set as the contents of the selection.
		 * @return {Element} Returns the element that got passed in.
		 * @example
		 * // Inserts a DOM node at current selection/caret location
		 * tinymce.activeEditor.selection.setNode(tinymce.activeEditor.dom.create('img', {src: 'some.gif', title: 'some title'}));
		 */
		setNode: function(elm) {
			var self = this;

			self.setContent(self.dom.getOuterHTML(elm));

			return elm;
		},

		/**
		 * Returns the currently selected element or the common ancestor element for both start and end of the selection.
		 *
		 * @method getNode
		 * @return {Element} Currently selected element or common ancestor element.
		 * @example
		 * // Alerts the currently selected elements node name
		 * alert(tinymce.activeEditor.selection.getNode().nodeName);
		 */
		getNode: function() {
			var self = this, rng = self.getRng(), elm;
			var startContainer = rng.startContainer, endContainer = rng.endContainer;
			var startOffset = rng.startOffset, endOffset = rng.endOffset, root = self.dom.getRoot();

			function skipEmptyTextNodes(node, forwards) {
				var orig = node;

				while (node && node.nodeType === 3 && node.length === 0) {
					node = forwards ? node.nextSibling : node.previousSibling;
				}

				return node || orig;
			}

			// Range maybe lost after the editor is made visible again
			if (!rng) {
				return root;
			}

			if (rng.setStart) {
				elm = rng.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!rng.collapsed) {
					if (startContainer == endContainer) {
						if (endOffset - startOffset < 2) {
							if (startContainer.hasChildNodes()) {
								elm = startContainer.childNodes[startOffset];
							}
						}
					}

					// If the anchor node is a element instead of a text node then return this element
					//if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1)
					//	return sel.anchorNode.childNodes[sel.anchorOffset];

					// Handle cases where the selection is immediately wrapped around a node and return that node instead of it's parent.
					// This happens when you double click an underlined word in FireFox.
					if (startContainer.nodeType === 3 && endContainer.nodeType === 3) {
						if (startContainer.length === startOffset) {
							startContainer = skipEmptyTextNodes(startContainer.nextSibling, true);
						} else {
							startContainer = startContainer.parentNode;
						}

						if (endOffset === 0) {
							endContainer = skipEmptyTextNodes(endContainer.previousSibling, false);
						} else {
							endContainer = endContainer.parentNode;
						}

						if (startContainer && startContainer === endContainer) {
							return startContainer;
						}
					}
				}

				if (elm && elm.nodeType == 3) {
					return elm.parentNode;
				}

				return elm;
			}

			elm = rng.item ? rng.item(0) : rng.parentElement();

			// IE 7 might return elements outside the iframe
			if (elm.ownerDocument !== self.win.document) {
				elm = root;
			}

			return elm;
		},

		getSelectedBlocks: function(startElm, endElm) {
			var self = this, dom = self.dom, node, root, selectedBlocks = [];

			root = dom.getRoot();
			startElm = dom.getParent(startElm || self.getStart(), dom.isBlock);
			endElm = dom.getParent(endElm || self.getEnd(), dom.isBlock);

			if (startElm && startElm != root) {
				selectedBlocks.push(startElm);
			}

			if (startElm && endElm && startElm != endElm) {
				node = startElm;

				var walker = new TreeWalker(startElm, root);
				while ((node = walker.next()) && node != endElm) {
					if (dom.isBlock(node)) {
						selectedBlocks.push(node);
					}
				}
			}

			if (endElm && startElm != endElm && endElm != root) {
				selectedBlocks.push(endElm);
			}

			return selectedBlocks;
		},

		isForward: function() {
			var dom = this.dom, sel = this.getSel(), anchorRange, focusRange;

			// No support for selection direction then always return true
			if (!sel || !sel.anchorNode || !sel.focusNode) {
				return true;
			}

			anchorRange = dom.createRng();
			anchorRange.setStart(sel.anchorNode, sel.anchorOffset);
			anchorRange.collapse(true);

			focusRange = dom.createRng();
			focusRange.setStart(sel.focusNode, sel.focusOffset);
			focusRange.collapse(true);

			return anchorRange.compareBoundaryPoints(anchorRange.START_TO_START, focusRange) <= 0;
		},

		normalize: function() {
			var self = this, rng = self.getRng();

			if (!isIE && new RangeUtils(self.dom).normalize(rng)) {
				self.setRng(rng, self.isForward());
			}

			return rng;
		},

		/**
		 * Executes callback of the current selection matches the specified selector or not and passes the state and args to the callback.
		 *
		 * @method selectorChanged
		 * @param {String} selector CSS selector to check for.
		 * @param {function} callback Callback with state and args when the selector is matches or not.
		 */
		selectorChanged: function(selector, callback) {
			var self = this, currentSelectors;

			if (!self.selectorChangedData) {
				self.selectorChangedData = {};
				currentSelectors = {};

				self.editor.on('NodeChange', function(e) {
					var node = e.element, dom = self.dom, parents = dom.getParents(node, null, dom.getRoot()), matchedSelectors = {};

					// Check for new matching selectors
					each(self.selectorChangedData, function(callbacks, selector) {
						each(parents, function(node) {
							if (dom.is(node, selector)) {
								if (!currentSelectors[selector]) {
									// Execute callbacks
									each(callbacks, function(callback) {
										callback(true, {node: node, selector: selector, parents: parents});
									});

									currentSelectors[selector] = callbacks;
								}

								matchedSelectors[selector] = callbacks;
								return false;
							}
						});
					});

					// Check if current selectors still match
					each(currentSelectors, function(callbacks, selector) {
						if (!matchedSelectors[selector]) {
							delete currentSelectors[selector];

							each(callbacks, function(callback) {
								callback(false, {node: node, selector: selector, parents: parents});
							});
						}
					});
				});
			}

			// Add selector listeners
			if (!self.selectorChangedData[selector]) {
				self.selectorChangedData[selector] = [];
			}

			self.selectorChangedData[selector].push(callback);

			return self;
		},

		getScrollContainer: function() {
			var scrollContainer, node = this.dom.getRoot();

			while (node && node.nodeName != 'BODY') {
				if (node.scrollHeight > node.clientHeight) {
					scrollContainer = node;
					break;
				}

				node = node.parentNode;
			}

			return scrollContainer;
		},

		scrollIntoView: function(elm) {
			var y, viewPort, self = this, dom = self.dom, root = dom.getRoot(), viewPortY, viewPortH;

			function getPos(elm) {
				var x = 0, y = 0;

				var offsetParent = elm;
				while (offsetParent && offsetParent.nodeType) {
					x += offsetParent.offsetLeft || 0;
					y += offsetParent.offsetTop || 0;
					offsetParent = offsetParent.offsetParent;
				}

				return {x: x, y: y};
			}

			if (root.nodeName != 'BODY') {
				var scrollContainer = self.getScrollContainer();
				if (scrollContainer) {
					y = getPos(elm).y - getPos(scrollContainer).y;
					viewPortH = scrollContainer.clientHeight;
					viewPortY = scrollContainer.scrollTop;
					if (y < viewPortY || y + 25 > viewPortY + viewPortH) {
						scrollContainer.scrollTop = y < viewPortY ? y : y - viewPortH + 25;
					}

					return;
				}
			}

			viewPort = dom.getViewPort(self.editor.getWin());
			y = dom.getPos(elm).y;
			viewPortY = viewPort.y;
			viewPortH = viewPort.h;
			if (y < viewPort.y || y + 25 > viewPortY + viewPortH) {
				self.editor.getWin().scrollTo(0, y < viewPortY ? y : y - viewPortH + 25);
			}
		},

		_moveEndPoint: function(rng, node, start) {
			var root = node, walker = new TreeWalker(node, root);
			var nonEmptyElementsMap = this.dom.schema.getNonEmptyElements();

			do {
				// Text node
				if (node.nodeType == 3 && trim(node.nodeValue).length !== 0) {
					if (start) {
						rng.setStart(node, 0);
					} else {
						rng.setEnd(node, node.nodeValue.length);
					}

					return;
				}

				// BR/IMG/INPUT elements
				if (nonEmptyElementsMap[node.nodeName]) {
					if (start) {
						rng.setStartBefore(node);
					} else {
						if (node.nodeName == 'BR') {
							rng.setEndBefore(node);
						} else {
							rng.setEndAfter(node);
						}
					}

					return;
				}

				// Found empty text block old IE can place the selection inside those
				if (Env.ie && Env.ie < 11 && this.dom.isBlock(node) && this.dom.isEmpty(node)) {
					if (start) {
						rng.setStart(node, 0);
					} else {
						rng.setEnd(node, 0);
					}

					return;
				}
			} while ((node = (start ? walker.next() : walker.prev())));

			// Failed to find any text node or other suitable location then move to the root of body
			if (root.nodeName == 'BODY') {
				if (start) {
					rng.setStart(root, 0);
				} else {
					rng.setEnd(root, root.childNodes.length);
				}
			}
		},

		destroy: function() {
			this.win = null;
			this.controlSelection.destroy();
		}
	};

	return Selection;
});

// Included from: js/tinymce/classes/Formatter.js

/**
 * Formatter.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Text formatter engine class. This class is used to apply formats like bold, italic, font size
 * etc to the current selection or specific nodes. This engine was build to replace the browsers
 * default formatting logic for execCommand due to it's inconsistent and buggy behavior.
 *
 * @class tinymce.Formatter
 * @example
 *  tinymce.activeEditor.formatter.register('mycustomformat', {
 *    inline: 'span',
 *    styles: {color: '#ff0000'}
 *  });
 *
 *  tinymce.activeEditor.formatter.apply('mycustomformat');
 */
define("tinymce/Formatter", [
	"tinymce/dom/TreeWalker",
	"tinymce/dom/RangeUtils",
	"tinymce/util/Tools"
], function(TreeWalker, RangeUtils, Tools) {
	/**
	 * Constructs a new formatter instance.
	 *
	 * @constructor Formatter
	 * @param {tinymce.Editor} ed Editor instance to construct the formatter engine to.
	 */
	return function(ed) {
		var formats = {},
			dom = ed.dom,
			selection = ed.selection,
			rangeUtils = new RangeUtils(dom),
			isValid = ed.schema.isValidChild,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			MCE_ATTR_RE = /^(src|href|style)$/,
			FALSE = false,
			TRUE = true,
			formatChangeData,
			undef,
			getContentEditable = dom.getContentEditable,
			disableCaretContainer,
			markCaretContainersBogus;

		var each = Tools.each,
			grep = Tools.grep,
			walk = Tools.walk,
			extend = Tools.extend;

		function isTextBlock(name) {
			if (name.nodeType) {
				name = name.nodeName;
			}

			return !!ed.schema.getTextBlockElements()[name.toLowerCase()];
		}

		function getParents(node, selector) {
			return dom.getParents(node, selector, dom.getRoot());
		}

		function isCaretNode(node) {
			return node.nodeType === 1 && node.id === '_mce_caret';
		}

		function defaultFormats() {
			register({
				alignleft: [
					{selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li', styles: {textAlign: 'left'}, defaultBlock: 'div'},
					{selector: 'img,table', collapsed: false, styles: {'float': 'left'}}
				],

				aligncenter: [
					{selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li', styles: {textAlign: 'center'}, defaultBlock: 'div'},
					{selector: 'img', collapsed: false, styles: {display: 'block', marginLeft: 'auto', marginRight: 'auto'}},
					{selector: 'table', collapsed: false, styles: {marginLeft: 'auto', marginRight: 'auto'}}
				],

				alignright: [
					{selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li', styles: {textAlign: 'right'}, defaultBlock: 'div'},
					{selector: 'img,table', collapsed: false, styles: {'float': 'right'}}
				],

				alignjustify: [
					{selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li', styles: {textAlign: 'justify'}, defaultBlock: 'div'}
				],

				bold: [
					{inline: 'strong', remove: 'all'},
					{inline: 'span', styles: {fontWeight: 'bold'}},
					{inline: 'b', remove: 'all'}
				],

				italic: [
					{inline: 'em', remove: 'all'},
					{inline: 'span', styles: {fontStyle: 'italic'}},
					{inline: 'i', remove: 'all'}
				],

				underline: [
					{inline: 'span', styles: {textDecoration: 'underline'}, exact: true},
					{inline: 'u', remove: 'all'}
				],

				strikethrough: [
					{inline: 'span', styles: {textDecoration: 'line-through'}, exact: true},
					{inline: 'strike', remove: 'all'}
				],

				forecolor: {inline: 'span', styles: {color: '%value'}, wrap_links: false},
				hilitecolor: {inline: 'span', styles: {backgroundColor: '%value'}, wrap_links: false},
				fontname: {inline: 'span', styles: {fontFamily: '%value'}},
				fontsize: {inline: 'span', styles: {fontSize: '%value'}},
				fontsize_class: {inline: 'span', attributes: {'class': '%value'}},
				blockquote: {block: 'blockquote', wrapper: 1, remove: 'all'},
				subscript: {inline: 'sub'},
				superscript: {inline: 'sup'},
				code: {inline: 'code'},

				link: {inline: 'a', selector: 'a', remove: 'all', split: true, deep: true,
					onmatch: function() {
						return true;
					},

					onformat: function(elm, fmt, vars) {
						each(vars, function(value, key) {
							dom.setAttrib(elm, key, value);
						});
					}
				},

				removeformat: [
					{
						selector: 'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q',
						remove: 'all',
						split: true,
						expand: false,
						block_expand: true,
						deep: true
					},
					{selector: 'span', attributes: ['style', 'class'], remove: 'empty', split: true, expand: false, deep: true},
					{selector: '*', attributes: ['style', 'class'], split: false, expand: false, deep: true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div dt dd samp'.split(/\s/), function(name) {
				register(name, {block: name, remove: 'all'});
			});

			// Register user defined formats
			register(ed.settings.formats);
		}

		function addKeyboardShortcuts() {
			// Add some inline shortcuts
			ed.addShortcut('ctrl+b', 'bold_desc', 'Bold');
			ed.addShortcut('ctrl+i', 'italic_desc', 'Italic');
			ed.addShortcut('ctrl+u', 'underline_desc', 'Underline');

			// BlockFormat shortcuts keys
			for (var i = 1; i <= 6; i++) {
				ed.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);
			}

			ed.addShortcut('ctrl+7', '', ['FormatBlock', false, 'p']);
			ed.addShortcut('ctrl+8', '', ['FormatBlock', false, 'div']);
			ed.addShortcut('ctrl+9', '', ['FormatBlock', false, 'address']);
		}

		// Public functions

		/**
		 * Returns the format by name or all formats if no name is specified.
		 *
		 * @method get
		 * @param {String} name Optional name to retrive by.
		 * @return {Array/Object} Array/Object with all registred formats or a specific format.
		 */
		function get(name) {
			return name ? formats[name] : formats;
		}

		/**
		 * Registers a specific format by name.
		 *
		 * @method register
		 * @param {Object/String} name Name of the format for example "bold".
		 * @param {Object/Array} format Optional format object or array of format variants
		 * can only be omitted if the first arg is an object.
		 */
		function register(name, format) {
			if (name) {
				if (typeof(name) !== 'string') {
					each(name, function(format, name) {
						register(name, format);
					});
				} else {
					// Force format into array and add it to internal collection
					format = format.length ? format : [format];

					each(format, function(format) {
						// Set deep to false by default on selector formats this to avoid removing
						// alignment on images inside paragraphs when alignment is changed on paragraphs
						if (format.deep === undef) {
							format.deep = !format.selector;
						}

						// Default to true
						if (format.split === undef) {
							format.split = !format.selector || format.inline;
						}

						// Default to true
						if (format.remove === undef && format.selector && !format.inline) {
							format.remove = 'none';
						}

						// Mark format as a mixed format inline + block level
						if (format.selector && format.inline) {
							format.mixed = true;
							format.block_expand = true;
						}

						// Split classes if needed
						if (typeof(format.classes) === 'string') {
							format.classes = format.classes.split(/\s+/);
						}
					});

					formats[name] = format;
				}
			}
		}

		function getTextDecoration(node) {
			var decoration;

			ed.dom.getParent(node, function(n) {
				decoration = ed.dom.getStyle(n, 'text-decoration');
				return decoration && decoration !== 'none';
			});

			return decoration;
		}

		function processUnderlineAndColor(node) {
			var textDecoration;
			if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
				textDecoration = getTextDecoration(node.parentNode);
				if (ed.dom.getStyle(node, 'color') && textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', textDecoration);
				} else if (ed.dom.getStyle(node, 'textdecoration') === textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', null);
				}
			}
		}

		/**
		 * Applies the specified format to the current selection or specified node.
		 *
		 * @method apply
		 * @param {String} name Name of format to apply.
		 * @param {Object} vars Optional list of variables to replace within format before applying it.
		 * @param {Node} node Optional node to apply the format to defaults to current selection.
		 */
		function apply(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, isCollapsed = !node && selection.isCollapsed();

			function setElementFormat(elm, fmt) {
				fmt = fmt || format;

				if (elm) {
					if (fmt.onformat) {
						fmt.onformat(elm, fmt, vars, node);
					}

					each(fmt.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(fmt.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(fmt.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value)) {
							dom.addClass(elm, value);
						}
					});
				}
			}

			function adjustSelectionToVisibleSelection() {
				function findSelectionEnd(start, end) {
					var walker = new TreeWalker(end);
					for (node = walker.current(); node; node = walker.prev()) {
						if (node.childNodes.length > 1 || node == start || node.tagName == 'BR') {
							return node;
						}
					}
				}

				// Adjust selection so that a end container with a end offset of zero is not included in the selection
				// as this isn't visible to the user.
				var rng = ed.selection.getRng();
				var start = rng.startContainer;
				var end = rng.endContainer;

				if (start != end && rng.endOffset === 0) {
					var newEnd = findSelectionEnd(start, end);
					var endOffset = newEnd.nodeType == 3 ? newEnd.length : newEnd.childNodes.length;

					rng.setEnd(newEnd, endOffset);
				}

				return rng;
			}

			function applyStyleToList(node, bookmark, wrapElm, newWrappers, process){
				var nodes = [], listIndex = -1, list, startIndex = -1, endIndex = -1, currentWrapElm;

				// find the index of the first child list.
				each(node.childNodes, function(n, index) {
					if (n.nodeName === "UL" || n.nodeName === "OL") {
						listIndex = index;
						list = n;
						return false;
					}
				});

				// get the index of the bookmarks
				each(node.childNodes, function(n, index) {
					if (n.nodeName === "SPAN" && dom.getAttrib(n, "data-mce-type") == "bookmark") {
						if (n.id == bookmark.id + "_start") {
							startIndex = index;
						} else if (n.id == bookmark.id + "_end") {
							endIndex = index;
						}
					}
				});

				// if the selection spans across an embedded list, or there isn't an embedded list - handle processing normally
				if (listIndex <= 0 || (startIndex < listIndex && endIndex > listIndex)) {
					each(grep(node.childNodes), process);
					return 0;
				} else {
					currentWrapElm = dom.clone(wrapElm, FALSE);

					// create a list of the nodes on the same side of the list as the selection
					each(grep(node.childNodes), function(n, index) {
						if ((startIndex < listIndex && index < listIndex) || (startIndex > listIndex && index > listIndex)) {
							nodes.push(n);
							n.parentNode.removeChild(n);
						}
					});

					// insert the wrapping element either before or after the list.
					if (startIndex < listIndex) {
						node.insertBefore(currentWrapElm, list);
					} else if (startIndex > listIndex) {
						node.insertBefore(currentWrapElm, list.nextSibling);
					}

					// add the new nodes to the list.
					newWrappers.push(currentWrapElm);

					each(nodes, function(node) {
						currentWrapElm.appendChild(node);
					});

					return currentWrapElm;
				}
			}

			function applyRngStyle(rng, bookmark, node_specific) {
				var newWrappers = [], wrapName, wrapElm, contentEditable = true;

				// Setup wrapper element
				wrapName = format.inline || format.block;
				wrapElm = dom.create(wrapName);
				setElementFormat(wrapElm);

				rangeUtils.walk(rng, function(nodes) {
					var currentWrapElm;

					/**
					 * Process a list of nodes wrap them.
					 */
					function process(node) {
						var nodeName, parentName, found, hasContentEditableState, lastContentEditable;

						lastContentEditable = contentEditable;
						nodeName = node.nodeName.toLowerCase();
						parentName = node.parentNode.nodeName.toLowerCase();

						// Node has a contentEditable value
						if (node.nodeType === 1 && getContentEditable(node)) {
							lastContentEditable = contentEditable;
							contentEditable = getContentEditable(node) === "true";
							hasContentEditableState = true; // We don't want to wrap the container only it's children
						}

						// Stop wrapping on br elements
						if (isEq(nodeName, 'br')) {
							currentWrapElm = 0;

							// Remove any br elements when we wrap things
							if (format.block) {
								dom.remove(node);
							}

							return;
						}

						// If node is wrapper type
						if (format.wrapper && matchNode(node, name, vars)) {
							currentWrapElm = 0;
							return;
						}

						// Can we rename the block
						// TODO: Break this if up, too complex
						if (contentEditable && !hasContentEditableState && format.block &&
							!format.wrapper && isTextBlock(nodeName) && isValid(parentName, wrapName)) {
							node = dom.rename(node, wrapName);
							setElementFormat(node);
							newWrappers.push(node);
							currentWrapElm = 0;
							return;
						}

						// Handle selector patterns
						if (format.selector) {
							// Look for matching formats
							each(formatList, function(format) {
								// Check collapsed state if it exists
								if ('collapsed' in format && format.collapsed !== isCollapsed) {
									return;
								}

								if (dom.is(node, format.selector) && !isCaretNode(node)) {
									setElementFormat(node, format);
									found = true;
								}
							});

							// Continue processing if a selector match wasn't found and a inline element is defined
							if (!format.inline || found) {
								currentWrapElm = 0;
								return;
							}
						}

						// Is it valid to wrap this item
						// TODO: Break this if up, too complex
						if (contentEditable && !hasContentEditableState && isValid(wrapName, nodeName) && isValid(parentName, wrapName) &&
								!(!node_specific && node.nodeType === 3 &&
								node.nodeValue.length === 1 &&
								node.nodeValue.charCodeAt(0) === 65279) &&
								!isCaretNode(node) &&
								(!format.inline || !isBlock(node))) {
							// Start wrapping
							if (!currentWrapElm) {
								// Wrap the node
								currentWrapElm = dom.clone(wrapElm, FALSE);
								node.parentNode.insertBefore(currentWrapElm, node);
								newWrappers.push(currentWrapElm);
							}

							currentWrapElm.appendChild(node);
						} else if (nodeName == 'li' && bookmark) {
							// Start wrapping - if we are in a list node and have a bookmark, then
							// we will always begin by wrapping in a new element.
							currentWrapElm = applyStyleToList(node, bookmark, wrapElm, newWrappers, process);
						} else {
							// Start a new wrapper for possible children
							currentWrapElm = 0;

							each(grep(node.childNodes), process);

							if (hasContentEditableState) {
								contentEditable = lastContentEditable; // Restore last contentEditable state from stack
							}

							// End the last wrapper
							currentWrapElm = 0;
						}
					}

					// Process siblings from range
					each(nodes, process);
				});

				// Wrap links inside as well, for example color inside a link when the wrapper is around the link
				if (format.wrap_links === false) {
					each(newWrappers, function(node) {
						function process(node) {
							var i, currentWrapElm, children;

							if (node.nodeName === 'A') {
								currentWrapElm = dom.clone(wrapElm, FALSE);
								newWrappers.push(currentWrapElm);

								children = grep(node.childNodes);
								for (i = 0; i < children.length; i++) {
									currentWrapElm.appendChild(children[i]);
								}

								node.appendChild(currentWrapElm);
							}

							each(grep(node.childNodes), process);
						}

						process(node);
					});
				}

				// Cleanup
				each(newWrappers, function(node) {
					var childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (!isWhiteSpaceNode(node) && !isBookmarkNode(node)) {
								count++;
							}
						});

						return count;
					}

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1 && !isBookmarkNode(node) && !isCaretNode(node)) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && !isBookmarkNode(child) && matchName(child, format)) {
							clone = dom.clone(child, FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);
						}

						return clone || node;
					}

					childCount = getChildCount(node);

					// Remove empty nodes but only if there is multiple wrappers and they are not block
					// elements so never remove single <h1></h1> since that would remove the
					// currrent empty block element where the caret is at
					if ((newWrappers.length > 1 || !isBlock(node)) && childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (format.inline || format.wrapper) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!format.exact && childCount === 1) {
							node = mergeStyles(node);
						}

						// Remove/merge children
						each(formatList, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								var parent;

								if (isBookmarkNode(child)) {
									return;
								}

								// When wrap_links is set to false we don't want
								// to remove the format on children within links
								if (format.wrap_links === false) {
									parent = child.parentNode;

									do {
										if (parent.nodeName === 'A') {
											return;
										}
									} while ((parent = parent.parentNode));
								}

								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Remove child if direct parent is of same type
						if (matchNode(node.parentNode, name, vars)) {
							dom.remove(node, 1);
							node = 0;
							return TRUE;
						}

						// Look for parent with similar style format
						if (format.merge_with_parents) {
							dom.getParent(node.parentNode, function(parent) {
								if (matchNode(parent, name, vars)) {
									dom.remove(node, 1);
									node = 0;
									return TRUE;
								}
							});
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						if (node && format.merge_siblings !== false) {
							node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
							node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
						}
					}
				});
			}

			if (format) {
				if (node) {
					if (node.nodeType) {
						rng = dom.createRng();
						rng.setStartBefore(node);
						rng.setEndAfter(node);
						applyRngStyle(expandRng(rng, formatList), null, true);
					} else {
						applyRngStyle(node, null, true);
					}
				} else {
					if (!isCollapsed || !format.inline || dom.select('td.mce-item-selected,th.mce-item-selected').length) {
						// Obtain selection node before selection is unselected by applyRngStyle()
						var curSelNode = ed.selection.getNode();

						// If the formats have a default block and we can't find a parent block then
						// start wrapping it with a DIV this is for forced_root_blocks: false
						// It's kind of a hack but people should be using the default block type P since all desktop editors work that way
						if (!forcedRootBlock && formatList[0].defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
							apply(formatList[0].defaultBlock);
						}

						// Apply formatting to selection
						ed.selection.setRng(adjustSelectionToVisibleSelection());
						bookmark = selection.getBookmark();
						applyRngStyle(expandRng(selection.getRng(TRUE), formatList), bookmark);

						// Colored nodes should be underlined so that the color of the underline matches the text color.
						if (format.styles && (format.styles.color || format.styles.textDecoration)) {
							walk(curSelNode, processUnderlineAndColor, 'childNodes');
							processUnderlineAndColor(curSelNode);
						}

						selection.moveToBookmark(bookmark);
						moveStart(selection.getRng(TRUE));
						ed.nodeChanged();
					} else {
						performCaretAction('apply', name, vars);
					}
				}
			}
		}

		/**
		 * Removes the specified format from the current selection or specified node.
		 *
		 * @method remove
		 * @param {String} name Name of format to remove.
		 * @param {Object} vars Optional list of variables to replace within format before removing it.
		 * @param {Node/Range} node Optional node or DOM range to remove the format from defaults to current selection.
		 */
		function remove(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, contentEditable = true;

			// Merges the styles for each node
			function process(node) {
				var children, i, l, lastContentEditable, hasContentEditableState;

				// Node has a contentEditable value
				if (node.nodeType === 1 && getContentEditable(node)) {
					lastContentEditable = contentEditable;
					contentEditable = getContentEditable(node) === "true";
					hasContentEditableState = true; // We don't want to wrap the container only it's children
				}

				// Grab the children first since the nodelist might be changed
				children = grep(node.childNodes);

				// Process current node
				if (contentEditable && !hasContentEditableState) {
					for (i = 0, l = formatList.length; i < l; i++) {
						if (removeFormat(formatList[i], vars, node, node)) {
							break;
						}
					}
				}

				// Process the children
				if (format.deep) {
					if (children.length) {
						for (i = 0, l = children.length; i < l; i++) {
							process(children[i]);
						}

						if (hasContentEditableState) {
							contentEditable = lastContentEditable; // Restore last contentEditable state from stack
						}
					}
				}
			}

			function findFormatRoot(container) {
				var formatRoot;

				// Find format root
				each(getParents(container.parentNode).reverse(), function(parent) {
					var format;

					// Find format root element
					if (!formatRoot && parent.id != '_start' && parent.id != '_end') {
						// Is the node matching the format we are looking for
						format = matchNode(parent, name, vars);
						if (format && format.split !== false) {
							formatRoot = parent;
						}
					}
				});

				return formatRoot;
			}

			function wrapAndSplit(format_root, container, target, split) {
				var parent, clone, lastClone, firstClone, i, formatRootParent;

				// Format root found then clone formats and split it
				if (format_root) {
					formatRootParent = format_root.parentNode;

					for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
						clone = dom.clone(parent, FALSE);

						for (i = 0; i < formatList.length; i++) {
							if (removeFormat(formatList[i], vars, clone, clone)) {
								clone = 0;
								break;
							}
						}

						// Build wrapper node
						if (clone) {
							if (lastClone) {
								clone.appendChild(lastClone);
							}

							if (!firstClone) {
								firstClone = clone;
							}

							lastClone = clone;
						}
					}

					// Never split block elements if the format is mixed
					if (split && (!format.mixed || !isBlock(format_root))) {
						container = dom.split(format_root, container);
					}

					// Wrap container in cloned formats
					if (lastClone) {
						target.parentNode.insertBefore(lastClone, target);
						firstClone.appendChild(target);
					}
				}

				return container;
			}

			function splitToFormatRoot(container) {
				return wrapAndSplit(findFormatRoot(container), container, container, true);
			}

			function unwrap(start) {
				var node = dom.get(start ? '_start' : '_end'),
					out = node[start ? 'firstChild' : 'lastChild'];

				// If the end is placed within the start the result will be removed
				// So this checks if the out node is a bookmark node if it is it
				// checks for another more suitable node
				if (isBookmarkNode(out)) {
					out = out[start ? 'firstChild' : 'lastChild'];
				}

				dom.remove(node, true);

				return out;
			}

			function removeRngStyle(rng) {
				var startContainer, endContainer;
				var commonAncestorContainer = rng.commonAncestorContainer;

				rng = expandRng(rng, formatList, TRUE);

				if (format.split) {
					startContainer = getContainer(rng, TRUE);
					endContainer = getContainer(rng);

					if (startContainer != endContainer) {
						// WebKit will render the table incorrectly if we wrap a TH or TD in a SPAN
						// so let's see if we can use the first child instead
						// This will happen if you triple click a table cell and use remove formatting
						if (/^(TR|TH|TD)$/.test(startContainer.nodeName) && startContainer.firstChild) {
							if (startContainer.nodeName == "TR") {
								startContainer = startContainer.firstChild.firstChild || startContainer;
							} else {
								startContainer = startContainer.firstChild || startContainer;
							}
						}

						// Try to adjust endContainer as well if cells on the same row were selected - bug #6410
						if (commonAncestorContainer &&
							/^T(HEAD|BODY|FOOT|R)$/.test(commonAncestorContainer.nodeName) &&
							/^(TH|TD)$/.test(endContainer.nodeName) && endContainer.firstChild) {
							endContainer = endContainer.firstChild || endContainer;
						}

						// Wrap start/end nodes in span element since these might be cloned/moved
						startContainer = wrap(startContainer, 'span', {id: '_start', 'data-mce-type': 'bookmark'});
						endContainer = wrap(endContainer, 'span', {id: '_end', 'data-mce-type': 'bookmark'});

						// Split start/end
						splitToFormatRoot(startContainer);
						splitToFormatRoot(endContainer);

						// Unwrap start/end to get real elements again
						startContainer = unwrap(TRUE);
						endContainer = unwrap();
					} else {
						startContainer = endContainer = splitToFormatRoot(startContainer);
					}

					// Update range positions since they might have changed after the split operations
					rng.startContainer = startContainer.parentNode;
					rng.startOffset = nodeIndex(startContainer);
					rng.endContainer = endContainer.parentNode;
					rng.endOffset = nodeIndex(endContainer) + 1;
				}

				// Remove items between start/end
				rangeUtils.walk(rng, function(nodes) {
					each(nodes, function(node) {
						process(node);

						// Remove parent span if it only contains text-decoration: underline, yet a parent node is also underlined.
						if (node.nodeType === 1 && ed.dom.getStyle(node, 'text-decoration') === 'underline' &&
							node.parentNode && getTextDecoration(node.parentNode) === 'underline') {
							removeFormat({
								'deep': false,
								'exact': true,
								'inline': 'span',
								'styles': {
									'textDecoration': 'underline'
								}
							}, null, node);
						}
					});
				});
			}

			// Handle node
			if (node) {
				if (node.nodeType) {
					rng = dom.createRng();
					rng.setStartBefore(node);
					rng.setEndAfter(node);
					removeRngStyle(rng);
				} else {
					removeRngStyle(node);
				}

				return;
			}

			if (!selection.isCollapsed() || !format.inline || dom.select('td.mce-item-selected,th.mce-item-selected').length) {
				bookmark = selection.getBookmark();
				removeRngStyle(selection.getRng(TRUE));
				selection.moveToBookmark(bookmark);

				// Check if start element still has formatting then we are at: "<b>text|</b>text"
				// and need to move the start into the next text node
				if (format.inline && match(name, vars, selection.getStart())) {
					moveStart(selection.getRng(true));
				}

				ed.nodeChanged();
			} else {
				performCaretAction('remove', name, vars);
			}
		}

		/**
		 * Toggles the specified format on/off.
		 *
		 * @method toggle
		 * @param {String} name Name of format to apply/remove.
		 * @param {Object} vars Optional list of variables to replace within format before applying/removing it.
		 * @param {Node} node Optional node to apply the format to or remove from. Defaults to current selection.
		 */
		function toggle(name, vars, node) {
			var fmt = get(name);

			if (match(name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
				remove(name, vars, node);
			} else {
				apply(name, vars, node);
			}
		}

		/**
		 * Return true/false if the specified node has the specified format.
		 *
		 * @method matchNode
		 * @param {Node} node Node to check the format on.
		 * @param {String} name Format name to check.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Boolean} similar Match format that has similar properties.
		 * @return {Object} Returns the format object it matches or undefined if it doesn't match.
		 */
		function matchNode(node, name, vars, similar) {
			var formatList = get(name), format, i, classes;

			function matchItems(node, format, item_name) {
				var key, value, items = format[item_name], i;

				// Custom match
				if (format.onmatch) {
					return format.onmatch(node, format, item_name);
				}

				// Check all items
				if (items) {
					// Non indexed object
					if (items.length === undef) {
						for (key in items) {
							if (items.hasOwnProperty(key)) {
								if (item_name === 'attributes') {
									value = dom.getAttrib(node, key);
								} else {
									value = getStyle(node, key);
								}

								if (similar && !value && !format.exact) {
									return;
								}

								if ((!similar || format.exact) && !isEq(value, normalizeStyleValue(replaceVars(items[key], vars), key))) {
									return;
								}
							}
						}
					} else {
						// Only one match needed for indexed arrays
						for (i = 0; i < items.length; i++) {
							if (item_name === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i])) {
								return format;
							}
						}
					}
				}

				return format;
			}

			if (formatList && node) {
				// Check each format in list
				for (i = 0; i < formatList.length; i++) {
					format = formatList[i];

					// Name name, attributes, styles and classes
					if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
						// Match classes
						if ((classes = format.classes)) {
							for (i = 0; i < classes.length; i++) {
								if (!dom.hasClass(node, classes[i])) {
									return;
								}
							}
						}

						return format;
					}
				}
			}
		}

		/**
		 * Matches the current selection or specified node against the specified format name.
		 *
		 * @method match
		 * @param {String} name Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Node} node Optional node to check.
		 * @return {boolean} true/false if the specified selection/node matches the format.
		 */
		function match(name, vars, node) {
			var startNode;

			function matchParents(node) {
				var root = dom.getRoot();

				if (node === root) {
					return false;
				}

				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return node.parentNode === root || !!matchNode(node, name, vars, true);
				});

				// Do an exact check on the similar format element
				return matchNode(node, name, vars);
			}

			// Check specified node
			if (node) {
				return matchParents(node);
			}

			// Check selected node
			node = selection.getNode();
			if (matchParents(node)) {
				return TRUE;
			}

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matchParents(startNode)) {
					return TRUE;
				}
			}

			return FALSE;
		}

		/**
		 * Matches the current selection against the array of formats and returns a new array with matching formats.
		 *
		 * @method matchAll
		 * @param {Array} names Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @return {Array} Array with matched formats.
		 */
		function matchAll(names, vars) {
			var startElement, matchedFormatNames = [], checkedMap = {};

			// Check start of selection for formats
			startElement = selection.getStart();
			dom.getParent(startElement, function(node) {
				var i, name;

				for (i = 0; i < names.length; i++) {
					name = names[i];

					if (!checkedMap[name] && matchNode(node, name, vars)) {
						checkedMap[name] = true;
						matchedFormatNames.push(name);
					}
				}
			}, dom.getRoot());

			return matchedFormatNames;
		}

		/**
		 * Returns true/false if the specified format can be applied to the current selection or not. It
		 * will currently only check the state for selector formats, it returns true on all other format types.
		 *
		 * @method canApply
		 * @param {String} name Name of format to check.
		 * @return {boolean} true/false if the specified format can be applied to the current selection/node.
		 */
		function canApply(name) {
			var formatList = get(name), startNode, parents, i, x, selector;

			if (formatList) {
				startNode = selection.getStart();
				parents = getParents(startNode);

				for (x = formatList.length - 1; x >= 0; x--) {
					selector = formatList[x].selector;

					// Format is not selector based then always return TRUE
					// Is it has a defaultBlock then it's likely it can be applied for example align on a non block element line
					if (!selector || formatList[x].defaultBlock) {
						return TRUE;
					}

					for (i = parents.length - 1; i >= 0; i--) {
						if (dom.is(parents[i], selector)) {
							return TRUE;
						}
					}
				}
			}

			return FALSE;
		}

		/**
		 * Executes the specified callback when the current selection matches the formats or not.
		 *
		 * @method formatChanged
		 * @param {String} formats Comma separated list of formats to check for.
		 * @param {function} callback Callback with state and args when the format is changed/toggled on/off.
		 * @param {Boolean} similar True/false state if the match should handle similar or exact formats.
		 */
		function formatChanged(formats, callback, similar) {
			var currentFormats;

			// Setup format node change logic
			if (!formatChangeData) {
				formatChangeData = {};
				currentFormats = {};

				ed.on('NodeChange', function(e) {
					var parents = getParents(e.element), matchedFormats = {};

					// Check for new formats
					each(formatChangeData, function(callbacks, format) {
						each(parents, function(node) {
							if (matchNode(node, format, {}, callbacks.similar)) {
								if (!currentFormats[format]) {
									// Execute callbacks
									each(callbacks, function(callback) {
										callback(true, {node: node, format: format, parents: parents});
									});

									currentFormats[format] = callbacks;
								}

								matchedFormats[format] = callbacks;
								return false;
							}
						});
					});

					// Check if current formats still match
					each(currentFormats, function(callbacks, format) {
						if (!matchedFormats[format]) {
							delete currentFormats[format];

							each(callbacks, function(callback) {
								callback(false, {node: e.element, format: format, parents: parents});
							});
						}
					});
				});
			}

			// Add format listeners
			each(formats.split(','), function(format) {
				if (!formatChangeData[format]) {
					formatChangeData[format] = [];
					formatChangeData[format].similar = similar;
				}

				formatChangeData[format].push(callback);
			});

			return this;
		}

		// Expose to public
		extend(this, {
			get: get,
			register: register,
			apply: apply,
			remove: remove,
			toggle: toggle,
			match: match,
			matchAll: matchAll,
			matchNode: matchNode,
			canApply: canApply,
			formatChanged: formatChanged
		});

		// Initialize
		defaultFormats();
		addKeyboardShortcuts();
		ed.on('BeforeGetContent', function() {
			if (markCaretContainersBogus) {
				markCaretContainersBogus();
			}
		});
		ed.on('mouseup keydown', function(e) {
			if (disableCaretContainer) {
				disableCaretContainer(e);
			}
		});

		// Private functions

		/**
		 * Checks if the specified nodes name matches the format inline/block or selector.
		 *
		 * @private
		 * @param {Node} node Node to match against the specified format.
		 * @param {Object} format Format object o match with.
		 * @return {boolean} true/false if the format matches.
		 */
		function matchName(node, format) {
			// Check for inline match
			if (isEq(node, format.inline)) {
				return TRUE;
			}

			// Check for block match
			if (isEq(node, format.block)) {
				return TRUE;
			}

			// Check for selector match
			if (format.selector) {
				return node.nodeType == 1 && dom.is(node, format.selector);
			}
		}

		/**
		 * Compares two string/nodes regardless of their case.
		 *
		 * @private
		 * @param {String/Node} Node or string to compare.
		 * @param {String/Node} Node or string to compare.
		 * @return {boolean} True/false if they match.
		 */
		function isEq(str1, str2) {
			str1 = str1 || '';
			str2 = str2 || '';

			str1 = '' + (str1.nodeName || str1);
			str2 = '' + (str2.nodeName || str2);

			return str1.toLowerCase() == str2.toLowerCase();
		}

		/**
		 * Returns the style by name on the specified node. This method modifies the style
		 * contents to make it more easy to match. This will resolve a few browser issues.
		 *
		 * @private
		 * @param {Node} node to get style from.
		 * @param {String} name Style name to get.
		 * @return {String} Style item value.
		 */
		function getStyle(node, name) {
			return normalizeStyleValue(dom.getStyle(node, name), name);
		}

		/**
		 * Normalize style value by name. This method modifies the style contents
		 * to make it more easy to match. This will resolve a few browser issues.
		 *
		 * @private
		 * @param {Node} node to get style from.
		 * @param {String} name Style name to get.
		 * @return {String} Style item value.
		 */
		function normalizeStyleValue(value, name) {
			// Force the format to hex
			if (name == 'color' || name == 'backgroundColor') {
				value = dom.toHex(value);
			}

			// Opera will return bold as 700
			if (name == 'fontWeight' && value == 700) {
				value = 'bold';
			}

			// Normalize fontFamily so "'Font name', Font" becomes: "Font name,Font"
			if (name == 'fontFamily') {
				value = value.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
			}

			return '' + value;
		}

		/**
		 * Replaces variables in the value. The variable format is %var.
		 *
		 * @private
		 * @param {String} value Value to replace variables in.
		 * @param {Object} vars Name/value array with variables to replace.
		 * @return {String} New value with replaced variables.
		 */
		function replaceVars(value, vars) {
			if (typeof(value) != "string") {
				value = value(vars);
			} else if (vars) {
				value = value.replace(/%(\w+)/g, function(str, name) {
					return vars[name] || str;
				});
			}

			return value;
		}

		function isWhiteSpaceNode(node) {
			return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
		}

		function wrap(node, name, attrs) {
			var wrapper = dom.create(name, attrs);

			node.parentNode.insertBefore(wrapper, node);
			wrapper.appendChild(node);

			return wrapper;
		}

		/**
		 * Expands the specified range like object to depending on format.
		 *
		 * For example on block formats it will move the start/end position
		 * to the beginning of the current block.
		 *
		 * @private
		 * @param {Object} rng Range like object.
		 * @param {Array} formats Array with formats to expand by.
		 * @return {Object} Expanded range like object.
		 */
		function expandRng(rng, format, remove) {
			var lastIdx, leaf, endPoint,
				startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			// This function walks up the tree if there is no siblings before/after the node
			function findParentContainer(start) {
				var container, parent, sibling, siblingName, root;

				container = parent = start ? startContainer : endContainer;
				siblingName = start ? 'previousSibling' : 'nextSibling';
				root = dom.getRoot();

				function isBogusBr(node) {
					return node.nodeName == "BR" && node.getAttribute('data-mce-bogus') && !node.nextSibling;
				}

				// If it's a text node and the offset is inside the text
				if (container.nodeType == 3 && !isWhiteSpaceNode(container)) {
					if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
						return container;
					}
				}

				for (;;) {
					// Stop expanding on block elements
					if (!format[0].block_expand && isBlock(parent)) {
						return parent;
					}

					// Walk left/right
					for (sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
						if (!isBookmarkNode(sibling) && !isWhiteSpaceNode(sibling) && !isBogusBr(sibling)) {
							return parent;
						}
					}

					// Check if we can move up are we at root level or body level
					if (parent.parentNode == root) {
						container = parent;
						break;
					}

					parent = parent.parentNode;
				}

				return container;
			}

			// This function walks down the tree to find the leaf at the selection.
			// The offset is also returned as if node initially a leaf, the offset may be in the middle of the text node.
			function findLeaf(node, offset) {
				if (offset === undef) {
					offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				}

				while (node && node.hasChildNodes()) {
					node = node.childNodes[offset];
					if (node) {
						offset = node.nodeType === 3 ? node.length : node.childNodes.length;
					}
				}
				return { node: node, offset: offset };
			}

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				lastIdx = startContainer.childNodes.length - 1;
				startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

				if (startContainer.nodeType == 3) {
					startOffset = 0;
				}
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				lastIdx = endContainer.childNodes.length - 1;
				endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

				if (endContainer.nodeType == 3) {
					endOffset = endContainer.nodeValue.length;
				}
			}

			// Expands the node to the closes contentEditable false element if it exists
			function findParentContentEditable(node) {
				var parent = node;

				while (parent) {
					if (parent.nodeType === 1 && getContentEditable(parent)) {
						return getContentEditable(parent) === "false" ? parent : node;
					}

					parent = parent.parentNode;
				}

				return node;
			}

			function findWordEndPoint(container, offset, start) {
				var walker, node, pos, lastTextNode;

				function findSpace(node, offset) {
					var pos, pos2, str = node.nodeValue;

					if (typeof(offset) == "undefined") {
						offset = start ? str.length : 0;
					}

					if (start) {
						pos = str.lastIndexOf(' ', offset);
						pos2 = str.lastIndexOf('\u00a0', offset);
						pos = pos > pos2 ? pos : pos2;

						// Include the space on remove to avoid tag soup
						if (pos !== -1 && !remove) {
							pos++;
						}
					} else {
						pos = str.indexOf(' ', offset);
						pos2 = str.indexOf('\u00a0', offset);
						pos = pos !== -1 && (pos2 === -1 || pos < pos2) ? pos : pos2;
					}

					return pos;
				}

				if (container.nodeType === 3) {
					pos = findSpace(container, offset);

					if (pos !== -1) {
						return {container: container, offset: pos};
					}

					lastTextNode = container;
				}

				// Walk the nodes inside the block
				walker = new TreeWalker(container, dom.getParent(container, isBlock) || ed.getBody());
				while ((node = walker[start ? 'prev' : 'next']())) {
					if (node.nodeType === 3) {
						lastTextNode = node;
						pos = findSpace(node);

						if (pos !== -1) {
							return {container: node, offset: pos};
						}
					} else if (isBlock(node)) {
						break;
					}
				}

				if (lastTextNode) {
					if (start) {
						offset = 0;
					} else {
						offset = lastTextNode.length;
					}

					return {container: lastTextNode, offset: offset};
				}
			}

			function findSelectorEndPoint(container, sibling_name) {
				var parents, i, y, curFormat;

				if (container.nodeType == 3 && container.nodeValue.length === 0 && container[sibling_name]) {
					container = container[sibling_name];
				}

				parents = getParents(container);
				for (i = 0; i < parents.length; i++) {
					for (y = 0; y < format.length; y++) {
						curFormat = format[y];

						// If collapsed state is set then skip formats that doesn't match that
						if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed) {
							continue;
						}

						if (dom.is(parents[i], curFormat.selector)) {
							return parents[i];
						}
					}
				}

				return container;
			}

			function findBlockEndPoint(container, sibling_name) {
				var node, root = dom.getRoot();

				// Expand to block of similar type
				if (!format[0].wrapper) {
					node = dom.getParent(container, format[0].block, root);
				}

				// Expand to first wrappable block element or any block element
				if (!node) {
					node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, function(node) {
						// Fixes #6183 where it would expand to editable parent element in inline mode
						return node != root && isTextBlock(node);
					});
				}

				// Exclude inner lists from wrapping
				if (node && format[0].wrapper) {
					node = getParents(node, 'ul,ol').reverse()[0] || node;
				}

				// Didn't find a block element look for first/last wrappable element
				if (!node) {
					node = container;

					while (node[sibling_name] && !isBlock(node[sibling_name])) {
						node = node[sibling_name];

						// Break on BR but include it will be removed later on
						// we can't remove it now since we need to check if it can be wrapped
						if (isEq(node, 'br')) {
							break;
						}
					}
				}

				return node || container;
			}

			// Expand to closest contentEditable element
			startContainer = findParentContentEditable(startContainer);
			endContainer = findParentContentEditable(endContainer);

			// Exclude bookmark nodes if possible
			if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
				startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
				startContainer = startContainer.nextSibling || startContainer;

				if (startContainer.nodeType == 3) {
					startOffset = 0;
				}
			}

			if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
				endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
				endContainer = endContainer.previousSibling || endContainer;

				if (endContainer.nodeType == 3) {
					endOffset = endContainer.length;
				}
			}

			if (format[0].inline) {
				if (rng.collapsed) {
					// Expand left to closest word boundary
					endPoint = findWordEndPoint(startContainer, startOffset, true);
					if (endPoint) {
						startContainer = endPoint.container;
						startOffset = endPoint.offset;
					}

					// Expand right to closest word boundary
					endPoint = findWordEndPoint(endContainer, endOffset);
					if (endPoint) {
						endContainer = endPoint.container;
						endOffset = endPoint.offset;
					}
				}

				// Avoid applying formatting to a trailing space.
				leaf = findLeaf(endContainer, endOffset);
				if (leaf.node) {
					while (leaf.node && leaf.offset === 0 && leaf.node.previousSibling) {
						leaf = findLeaf(leaf.node.previousSibling);
					}

					if (leaf.node && leaf.offset > 0 && leaf.node.nodeType === 3 &&
							leaf.node.nodeValue.charAt(leaf.offset - 1) === ' ') {

						if (leaf.offset > 1) {
							endContainer = leaf.node;
							endContainer.splitText(leaf.offset - 1);
						}
					}
				}
			}

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (format[0].inline || format[0].block_expand) {
				if (!format[0].inline || (startContainer.nodeType != 3 || startOffset === 0)) {
					startContainer = findParentContainer(true);
				}

				if (!format[0].inline || (endContainer.nodeType != 3 || endOffset === endContainer.nodeValue.length)) {
					endContainer = findParentContainer();
				}
			}

			// Expand start/end container to matching selector
			if (format[0].selector && format[0].expand !== FALSE && !format[0].inline) {
				// Find new startContainer/endContainer if there is better one
				startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
				endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
			}

			// Expand start/end container to matching block element or text node
			if (format[0].block || format[0].selector) {
				// Find new startContainer/endContainer if there is better one
				startContainer = findBlockEndPoint(startContainer, 'previousSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling');

				// Non block element then try to expand up the leaf
				if (format[0].block) {
					if (!isBlock(startContainer)) {
						startContainer = findParentContainer(true);
					}

					if (!isBlock(endContainer)) {
						endContainer = findParentContainer();
					}
				}
			}

			// Setup index for startContainer
			if (startContainer.nodeType == 1) {
				startOffset = nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			// Setup index for endContainer
			if (endContainer.nodeType == 1) {
				endOffset = nodeIndex(endContainer) + 1;
				endContainer = endContainer.parentNode;
			}

			// Return new range like object
			return {
				startContainer: startContainer,
				startOffset: startOffset,
				endContainer: endContainer,
				endOffset: endOffset
			};
		}

		/**
		 * Removes the specified format for the specified node. It will also remove the node if it doesn't have
		 * any attributes if the format specifies it to do so.
		 *
		 * @private
		 * @param {Object} format Format object with items to remove from node.
		 * @param {Object} vars Name/value object with variables to apply to format.
		 * @param {Node} node Node to remove the format styles on.
		 * @param {Node} compare_node Optional compare node, if specified the styles will be compared to that node.
		 * @return {Boolean} True/false if the node was removed or not.
		 */
		function removeFormat(format, vars, node, compare_node) {
			var i, attrs, stylesModified;

			// Check if node matches format
			if (!matchName(node, format)) {
				return FALSE;
			}

			// Should we compare with format attribs and styles
			if (format.remove != 'all') {
				// Remove styles
				each(format.styles, function(value, name) {
					value = normalizeStyleValue(replaceVars(value, vars), name);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(getStyle(compare_node, name), value)) {
						dom.setStyle(node, name, '');
					}

					stylesModified = 1;
				});

				// Remove style attribute if it's empty
				if (stylesModified && dom.getAttrib(node, 'style') === '') {
					node.removeAttribute('style');
					node.removeAttribute('data-mce-style');
				}

				// Remove attributes
				each(format.attributes, function(value, name) {
					var valueOut;

					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(dom.getAttrib(compare_node, name), value)) {
						// Keep internal classes
						if (name == 'class') {
							value = dom.getAttrib(node, name);
							if (value) {
								// Build new class value where everything is removed except the internal prefixed classes
								valueOut = '';
								each(value.split(/\s+/), function(cls) {
									if (/mce\w+/.test(cls)) {
										valueOut += (valueOut ? ' ' : '') + cls;
									}
								});

								// We got some internal classes left
								if (valueOut) {
									dom.setAttrib(node, name, valueOut);
									return;
								}
							}
						}

						// IE6 has a bug where the attribute doesn't get removed correctly
						if (name == "class") {
							node.removeAttribute('className');
						}

						// Remove mce prefixed attributes
						if (MCE_ATTR_RE.test(name)) {
							node.removeAttribute('data-mce-' + name);
						}

						node.removeAttribute(name);
					}
				});

				// Remove classes
				each(format.classes, function(value) {
					value = replaceVars(value, vars);

					if (!compare_node || dom.hasClass(compare_node, value)) {
						dom.removeClass(node, value);
					}
				});

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0) {
						return FALSE;
					}
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if (format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
			}
		}

		/**
		 * Removes the node and wrap it's children in paragraphs before doing so or
		 * appends BR elements to the beginning/end of the block element if forcedRootBlocks is disabled.
		 *
		 * If the div in the node below gets removed:
		 *  text<div>text</div>text
		 *
		 * Output becomes:
		 *  text<div><br />text<br /></div>text
		 *
		 * So when the div is removed the result is:
		 *  text<br />text<br />text
		 *
		 * @private
		 * @param {Node} node Node to remove + apply BR/P elements to.
		 * @param {Object} format Format rule.
		 * @return {Node} Input node.
		 */
		function removeNode(node, format) {
			var parentNode = node.parentNode, rootBlockElm;

			function find(node, next, inc) {
				node = getNonWhiteSpaceSibling(node, next, inc);

				return !node || (node.nodeName == 'BR' || isBlock(node));
			}

			if (format.block) {
				if (!forcedRootBlock) {
					// Append BR elements if needed before we remove the block
					if (isBlock(node) && !isBlock(parentNode)) {
						if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1)) {
							node.insertBefore(dom.create('br'), node.firstChild);
						}

						if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1)) {
							node.appendChild(dom.create('br'));
						}
					}
				} else {
					// Wrap the block in a forcedRootBlock if we are at the root of document
					if (parentNode == dom.getRoot()) {
						if (!format.list_block || !isEq(node, format.list_block)) {
							each(grep(node.childNodes), function(node) {
								if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
									if (!rootBlockElm) {
										rootBlockElm = wrap(node, forcedRootBlock);
										dom.setAttribs(rootBlockElm, ed.settings.forced_root_block_attrs);
									} else {
										rootBlockElm.appendChild(node);
									}
								} else {
									rootBlockElm = 0;
								}
							});
						}
					}
				}
			}

			// Never remove nodes that isn't the specified inline element if a selector is specified too
			if (format.selector && format.inline && !isEq(format.inline, node)) {
				return;
			}

			dom.remove(node, 1);
		}

		/**
		 * Returns the next/previous non whitespace node.
		 *
		 * @private
		 * @param {Node} node Node to start at.
		 * @param {boolean} next (Optional) Include next or previous node defaults to previous.
		 * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
		 * @return {Node} Next or previous node or undefined if it wasn't found.
		 */
		function getNonWhiteSpaceSibling(node, next, inc) {
			if (node) {
				next = next ? 'nextSibling' : 'previousSibling';

				for (node = inc ? node : node[next]; node; node = node[next]) {
					if (node.nodeType == 1 || !isWhiteSpaceNode(node)) {
						return node;
					}
				}
			}
		}

		/**
		 * Checks if the specified node is a bookmark node or not.
		 *
		 * @private
		 * @param {Node} node Node to check if it's a bookmark node or not.
		 * @return {Boolean} true/false if the node is a bookmark node.
		 */
		function isBookmarkNode(node) {
			return node && node.nodeType == 1 && node.getAttribute('data-mce-type') == 'bookmark';
		}

		/**
		 * Merges the next/previous sibling element if they match.
		 *
		 * @private
		 * @param {Node} prev Previous node to compare/merge.
		 * @param {Node} next Next node to compare/merge.
		 * @return {Node} Next node if we didn't merge and prev node if we did.
		 */
		function mergeSiblings(prev, next) {
			var sibling, tmpSibling;

			/**
			 * Compares two nodes and checks if it's attributes and styles matches.
			 * This doesn't compare classes as items since their order is significant.
			 *
			 * @private
			 * @param {Node} node1 First node to compare with.
			 * @param {Node} node2 Second node to compare with.
			 * @return {boolean} True/false if the nodes are the same or not.
			 */
			function compareElements(node1, node2) {
				// Not the same name
				if (node1.nodeName != node2.nodeName) {
					return FALSE;
				}

				/**
				 * Returns all the nodes attributes excluding internal ones, styles and classes.
				 *
				 * @private
				 * @param {Node} node Node to get attributes from.
				 * @return {Object} Name/value object with attributes and attribute values.
				 */
				function getAttribs(node) {
					var attribs = {};

					each(dom.getAttribs(node), function(attr) {
						var name = attr.nodeName.toLowerCase();

						// Don't compare internal attributes or style
						if (name.indexOf('_') !== 0 && name !== 'style' && name !== 'data-mce-style') {
							attribs[name] = dom.getAttrib(node, name);
						}
					});

					return attribs;
				}

				/**
				 * Compares two objects checks if it's key + value exists in the other one.
				 *
				 * @private
				 * @param {Object} obj1 First object to compare.
				 * @param {Object} obj2 Second object to compare.
				 * @return {boolean} True/false if the objects matches or not.
				 */
				function compareObjects(obj1, obj2) {
					var value, name;

					for (name in obj1) {
						// Obj1 has item obj2 doesn't have
						if (obj1.hasOwnProperty(name)) {
							value = obj2[name];

							// Obj2 doesn't have obj1 item
							if (value === undef) {
								return FALSE;
							}

							// Obj2 item has a different value
							if (obj1[name] != value) {
								return FALSE;
							}

							// Delete similar value
							delete obj2[name];
						}
					}

					// Check if obj 2 has something obj 1 doesn't have
					for (name in obj2) {
						// Obj2 has item obj1 doesn't have
						if (obj2.hasOwnProperty(name)) {
							return FALSE;
						}
					}

					return TRUE;
				}

				// Attribs are not the same
				if (!compareObjects(getAttribs(node1), getAttribs(node2))) {
					return FALSE;
				}

				// Styles are not the same
				if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style')))) {
					return FALSE;
				}

				return !isBookmarkNode(node1) && !isBookmarkNode(node2);
			}

			function findElementSibling(node, sibling_name) {
				for (sibling = node; sibling; sibling = sibling[sibling_name]) {
					if (sibling.nodeType == 3 && sibling.nodeValue.length !== 0) {
						return node;
					}

					if (sibling.nodeType == 1 && !isBookmarkNode(sibling)) {
						return sibling;
					}
				}

				return node;
			}

			// Check if next/prev exists and that they are elements
			if (prev && next) {
				// If previous sibling is empty then jump over it
				prev = findElementSibling(prev, 'previousSibling');
				next = findElementSibling(next, 'nextSibling');

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Append nodes between
					for (sibling = prev.nextSibling; sibling && sibling != next;) {
						tmpSibling = sibling;
						sibling = sibling.nextSibling;
						prev.appendChild(tmpSibling);
					}

					// Remove next node
					dom.remove(next);

					// Move children into prev node
					each(grep(next.childNodes), function(node) {
						prev.appendChild(node);
					});

					return prev;
				}
			}

			return next;
		}

		function getContainer(rng, start) {
			var container, offset, lastIdx;

			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];

			if (container.nodeType == 1) {
				lastIdx = container.childNodes.length - 1;

				if (!start && offset) {
					offset--;
				}

				container = container.childNodes[offset > lastIdx ? lastIdx : offset];
			}

			// If start text node is excluded then walk to the next node
			if (container.nodeType === 3 && start && offset >= container.nodeValue.length) {
				container = new TreeWalker(container, ed.getBody()).next() || container;
			}

			// If end text node is excluded then walk to the previous node
			if (container.nodeType === 3 && !start && offset === 0) {
				container = new TreeWalker(container, ed.getBody()).prev() || container;
			}

			return container;
		}

		function performCaretAction(type, name, vars) {
			var caretContainerId = '_mce_caret', debug = ed.settings.caret_debug;

			// Creates a caret container bogus element
			function createCaretContainer(fill) {
				var caretContainer = dom.create('span', {id: caretContainerId, 'data-mce-bogus': true, style: debug ? 'color:red' : ''});

				if (fill) {
					caretContainer.appendChild(ed.getDoc().createTextNode(INVISIBLE_CHAR));
				}

				return caretContainer;
			}

			function isCaretContainerEmpty(node, nodes) {
				while (node) {
					if ((node.nodeType === 3 && node.nodeValue !== INVISIBLE_CHAR) || node.childNodes.length > 1) {
						return false;
					}

					// Collect nodes
					if (nodes && node.nodeType === 1) {
						nodes.push(node);
					}

					node = node.firstChild;
				}

				return true;
			}

			// Returns any parent caret container element
			function getParentCaretContainer(node) {
				while (node) {
					if (node.id === caretContainerId) {
						return node;
					}

					node = node.parentNode;
				}
			}

			// Finds the first text node in the specified node
			function findFirstTextNode(node) {
				var walker;

				if (node) {
					walker = new TreeWalker(node, node);

					for (node = walker.current(); node; node = walker.next()) {
						if (node.nodeType === 3) {
							return node;
						}
					}
				}
			}

			// Removes the caret container for the specified node or all on the current document
			function removeCaretContainer(node, move_caret) {
				var child, rng;

				if (!node) {
					node = getParentCaretContainer(selection.getStart());

					if (!node) {
						while ((node = dom.get(caretContainerId))) {
							removeCaretContainer(node, false);
						}
					}
				} else {
					rng = selection.getRng(true);

					if (isCaretContainerEmpty(node)) {
						if (move_caret !== false) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
						}

						dom.remove(node);
					} else {
						child = findFirstTextNode(node);

						if (child.nodeValue.charAt(0) === INVISIBLE_CHAR) {
							child = child.deleteData(0, 1);
						}

						dom.remove(node, 1);
					}

					selection.setRng(rng);
				}
			}

			// Applies formatting to the caret postion
			function applyCaretFormat() {
				var rng, caretContainer, textNode, offset, bookmark, container, text;

				rng = selection.getRng(true);
				offset = rng.startOffset;
				container = rng.startContainer;
				text = container.nodeValue;

				caretContainer = getParentCaretContainer(selection.getStart());
				if (caretContainer) {
					textNode = findFirstTextNode(caretContainer);
				}

				// Expand to word is caret is in the middle of a text node and the char before/after is a alpha numeric character
				if (text && offset > 0 && offset < text.length && /\w/.test(text.charAt(offset)) && /\w/.test(text.charAt(offset - 1))) {
					// Get bookmark of caret position
					bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name));
					rng = rangeUtils.split(rng);

					// Apply the format to the range
					apply(name, vars, rng);

					// Move selection back to caret position
					selection.moveToBookmark(bookmark);
				} else {
					if (!caretContainer || textNode.nodeValue !== INVISIBLE_CHAR) {
						caretContainer = createCaretContainer(true);
						textNode = caretContainer.firstChild;

						rng.insertNode(caretContainer);
						offset = 1;

						apply(name, vars, caretContainer);
					} else {
						apply(name, vars, caretContainer);
					}

					// Move selection to text node
					selection.setCursorLocation(textNode, offset);
				}
			}

			function removeCaretFormat() {
				var rng = selection.getRng(true), container, offset, bookmark,
					hasContentAfter, node, formatNode, parents = [], i, caretContainer;

				container = rng.startContainer;
				offset = rng.startOffset;
				node = container;

				if (container.nodeType == 3) {
					if (offset != container.nodeValue.length || container.nodeValue === INVISIBLE_CHAR) {
						hasContentAfter = true;
					}

					node = node.parentNode;
				}

				while (node) {
					if (matchNode(node, name, vars)) {
						formatNode = node;
						break;
					}

					if (node.nextSibling) {
						hasContentAfter = true;
					}

					parents.push(node);
					node = node.parentNode;
				}

				// Node doesn't have the specified format
				if (!formatNode) {
					return;
				}

				// Is there contents after the caret then remove the format on the element
				if (hasContentAfter) {
					// Get bookmark of caret position
					bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name), true);
					rng = rangeUtils.split(rng);

					// Remove the format from the range
					remove(name, vars, rng);

					// Move selection back to caret position
					selection.moveToBookmark(bookmark);
				} else {
					caretContainer = createCaretContainer();

					node = caretContainer;
					for (i = parents.length - 1; i >= 0; i--) {
						node.appendChild(dom.clone(parents[i], false));
						node = node.firstChild;
					}

					// Insert invisible character into inner most format element
					node.appendChild(dom.doc.createTextNode(INVISIBLE_CHAR));
					node = node.firstChild;

					var block = dom.getParent(formatNode, isTextBlock);

					if (block && dom.isEmpty(block)) {
						// Replace formatNode with caretContainer when removing format from empty block like <p><b>|</b></p>
						formatNode.parentNode.replaceChild(caretContainer, formatNode);
					} else {
						// Insert caret container after the formated node
						dom.insertAfter(caretContainer, formatNode);
					}

					// Move selection to text node
					selection.setCursorLocation(node, 1);

					// If the formatNode is empty, we can remove it safely. 
					if (dom.isEmpty(formatNode)) {
						dom.remove(formatNode);
					}
				}
			}

			// Checks if the parent caret container node isn't empty if that is the case it
			// will remove the bogus state on all children that isn't empty
			function unmarkBogusCaretParents() {
				var caretContainer;

				caretContainer = getParentCaretContainer(selection.getStart());
				if (caretContainer && !dom.isEmpty(caretContainer)) {
					walk(caretContainer, function(node) {
						if (node.nodeType == 1 && node.id !== caretContainerId && !dom.isEmpty(node)) {
							dom.setAttrib(node, 'data-mce-bogus', null);
						}
					}, 'childNodes');
				}
			}

			// Only bind the caret events once
			if (!ed._hasCaretEvents) {
				// Mark current caret container elements as bogus when getting the contents so we don't end up with empty elements
				markCaretContainersBogus = function() {
					var nodes = [], i;

					if (isCaretContainerEmpty(getParentCaretContainer(selection.getStart()), nodes)) {
						// Mark children
						i = nodes.length;
						while (i--) {
							dom.setAttrib(nodes[i], 'data-mce-bogus', '1');
						}
					}
				};

				disableCaretContainer = function(e) {
					var keyCode = e.keyCode;

					removeCaretContainer();

					// Remove caret container on keydown and it's a backspace, enter or left/right arrow keys
					if (keyCode == 8 || keyCode == 37 || keyCode == 39) {
						removeCaretContainer(getParentCaretContainer(selection.getStart()));
					}

					unmarkBogusCaretParents();
				};

				// Remove bogus state if they got filled by contents using editor.selection.setContent
				ed.on('SetContent', function(e) {
					if (e.selection) {
						unmarkBogusCaretParents();
					}
				});
				ed._hasCaretEvents = true;
			}

			// Do apply or remove caret format
			if (type == "apply") {
				applyCaretFormat();
			} else {
				removeCaretFormat();
			}
		}

		/**
		 * Moves the start to the first suitable text node.
		 */
		function moveStart(rng) {
			var container = rng.startContainer,
					offset = rng.startOffset, isAtEndOfText,
					walker, node, nodes, tmpNode;

			// Convert text node into index if possible
			if (container.nodeType == 3 && offset >= container.nodeValue.length) {
				// Get the parent container location and walk from there
				offset = nodeIndex(container);
				container = container.parentNode;
				isAtEndOfText = true;
			}

			// Move startContainer/startOffset in to a suitable node
			if (container.nodeType == 1) {
				nodes = container.childNodes;
				container = nodes[Math.min(offset, nodes.length - 1)];
				walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));

				// If offset is at end of the parent node walk to the next one
				if (offset > nodes.length - 1 || isAtEndOfText) {
					walker.next();
				}

				for (node = walker.current(); node; node = walker.next()) {
					if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
						// IE has a "neat" feature where it moves the start node into the closest element
						// we can avoid this by inserting an element before it and then remove it after we set the selection
						tmpNode = dom.create('a', null, INVISIBLE_CHAR);
						node.parentNode.insertBefore(tmpNode, node);

						// Set selection and remove tmpNode
						rng.setStart(node, 0);
						selection.setRng(rng);
						dom.remove(tmpNode);

						return;
					}
				}
			}
		}
	};
});

// Included from: js/tinymce/classes/UndoManager.js

/**
 * UndoManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */
define("tinymce/UndoManager", [
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Env, Tools) {
	var trim = Tools.trim, trimContentRegExp;

	trimContentRegExp = new RegExp([
		'<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\\/span>', // Trim bogus spans like caret containers
		'<div[^>]+data-mce-bogus[^>]+><\\/div>', // Trim bogus divs like resize handles
		'\\s?data-mce-selected="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
	].join('|'), 'gi');

	return function(editor) {
		var self, index = 0, data = [], beforeBookmark, isFirstTypedCharacter, lock;

		// Returns a trimmed version of the current editor contents
		function getContent() {
			return trim(editor.getContent({format: 'raw', no_events: 1}).replace(trimContentRegExp, ''));
		}

		function addNonTypingUndoLevel(e) {
			self.typing = false;
			self.add({}, e);
		}

		// Add initial undo level when the editor is initialized
		editor.on('init', function() {
			self.add();
		});

		// Get position before an execCommand is processed
		editor.on('BeforeExecCommand', function(e) {
			var cmd = e.command;

			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint') {
				self.beforeChange();
			}
		});

		// Add undo level after an execCommand call was made
		editor.on('ExecCommand', function(e) {
			var cmd = e.command;

			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint') {
				addNonTypingUndoLevel(e);
			}
		});

		editor.on('ObjectResizeStart', function() {
			self.beforeChange();
		});

		editor.on('SaveContent ObjectResized blur', addNonTypingUndoLevel);
		editor.dom.bind(editor.dom.getRoot(), 'dragend', addNonTypingUndoLevel);

		editor.on('KeyUp', function(e) {
			var keyCode = e.keyCode;

			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45 || keyCode == 13 || e.ctrlKey) {
				addNonTypingUndoLevel();
				editor.nodeChanged();
			}

			if (keyCode == 46 || keyCode == 8 || (Env.mac && (keyCode == 91 || keyCode == 93))) {
				editor.nodeChanged();
			}

			// Fire a TypingUndo event on the first character entered
			if (isFirstTypedCharacter && self.typing) {
				// Make the it dirty if the content was changed after typing the first character
				if (!editor.isDirty()) {
					editor.isNotDirty = !data[0] || getContent() == data[0].content;

					// Fire initial change event
					if (!editor.isNotDirty) {
						editor.fire('change', {level: data[0], lastLevel: null});
					}
				}

				editor.fire('TypingUndo');
				isFirstTypedCharacter = false;
				editor.nodeChanged();
			}
		});

		editor.on('KeyDown', function(e) {
			var keyCode = e.keyCode;

			// Is caracter positon keys left,right,up,down,home,end,pgdown,pgup,enter
			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45) {
				if (self.typing) {
					addNonTypingUndoLevel(e);
				}

				return;
			}

			// If key isn't shift,ctrl,alt,capslock,metakey
			if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !self.typing) {
				self.beforeChange();
				self.typing = true;
				self.add({}, e);
				isFirstTypedCharacter = true;
			}
		});

		editor.on('MouseDown', function(e) {
			if (self.typing) {
				addNonTypingUndoLevel(e);
			}
		});

		// Add keyboard shortcuts for undo/redo keys
		editor.addShortcut('ctrl+z', '', 'Undo');
		editor.addShortcut('ctrl+y,ctrl+shift+z', '', 'Redo');

		editor.on('AddUndo Undo Redo ClearUndos MouseUp', function(e) {
			if (!e.isDefaultPrevented()) {
				editor.nodeChanged();
			}
		});

		self = {
			// Explose for debugging reasons
			data: data,

			/**
			 * State if the user is currently typing or not. This will add a typing operation into one undo
			 * level instead of one new level for each keystroke.
			 *
			 * @field {Boolean} typing
			 */
			typing: false,

			/**
			 * Stores away a bookmark to be used when performing an undo action so that the selection is before
			 * the change has been made.
			 *
			 * @method beforeChange
			 */
			beforeChange: function() {
				if (!lock) {
					beforeBookmark = editor.selection.getBookmark(2, true);
				}
			},

			/**
			 * Adds a new undo level/snapshot to the undo list.
			 *
			 * @method add
			 * @param {Object} level Optional undo level object to add.
			 * @param {DOMEvent} Event Optional event responsible for the creation of the undo level.
			 * @return {Object} Undo level that got added or null it a level wasn't needed.
			 */
			add: function(level, event) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();

				if (lock || editor.removed) {
					return null;
				}

				if (editor.fire('BeforeAddUndo', {level: level, originalEvent: event}).isDefaultPrevented()) {
					return null;
				}

				// Add undo level if needed
				lastLevel = data[index];
				if (lastLevel && lastLevel.content == level.content) {
					return null;
				}

				// Set before bookmark on previous level
				if (data[index]) {
					data[index].beforeBookmark = beforeBookmark;
				}

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++) {
							data[i] = data[i + 1];
						}

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1) {
					data.length = index + 1;
				}

				data.push(level);
				index = data.length - 1;

				var args = {level: level, lastLevel: lastLevel, originalEvent: event};

				editor.fire('AddUndo', args);

				if (index > 0) {
					editor.isNotDirty = false;
					editor.fire('change', args);
				}

				return level;
			},

			/**
			 * Undoes the last action.
			 *
			 * @method undo
			 * @return {Object} Undo level or null if no undo was performed.
			 */
			undo: function() {
				var level;

				if (self.typing) {
					self.add();
					self.typing = false;
				}

				if (index > 0) {
					level = data[--index];

					// Undo to first index then set dirty state to false
					if (index === 0) {
						editor.isNotDirty = true;
					}

					editor.setContent(level.content, {format: 'raw'});
					editor.selection.moveToBookmark(level.beforeBookmark);

					editor.fire('undo', {level: level});
				}

				return level;
			},

			/**
			 * Redoes the last action.
			 *
			 * @method redo
			 * @return {Object} Redo level or null if no redo was performed.
			 */
			redo: function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format: 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					editor.fire('redo', {level: level});
				}

				return level;
			},

			/**
			 * Removes all undo levels.
			 *
			 * @method clear
			 */
			clear: function() {
				data = [];
				index = 0;
				self.typing = false;
				editor.fire('ClearUndos');
			},

			/**
			 * Returns true/false if the undo manager has any undo levels.
			 *
			 * @method hasUndo
			 * @return {Boolean} true/false if the undo manager has any undo levels.
			 */
			hasUndo: function() {
				// Has undo levels or typing and content isn't the same as the initial level
				return index > 0 || (self.typing && data[0] && getContent() != data[0].content);
			},

			/**
			 * Returns true/false if the undo manager has any redo levels.
			 *
			 * @method hasRedo
			 * @return {Boolean} true/false if the undo manager has any redo levels.
			 */
			hasRedo: function() {
				return index < data.length - 1 && !this.typing;
			},

			/**
			 * Executes the specified function in an undo transation. The selection
			 * before the modification will be stored to the undo stack and if the DOM changes
			 * it will add a new undo level. Any methods within the transation that adds undo levels will
			 * be ignored. So a transation can include calls to execCommand or editor.insertContent.
			 *
			 * @method transact
			 * @param {function} callback Function to execute dom manipulation logic in.
			 */
			transact: function(callback) {
				self.beforeChange();

				lock = true;
				callback();
				lock = false;

				self.add();
			}
		};

		return self;
	};
});

// Included from: js/tinymce/classes/EnterKey.js

/**
 * EnterKey.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains logic for handling the enter key to split/generate block elements.
 */
define("tinymce/EnterKey", [
	"tinymce/dom/TreeWalker",
	"tinymce/dom/RangeUtils",
	"tinymce/Env"
], function(TreeWalker, RangeUtils, Env) {
	var isIE = Env.ie && Env.ie < 11;

	return function(editor) {
		var dom = editor.dom, selection = editor.selection, settings = editor.settings;
		var undoManager = editor.undoManager, schema = editor.schema, nonEmptyElementsMap = schema.getNonEmptyElements();

		function handleEnterKey(evt) {
			var rng, tmpRng, editableRoot, container, offset, parentBlock, documentMode, shiftKey,
				newBlock, fragment, containerBlock, parentBlockName, containerBlockName, newBlockName, isAfterLastNodeInContainer;

			// Returns true if the block can be split into two blocks or not
			function canSplitBlock(node) {
				return node &&
					dom.isBlock(node) &&
					!/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
					!/^(fixed|absolute)/i.test(node.style.position) &&
					dom.getContentEditable(node) !== "true";
			}

			// Renders empty block on IE
			function renderBlockOnIE(block) {
				var oldRng;

				if (dom.isBlock(block)) {
					oldRng = selection.getRng();
					block.appendChild(dom.create('span', null, '\u00a0'));
					selection.select(block);
					block.lastChild.outerHTML = '';
					selection.setRng(oldRng);
				}
			}

			// Remove the first empty inline element of the block so this: <p><b><em></em></b>x</p> becomes this: <p>x</p>
			function trimInlineElementsOnLeftSideOfBlock(block) {
				var node = block, firstChilds = [], i;

				// Find inner most first child ex: <p><i><b>*</b></i></p>
				while ((node = node.firstChild)) {
					if (dom.isBlock(node)) {
						return;
					}

					if (node.nodeType == 1 && !nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
						firstChilds.push(node);
					}
				}

				i = firstChilds.length;
				while (i--) {
					node = firstChilds[i];
					if (!node.hasChildNodes() || (node.firstChild == node.lastChild && node.firstChild.nodeValue === '')) {
						dom.remove(node);
					} else {
						// Remove <a> </a> see #5381
						if (node.nodeName == "A" && (node.innerText || node.textContent) === ' ') {
							dom.remove(node);
						}
					}
				}
			}

			// Moves the caret to a suitable position within the root for example in the first non
			// pure whitespace text node or before an image
			function moveToCaretPosition(root) {
				var walker, node, rng, lastNode = root, tempElm;

				function firstNonWhiteSpaceNodeSibling(node) {
					while (node) {
						if (node.nodeType == 1 || (node.nodeType == 3 && node.data && /[\r\n\s]/.test(node.data))) {
							return node;
						}

						node = node.nextSibling;
					}
				}

				// Old IE versions doesn't properly render blocks with br elements in them
				// For example <p><br></p> wont be rendered correctly in a contentEditable area
				// until you remove the br producing <p></p>
				if (Env.ie && Env.ie < 9 && parentBlock && parentBlock.firstChild) {
					if (parentBlock.firstChild == parentBlock.lastChild && parentBlock.firstChild.tagName == 'BR') {
						dom.remove(parentBlock.firstChild);
					}
				}

				if (root.nodeName == 'LI') {
					var firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

					if (firstChild && /^(UL|OL)$/.test(firstChild.nodeName)) {
						root.insertBefore(dom.doc.createTextNode('\u00a0'), root.firstChild);
					}
				}

				rng = dom.createRng();

				if (root.hasChildNodes()) {
					walker = new TreeWalker(root, root);

					while ((node = walker.current())) {
						if (node.nodeType == 3) {
							rng.setStart(node, 0);
							rng.setEnd(node, 0);
							break;
						}

						if (nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
							break;
						}

						lastNode = node;
						node = walker.next();
					}

					if (!node) {
						rng.setStart(lastNode, 0);
						rng.setEnd(lastNode, 0);
					}
				} else {
					if (root.nodeName == 'BR') {
						if (root.nextSibling && dom.isBlock(root.nextSibling)) {
							// Trick on older IE versions to render the caret before the BR between two lists
							if (!documentMode || documentMode < 9) {
								tempElm = dom.create('br');
								root.parentNode.insertBefore(tempElm, root);
							}

							rng.setStartBefore(root);
							rng.setEndBefore(root);
						} else {
							rng.setStartAfter(root);
							rng.setEndAfter(root);
						}
					} else {
						rng.setStart(root, 0);
						rng.setEnd(root, 0);
					}
				}

				selection.setRng(rng);

				// Remove tempElm created for old IE:s
				dom.remove(tempElm);
				selection.scrollIntoView(root);
			}

			function setForcedBlockAttrs(node) {
				var forcedRootBlockName = settings.forced_root_block;

				if (forcedRootBlockName && forcedRootBlockName.toLowerCase() === node.tagName.toLowerCase()) {
					dom.setAttribs(node, settings.forced_root_block_attrs);
				}
			}

			// Creates a new block element by cloning the current one or creating a new one if the name is specified
			// This function will also copy any text formatting from the parent block and add it to the new one
			function createNewBlock(name) {
				var node = container, block, clonedNode, caretNode;

				if (name || parentBlockName == "TABLE") {
					block = dom.create(name || newBlockName);
					setForcedBlockAttrs(block);
				} else {
					block = parentBlock.cloneNode(false);
				}

				caretNode = block;

				// Clone any parent styles
				if (settings.keep_styles !== false) {
					do {
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U|VAR|CITE|DFN|CODE|MARK|Q|SUP|SUB|SAMP)$/.test(node.nodeName)) {
							// Never clone a caret containers
							if (node.id == '_mce_caret') {
								continue;
							}

							clonedNode = node.cloneNode(false);
							dom.setAttrib(clonedNode, 'id', ''); // Remove ID since it needs to be document unique

							if (block.hasChildNodes()) {
								clonedNode.appendChild(block.firstChild);
								block.appendChild(clonedNode);
							} else {
								caretNode = clonedNode;
								block.appendChild(clonedNode);
							}
						}
					} while ((node = node.parentNode));
				}

				// BR is needed in empty blocks on non IE browsers
				if (!isIE) {
					caretNode.innerHTML = '<br data-mce-bogus="1">';
				}

				return block;
			}

			// Returns true/false if the caret is at the start/end of the parent block element
			function isCaretAtStartOrEndOfBlock(start) {
				var walker, node, name;

				// Caret is in the middle of a text node like "a|b"
				if (container.nodeType == 3 && (start ? offset > 0 : offset < container.nodeValue.length)) {
					return false;
				}

				// If after the last element in block node edge case for #5091
				if (container.parentNode == parentBlock && isAfterLastNodeInContainer && !start) {
					return true;
				}

				// If the caret if before the first element in parentBlock
				if (start && container.nodeType == 1 && container == parentBlock.firstChild) {
					return true;
				}

				// Caret can be before/after a table
				if (container.nodeName === "TABLE" || (container.previousSibling && container.previousSibling.nodeName == "TABLE")) {
					return (isAfterLastNodeInContainer && !start) || (!isAfterLastNodeInContainer && start);
				}

				// Walk the DOM and look for text nodes or non empty elements
				walker = new TreeWalker(container, parentBlock);

				// If caret is in beginning or end of a text block then jump to the next/previous node
				if (container.nodeType == 3) {
					if (start && offset === 0) {
						walker.prev();
					} else if (!start && offset == container.nodeValue.length) {
						walker.next();
					}
				}

				while ((node = walker.current())) {
					if (node.nodeType === 1) {
						// Ignore bogus elements
						if (!node.getAttribute('data-mce-bogus')) {
							// Keep empty elements like <img /> <input /> but not trailing br:s like <p>text|<br></p>
							name = node.nodeName.toLowerCase();
							if (nonEmptyElementsMap[name] && name !== 'br') {
								return false;
							}
						}
					} else if (node.nodeType === 3 && !/^[ \t\r\n]*$/.test(node.nodeValue)) {
						return false;
					}

					if (start) {
						walker.prev();
					} else {
						walker.next();
					}
				}

				return true;
			}

			// Wraps any text nodes or inline elements in the specified forced root block name
			function wrapSelfAndSiblingsInDefaultBlock(container, offset) {
				var newBlock, parentBlock, startNode, node, next, rootBlockName, blockName = newBlockName || 'P';

				// Not in a block element or in a table cell or caption
				parentBlock = dom.getParent(container, dom.isBlock);
				rootBlockName = editor.getBody().nodeName.toLowerCase();
				if (!parentBlock || !canSplitBlock(parentBlock)) {
					parentBlock = parentBlock || editableRoot;

					if (!parentBlock.hasChildNodes()) {
						newBlock = dom.create(blockName);
						setForcedBlockAttrs(newBlock);
						parentBlock.appendChild(newBlock);
						rng.setStart(newBlock, 0);
						rng.setEnd(newBlock, 0);
						return newBlock;
					}

					// Find parent that is the first child of parentBlock
					node = container;
					while (node.parentNode != parentBlock) {
						node = node.parentNode;
					}

					// Loop left to find start node start wrapping at
					while (node && !dom.isBlock(node)) {
						startNode = node;
						node = node.previousSibling;
					}

					if (startNode && schema.isValidChild(rootBlockName, blockName.toLowerCase())) {
						newBlock = dom.create(blockName);
						setForcedBlockAttrs(newBlock);
						startNode.parentNode.insertBefore(newBlock, startNode);

						// Start wrapping until we hit a block
						node = startNode;
						while (node && !dom.isBlock(node)) {
							next = node.nextSibling;
							newBlock.appendChild(node);
							node = next;
						}

						// Restore range to it's past location
						rng.setStart(container, offset);
						rng.setEnd(container, offset);
					}
				}

				return container;
			}

			// Inserts a block or br before/after or in the middle of a split list of the LI is empty
			function handleEmptyListItem() {
				function isFirstOrLastLi(first) {
					var node = containerBlock[first ? 'firstChild' : 'lastChild'];

					// Find first/last element since there might be whitespace there
					while (node) {
						if (node.nodeType == 1) {
							break;
						}

						node = node[first ? 'nextSibling' : 'previousSibling'];
					}

					return node === parentBlock;
				}

				function getContainerBlock() {
					var containerBlockParent = containerBlock.parentNode;

					if (containerBlockParent.nodeName == 'LI') {
						return containerBlockParent;
					}

					return containerBlock;
				}

				// Check if we are in an nested list
				var containerBlockParentName = containerBlock.parentNode.nodeName;
				if (/^(OL|UL|LI)$/.test(containerBlockParentName)) {
					newBlockName = 'LI';
				}

				newBlock = newBlockName ? createNewBlock(newBlockName) : dom.create('BR');

				if (isFirstOrLastLi(true) && isFirstOrLastLi()) {
					if (containerBlockParentName == 'LI') {
						// Nested list is inside a LI
						dom.insertAfter(newBlock, getContainerBlock());
					} else {
						// Is first and last list item then replace the OL/UL with a text block
						dom.replace(newBlock, containerBlock);
					}
				} else if (isFirstOrLastLi(true)) {
					if (containerBlockParentName == 'LI') {
						// List nested in an LI then move the list to a new sibling LI
						dom.insertAfter(newBlock, getContainerBlock());
						newBlock.appendChild(dom.doc.createTextNode(' ')); // Needed for IE so the caret can be placed
						newBlock.appendChild(containerBlock);
					} else {
						// First LI in list then remove LI and add text block before list
						containerBlock.parentNode.insertBefore(newBlock, containerBlock);
					}
				} else if (isFirstOrLastLi()) {
					// Last LI in list then remove LI and add text block after list
					dom.insertAfter(newBlock, getContainerBlock());
					renderBlockOnIE(newBlock);
				} else {
					// Middle LI in list the split the list and insert a text block in the middle
					// Extract after fragment and insert it after the current block
					containerBlock = getContainerBlock();
					tmpRng = rng.cloneRange();
					tmpRng.setStartAfter(parentBlock);
					tmpRng.setEndAfter(containerBlock);
					fragment = tmpRng.extractContents();

					if (newBlockName == 'LI' && fragment.firstChild.nodeName == 'LI') {
						newBlock = fragment.firstChild;
						dom.insertAfter(fragment, containerBlock);
					} else {
						dom.insertAfter(fragment, containerBlock);
						dom.insertAfter(newBlock, containerBlock);
					}
				}

				dom.remove(parentBlock);
				moveToCaretPosition(newBlock);
				undoManager.add();
			}

			// Walks the parent block to the right and look for BR elements
			function hasRightSideContent() {
				var walker = new TreeWalker(container, parentBlock), node;

				while ((node = walker.next())) {
					if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
						return true;
					}
				}
			}

			// Inserts a BR element if the forced_root_block option is set to false or empty string
			function insertBr() {
				var brElm, extraBr, marker;

				if (container && container.nodeType == 3 && offset >= container.nodeValue.length) {
					// Insert extra BR element at the end block elements
					if (!isIE && !hasRightSideContent()) {
						brElm = dom.create('br');
						rng.insertNode(brElm);
						rng.setStartAfter(brElm);
						rng.setEndAfter(brElm);
						extraBr = true;
					}
				}

				brElm = dom.create('br');
				rng.insertNode(brElm);

				// Rendering modes below IE8 doesn't display BR elements in PRE unless we have a \n before it
				if (isIE && parentBlockName == 'PRE' && (!documentMode || documentMode < 8)) {
					brElm.parentNode.insertBefore(dom.doc.createTextNode('\r'), brElm);
				}

				// Insert temp marker and scroll to that
				marker = dom.create('span', {}, '&nbsp;');
				brElm.parentNode.insertBefore(marker, brElm);
				selection.scrollIntoView(marker);
				dom.remove(marker);

				if (!extraBr) {
					rng.setStartAfter(brElm);
					rng.setEndAfter(brElm);
				} else {
					rng.setStartBefore(brElm);
					rng.setEndBefore(brElm);
				}

				selection.setRng(rng);
				undoManager.add();
			}

			// Trims any linebreaks at the beginning of node user for example when pressing enter in a PRE element
			function trimLeadingLineBreaks(node) {
				do {
					if (node.nodeType === 3) {
						node.nodeValue = node.nodeValue.replace(/^[\r\n]+/, '');
					}

					node = node.firstChild;
				} while (node);
			}

			function getEditableRoot(node) {
				var root = dom.getRoot(), parent, editableRoot;

				// Get all parents until we hit a non editable parent or the root
				parent = node;
				while (parent !== root && dom.getContentEditable(parent) !== "false") {
					if (dom.getContentEditable(parent) === "true") {
						editableRoot = parent;
					}

					parent = parent.parentNode;
				}

				return parent !== root ? editableRoot : root;
			}

			// Adds a BR at the end of blocks that only contains an IMG or INPUT since
			// these might be floated and then they won't expand the block
			function addBrToBlockIfNeeded(block) {
				var lastChild;

				// IE will render the blocks correctly other browsers needs a BR
				if (!isIE) {
					block.normalize(); // Remove empty text nodes that got left behind by the extract

					// Check if the block is empty or contains a floated last child
					lastChild = block.lastChild;
					if (!lastChild || (/^(left|right)$/gi.test(dom.getStyle(lastChild, 'float', true)))) {
						dom.add(block, 'br');
					}
				}
			}

			rng = selection.getRng(true);

			// Event is blocked by some other handler for example the lists plugin
			if (evt.isDefaultPrevented()) {
				return;
			}

			// Delete any selected contents
			if (!rng.collapsed) {
				editor.execCommand('Delete');
				return;
			}

			// Setup range items and newBlockName
			new RangeUtils(dom).normalize(rng);
			container = rng.startContainer;
			offset = rng.startOffset;
			newBlockName = (settings.force_p_newlines ? 'p' : '') || settings.forced_root_block;
			newBlockName = newBlockName ? newBlockName.toUpperCase() : '';
			documentMode = dom.doc.documentMode;
			shiftKey = evt.shiftKey;

			// Resolve node index
			if (container.nodeType == 1 && container.hasChildNodes()) {
				isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

				container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
				if (isAfterLastNodeInContainer && container.nodeType == 3) {
					offset = container.nodeValue.length;
				} else {
					offset = 0;
				}
			}

			// Get editable root node normaly the body element but sometimes a div or span
			editableRoot = getEditableRoot(container);

			// If there is no editable root then enter is done inside a contentEditable false element
			if (!editableRoot) {
				return;
			}

			undoManager.beforeChange();

			// If editable root isn't block nor the root of the editor
			if (!dom.isBlock(editableRoot) && editableRoot != dom.getRoot()) {
				if (!newBlockName || shiftKey) {
					insertBr();
				}

				return;
			}

			// Wrap the current node and it's sibling in a default block if it's needed.
			// for example this <td>text|<b>text2</b></td> will become this <td><p>text|<b>text2</p></b></td>
			// This won't happen if root blocks are disabled or the shiftKey is pressed
			if ((newBlockName && !shiftKey) || (!newBlockName && shiftKey)) {
				container = wrapSelfAndSiblingsInDefaultBlock(container, offset);
			}

			// Find parent block and setup empty block paddings
			parentBlock = dom.getParent(container, dom.isBlock);
			containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;

			// Setup block names
			parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
			containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

			// Enter inside block contained within a LI then split or insert before/after LI
			if (containerBlockName == 'LI' && !evt.ctrlKey) {
				parentBlock = containerBlock;
				parentBlockName = containerBlockName;
			}

			// Handle enter in LI
			if (parentBlockName == 'LI') {
				if (!newBlockName && shiftKey) {
					insertBr();
					return;
				}

				// Handle enter inside an empty list item
				if (dom.isEmpty(parentBlock)) {
					handleEmptyListItem();
					return;
				}
			}

			// Don't split PRE tags but insert a BR instead easier when writing code samples etc
			if (parentBlockName == 'PRE' && settings.br_in_pre !== false) {
				if (!shiftKey) {
					insertBr();
					return;
				}
			} else {
				// If no root block is configured then insert a BR by default or if the shiftKey is pressed
				if ((!newBlockName && !shiftKey && parentBlockName != 'LI') || (newBlockName && shiftKey)) {
					insertBr();
					return;
				}
			}

			// If parent block is root then never insert new blocks
			if (newBlockName && parentBlock === editor.getBody()) {
				return;
			}

			// Default block name if it's not configured
			newBlockName = newBlockName || 'P';

			// Insert new block before/after the parent block depending on caret location
			if (isCaretAtStartOrEndOfBlock()) {
				// If the caret is at the end of a header we produce a P tag after it similar to Word unless we are in a hgroup
				if (/^(H[1-6]|PRE|FIGURE)$/.test(parentBlockName) && containerBlockName != 'HGROUP') {
					newBlock = createNewBlock(newBlockName);
				} else {
					newBlock = createNewBlock();
				}

				// Split the current container block element if enter is pressed inside an empty inner block element
				if (settings.end_container_on_empty_block && canSplitBlock(containerBlock) && dom.isEmpty(parentBlock)) {
					// Split container block for example a BLOCKQUOTE at the current blockParent location for example a P
					newBlock = dom.split(containerBlock, parentBlock);
				} else {
					dom.insertAfter(newBlock, parentBlock);
				}

				moveToCaretPosition(newBlock);
			} else if (isCaretAtStartOrEndOfBlock(true)) {
				// Insert new block before
				newBlock = parentBlock.parentNode.insertBefore(createNewBlock(), parentBlock);
				renderBlockOnIE(newBlock);
				moveToCaretPosition(parentBlock);
			} else {
				// Extract after fragment and insert it after the current block
				tmpRng = rng.cloneRange();
				tmpRng.setEndAfter(parentBlock);
				fragment = tmpRng.extractContents();
				trimLeadingLineBreaks(fragment);
				newBlock = fragment.firstChild;
				dom.insertAfter(fragment, parentBlock);
				trimInlineElementsOnLeftSideOfBlock(newBlock);
				addBrToBlockIfNeeded(parentBlock);
				moveToCaretPosition(newBlock);
			}

			dom.setAttrib(newBlock, 'id', ''); // Remove ID since it needs to be document unique

			// Allow custom handling of new blocks
			editor.fire('NewBlock', { newBlock: newBlock });

			undoManager.add();
		}

		editor.on('keydown', function(evt) {
			if (evt.keyCode == 13) {
				if (handleEnterKey(evt) !== false) {
					evt.preventDefault();
				}
			}
		});
	};
});

// Included from: js/tinymce/classes/ForceBlocks.js

/**
 * ForceBlocks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/ForceBlocks", [], function() {
	return function(editor) {
		var settings = editor.settings, dom = editor.dom, selection = editor.selection;
		var schema = editor.schema, blockElements = schema.getBlockElements();

		function addRootBlocks() {
			var node = selection.getStart(), rootNode = editor.getBody(), rng;
			var startContainer, startOffset, endContainer, endOffset, rootBlockNode;
			var tempNode, offset = -0xFFFFFF, wrapped, restoreSelection;
			var tmpRng, rootNodeName, forcedRootBlock;

			forcedRootBlock = settings.forced_root_block;

			if (!node || node.nodeType !== 1 || !forcedRootBlock) {
				return;
			}

			// Check if node is wrapped in block
			while (node && node != rootNode) {
				if (blockElements[node.nodeName]) {
					return;
				}

				node = node.parentNode;
			}

			// Get current selection
			rng = selection.getRng();
			if (rng.setStart) {
				startContainer = rng.startContainer;
				startOffset = rng.startOffset;
				endContainer = rng.endContainer;
				endOffset = rng.endOffset;

				try {
					restoreSelection = editor.getDoc().activeElement === rootNode;
				} catch (ex) {
					// IE throws unspecified error here sometimes
				}
			} else {
				// Force control range into text range
				if (rng.item) {
					node = rng.item(0);
					rng = editor.getDoc().body.createTextRange();
					rng.moveToElementText(node);
				}

				restoreSelection = rng.parentElement().ownerDocument === editor.getDoc();
				tmpRng = rng.duplicate();
				tmpRng.collapse(true);
				startOffset = tmpRng.move('character', offset) * -1;

				if (!tmpRng.collapsed) {
					tmpRng = rng.duplicate();
					tmpRng.collapse(false);
					endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
				}
			}

			// Wrap non block elements and text nodes
			node = rootNode.firstChild;
			rootNodeName = rootNode.nodeName.toLowerCase();
			while (node) {
				// TODO: Break this up, too complex
				if (((node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName]))) &&
					schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase())) {
					// Remove empty text nodes
					if (node.nodeType === 3 && node.nodeValue.length === 0) {
						tempNode = node;
						node = node.nextSibling;
						dom.remove(tempNode);
						continue;
					}

					if (!rootBlockNode) {
						rootBlockNode = dom.create(forcedRootBlock, editor.settings.forced_root_block_attrs);
						node.parentNode.insertBefore(rootBlockNode, node);
						wrapped = true;
					}

					tempNode = node;
					node = node.nextSibling;
					rootBlockNode.appendChild(tempNode);
				} else {
					rootBlockNode = null;
					node = node.nextSibling;
				}
			}

			if (wrapped && restoreSelection) {
				if (rng.setStart) {
					rng.setStart(startContainer, startOffset);
					rng.setEnd(endContainer, endOffset);
					selection.setRng(rng);
				} else {
					// Only select if the previous selection was inside the document to prevent auto focus in quirks mode
					try {
						rng = editor.getDoc().body.createTextRange();
						rng.moveToElementText(rootNode);
						rng.collapse(true);
						rng.moveStart('character', startOffset);

						if (endOffset > 0) {
							rng.moveEnd('character', endOffset);
						}

						rng.select();
					} catch (ex) {
						// Ignore
					}
				}

				editor.nodeChanged();
			}
		}

		// Force root blocks
		if (settings.forced_root_block) {
			editor.on('NodeChange', addRootBlocks);
		}
	};
});

// Included from: js/tinymce/classes/EditorCommands.js

/**
 * EditorCommands.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */
define("tinymce/EditorCommands", [
	"tinymce/html/Serializer",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Serializer, Env, Tools) {
	// Added for compression purposes
	var each = Tools.each, extend = Tools.extend;
	var map = Tools.map, inArray = Tools.inArray, explode = Tools.explode;
	var isGecko = Env.gecko, isIE = Env.ie;
	var TRUE = true, FALSE = false;

	return function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec: {}, value: {}},
			settings = editor.settings,
			formatter = editor.formatter,
			bookmark;

		/**
		 * Executes the specified command.
		 *
		 * @method execCommand
		 * @param {String} command Command to execute.
		 * @param {Boolean} ui Optional user interface state.
		 * @param {Object} value Optional value for command.
		 * @return {Boolean} true/false if the command was found or not.
		 */
		function execCommand(command, ui, value) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.exec[command])) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		}

		/**
		 * Queries the current state for a command for example if the current selection is "bold".
		 *
		 * @method queryCommandState
		 * @param {String} command Command to check the state of.
		 * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
		 */
		function queryCommandState(command) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.state[command])) {
				return func(command);
			}

			return -1;
		}

		/**
		 * Queries the command value for example the current fontsize.
		 *
		 * @method queryCommandValue
		 * @param {String} command Command to check the value of.
		 * @return {Object} Command value of false if it's not found.
		 */
		function queryCommandValue(command) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.value[command])) {
				return func(command);
			}

			return FALSE;
		}

		/**
		 * Adds commands to the command collection.
		 *
		 * @method addCommands
		 * @param {Object} command_list Name/value collection with commands to add, the names can also be comma separated.
		 * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
		 */
		function addCommands(command_list, type) {
			type = type || 'exec';

			each(command_list, function(callback, command) {
				each(command.toLowerCase().split(','), function(command) {
					commands[type][command] = callback;
				});
			});
		}

		// Expose public methods
		extend(this, {
			execCommand: execCommand,
			queryCommandState: queryCommandState,
			queryCommandValue: queryCommandValue,
			addCommands: addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undefined) {
				ui = FALSE;
			}

			if (value === undefined) {
				value = null;
			}

			return editor.getDoc().execCommand(command, ui, value);
		}

		function isFormatMatch(name) {
			return formatter.match(name);
		}

		function toggleFormat(name, value) {
			formatter.toggle(name, value ? {value: value} : undefined);
			editor.nodeChanged();
		}

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		}

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		}

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel': function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel': function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste': function(command) {
				var doc = editor.getDoc(), failed;

				// Try executing the native command
				try {
					execNativeCommand(command);
				} catch (ex) {
					// Command failed
					failed = TRUE;
				}

				// Present alert message about clipboard access not being available
				if (failed || !doc.queryCommandSupported(command)) {
					var msg = editor.translate(
						"Your browser doesn't support direct access to the clipboard. " +
						"Please use the Ctrl+X/C/V keyboard shortcuts instead."
					);

					if (Env.mac) {
						msg = msg.replace(/Ctrl\+/g, '\u2318+');
					}

					editor.windowManager.alert(msg);
				}
			},

			// Override unlink command
			unlink: function() {
				if (selection.isCollapsed()) {
					var elm = selection.getNode();
					if (elm.tagName == 'A') {
						editor.dom.remove(elm, true);
					}

					return;
				}

				formatter.remove("link");
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function(command) {
				var align = command.substring(7);

				if (align == 'full') {
					align = 'justify';
				}

				// Remove all other alignments first
				each('left,center,right,justify'.split(','), function(name) {
					if (align != name) {
						formatter.remove('align' + name);
					}
				});

				toggleFormat('align' + align);
				execCommand('mceRepaint');
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList': function(command) {
				var listElm, listParent;

				execNativeCommand(command);

				// WebKit produces lists within block elements so we need to split them
				// we will replace the native list creation logic to custom logic later on
				// TODO: Remove this when the list creation logic is removed
				listElm = dom.getParent(selection.getNode(), 'ol,ul');
				if (listElm) {
					listParent = listElm.parentNode;

					// If list is within a text block then split that block
					if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
						storeSelection();
						dom.split(listParent, listElm);
						restoreSelection();
					}
				}
			},

			// Override commands to use the text formatter engine
			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName': function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize: function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = explode(settings.font_size_style_values);
					fontClasses = explode(settings.font_size_classes);

					if (fontClasses) {
						value = fontClasses[value - 1] || value;
					} else {
						value = fontSizes[value - 1] || value;
					}
				}

				toggleFormat(command, value);
			},

			RemoveFormat: function(command) {
				formatter.remove(command);
			},

			mceBlockQuote: function() {
				toggleFormat('blockquote');
			},

			FormatBlock: function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup: function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup: TRUE}), {cleanup: TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode: function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth: function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode: function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent: function(command, ui, value) {
				var parser, serializer, parentNode, rootNode, fragment, args;
				var marker, rng, node, node2, bookmarkHtml;

				function trimOrPaddLeftRight(html) {
					var rng, container, offset;

					rng = selection.getRng(true);
					container = rng.startContainer;
					offset = rng.startOffset;

					function hasSiblingText(siblingName) {
						return container[siblingName] && container[siblingName].nodeType == 3;
					}

					if (container.nodeType == 3) {
						if (offset > 0) {
							html = html.replace(/^&nbsp;/, ' ');
						} else if (!hasSiblingText('previousSibling')) {
							html = html.replace(/^ /, '&nbsp;');
						}

						if (offset < container.length) {
							html = html.replace(/&nbsp;(<br>|)$/, ' ');
						} else if (!hasSiblingText('nextSibling')) {
							html = html.replace(/(&nbsp;| )(<br>|)$/, '&nbsp;');
						}
					}

					return html;
				}

				// Check for whitespace before/after value
				if (/^ | $/.test(value)) {
					value = trimOrPaddLeftRight(value);
				}

				// Setup parser and serializer
				parser = editor.parser;
				serializer = new Serializer({}, editor.schema);
				bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#200B;</span>';

				// Run beforeSetContent handlers on the HTML to be inserted
				args = {content: value, format: 'html', selection: true};
				editor.fire('BeforeSetContent', args);
				value = args.content;

				// Add caret at end of contents if it's missing
				if (value.indexOf('{$caret}') == -1) {
					value += '{$caret}';
				}

				// Replace the caret marker with a span bookmark element
				value = value.replace(/\{\$caret\}/, bookmarkHtml);

				// If selection is at <body>|<p></p> then move it into <body><p>|</p>
				rng = selection.getRng();
				var caretElement = rng.startContainer || (rng.parentElement ? rng.parentElement() : null);
				var body = editor.getBody();
				if (caretElement === body && selection.isCollapsed()) {
					if (dom.isBlock(body.firstChild) && dom.isEmpty(body.firstChild)) {
						rng = dom.createRng();
						rng.setStart(body.firstChild, 0);
						rng.setEnd(body.firstChild, 0);
						selection.setRng(rng);
					}
				}

				// Insert node maker where we will insert the new HTML and get it's parent
				if (!selection.isCollapsed()) {
					editor.getDoc().execCommand('Delete', false, null);
				}

				parentNode = selection.getNode();

				// Parse the fragment within the context of the parent node
				var parserArgs = {context: parentNode.nodeName.toLowerCase()};
				fragment = parser.parse(value, parserArgs);

				// Move the caret to a more suitable location
				node = fragment.lastChild;
				if (node.attr('id') == 'mce_marker') {
					marker = node;

					for (node = node.prev; node; node = node.walk(true)) {
						if (node.type == 3 || !dom.isBlock(node.name)) {
							node.parent.insert(marker, node, node.name === 'br');
							break;
						}
					}
				}

				// If parser says valid we can insert the contents into that parent
				if (!parserArgs.invalid) {
					value = serializer.serialize(fragment);

					// Check if parent is empty or only has one BR element then set the innerHTML of that parent
					node = parentNode.firstChild;
					node2 = parentNode.lastChild;
					if (!node || (node === node2 && node.nodeName === 'BR')) {
						dom.setHTML(parentNode, value);
					} else {
						selection.setContent(value);
					}
				} else {
					// If the fragment was invalid within that context then we need
					// to parse and process the parent it's inserted into

					// Insert bookmark node and get the parent
					selection.setContent(bookmarkHtml);
					parentNode = selection.getNode();
					rootNode = editor.getBody();

					// Opera will return the document node when selection is in root
					if (parentNode.nodeType == 9) {
						parentNode = node = rootNode;
					} else {
						node = parentNode;
					}

					// Find the ancestor just before the root element
					while (node !== rootNode) {
						parentNode = node;
						node = node.parentNode;
					}

					// Get the outer/inner HTML depending on if we are in the root and parser and serialize that
					value = parentNode == rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
					value = serializer.serialize(
						parser.parse(
							// Need to replace by using a function since $ in the contents would otherwise be a problem
							value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function() {
								return serializer.serialize(fragment);
							})
						)
					);

					// Set the inner/outer HTML depending on if we are in the root or not
					if (parentNode == rootNode) {
						dom.setHTML(rootNode, value);
					} else {
						dom.setOuterHTML(parentNode, value);
					}
				}

				marker = dom.get('mce_marker');
				selection.scrollIntoView(marker);

				// Move selection before marker and remove it
				rng = dom.createRng();

				// If previous sibling is a text node set the selection to the end of that node
				node = marker.previousSibling;
				if (node && node.nodeType == 3) {
					rng.setStart(node, node.nodeValue.length);

					// TODO: Why can't we normalize on IE
					if (!isIE) {
						node2 = marker.nextSibling;
						if (node2 && node2.nodeType == 3) {
							node.appendData(node2.data);
							node2.parentNode.removeChild(node2);
						}
					}
				} else {
					// If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
					rng.setStartBefore(marker);
					rng.setEndBefore(marker);
				}

				// Remove the marker node and set the new range
				dom.remove(marker);
				selection.setRng(rng);

				// Dispatch after event and add any visual elements needed
				editor.fire('SetContent', args);
				editor.addVisual();
			},

			mceInsertRawHTML: function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(
					editor.getContent().replace(/tiny_mce_marker/g, function() {
						return value;
					})
				);
			},

			mceToggleFormat: function(command, ui, value) {
				toggleFormat(value);
			},

			mceSetContent: function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent': function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue, 10);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
					// If forced_root_blocks is set to false we don't have a block to indent so lets create a div
					if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
						formatter.apply('div');
					}

					each(selection.getSelectedBlocks(), function(element) {
						if (element.nodeName != "LI") {
							var indentStyleName = editor.getParam('indent_use_margin', false) ? 'margin' : 'padding';

							indentStyleName += dom.getStyle(element, 'direction', true) == 'rtl' ? 'Right' : 'Left';

							if (command == 'outdent') {
								value = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - intentValue);
								dom.setStyle(element, indentStyleName, value ? value + indentUnit : '');
							} else {
								value = (parseInt(element.style[indentStyleName] || 0, 10) + intentValue) + indentUnit;
								dom.setStyle(element, indentStyleName, value);
							}
						}
					});
				} else {
					execNativeCommand(command);
				}
			},

			mceRepaint: function() {
				if (isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel()) {
							selection.getSel().selectAllChildren(editor.getBody());
						}

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			InsertHorizontalRule: function() {
				editor.execCommand('mceInsertContent', false, '<hr />');
			},

			mceToggleVisualAid: function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent: function(command, ui, value) {
				editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({format: 'text'})));
			},

			mceInsertLink: function(command, ui, value) {
				var anchor;

				if (typeof(value) == 'string') {
					value = {href: value};
				}

				anchor = dom.getParent(selection.getNode(), 'a');

				// Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
				value.href = value.href.replace(' ', '%20');

				// Remove existing links if there could be child links or that the href isn't specified
				if (!anchor || !value.href) {
					formatter.remove('link');
				}

				// Apply new link to selection
				if (value.href) {
					formatter.apply('link', value, anchor);
				}
			},

			selectAll: function() {
				var root = dom.getRoot(), rng;

				if (selection.getRng().setStart) {
					rng = dom.createRng();
					rng.setStart(root, 0);
					rng.setEnd(root, root.childNodes.length);
					selection.setRng(rng);
				} else {
					// IE will render it's own root level block elements and sometimes
					// even put font elements in them when the user starts typing. So we need to
					// move the selection to a more suitable element from this:
					// <body>|<p></p></body> to this: <body><p>|</p></body>
					rng = selection.getRng();
					if (!rng.item) {
						rng.moveToElementText(root);
						rng.select();
					}
				}
			},

			"delete": function() {
				execNativeCommand("Delete");

				// Check if body is empty after the delete call if so then set the contents
				// to an empty string and move the caret to any block produced by that operation
				// this fixes the issue with root blocks not being properly produced after a delete call on IE
				var body = editor.getBody();

				if (dom.isEmpty(body)) {
					editor.setContent('');

					if (body.firstChild && dom.isBlock(body.firstChild)) {
						editor.selection.setCursorLocation(body.firstChild, 0);
					} else {
						editor.selection.setCursorLocation(body, 0);
					}
				}
			},

			mceNewDocument: function() {
				editor.setContent('');
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function(command) {
				var name = 'align' + command.substring(7);
				var nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
				var matches = map(nodes, function(node) {
					return !!formatter.matchNode(node, name);
				});
				return inArray(matches, TRUE) !== -1;
			},

			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote: function() {
				return isFormatMatch('blockquote');
			},

			Outdent: function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
						return TRUE;
					}

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
						return TRUE;
					}
				}

				return (
					queryCommandState('InsertUnorderedList') ||
					queryCommandState('InsertOrderedList') ||
					(!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'))
				);
			},

			'InsertUnorderedList,InsertOrderedList': function(command) {
				var list = dom.getParent(selection.getNode(), 'ul,ol');

				return list &&
					(
						command === 'insertunorderedlist' && list.tagName === 'UL' ||
						command === 'insertorderedlist' && list.tagName === 'OL'
					);
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName': function(command) {
				var value = 0, parent;

				if ((parent = dom.getParent(selection.getNode(), 'span'))) {
					if (command == 'fontsize') {
						value = parent.style.fontSize;
					} else {
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
					}
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		addCommands({
			Undo: function() {
				editor.undoManager.undo();
			},

			Redo: function() {
				editor.undoManager.redo();
			}
		});
	};
});

// Included from: js/tinymce/classes/util/URI.js

/**
 * URI.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles parsing, modification and serialization of URI/URL strings.
 * @class tinymce.util.URI
 */
define("tinymce/util/URI", [
	"tinymce/util/Tools"
], function(Tools) {
	var each = Tools.each, trim = Tools.trim;

	/**
	 * Constructs a new URI instance.
	 *
	 * @constructor
	 * @method URI
	 * @param {String} url URI string to parse.
	 * @param {Object} settings Optional settings object.
	 */
	function URI(url, settings) {
		var self = this, baseUri, base_url;

		// Trim whitespace
		url = trim(url);

		// Default settings
		settings = self.settings = settings || {};

		// Strange app protocol that isn't http/https or local anchor
		// For example: mailto,skype,tel etc.
		if (/^([\w\-]+):([^\/]{2})/i.test(url) || /^\s*#/.test(url)) {
			self.source = url;
			return;
		}

		var isProtocolRelative = url.indexOf('//') === 0;

		// Absolute path with no host, fake host and protocol
		if (url.indexOf('/') === 0 && !isProtocolRelative) {
			url = (settings.base_uri ? settings.base_uri.protocol || 'http' : 'http') + '://mce_host' + url;
		}

		// Relative path http:// or protocol relative //path
		if (!/^[\w\-]*:?\/\//.test(url)) {
			base_url = settings.base_uri ? settings.base_uri.path : new URI(location.href).directory;
			if (settings.base_uri.protocol === "") {
				url = '//mce_host' + self.toAbsPath(base_url, url);
			} else {
				url = ((settings.base_uri && settings.base_uri.protocol) || 'http') + '://mce_host' + self.toAbsPath(base_url, url);
			}
		}

		// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
		url = url.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something

		/*jshint maxlen: 255 */
		url = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

		each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
			var part = url[i];

			// Zope 3 workaround, they use @@something
			if (part) {
				part = part.replace(/\(mce_at\)/g, '@@');
			}

			self[v] = part;
		});

		baseUri = settings.base_uri;
		if (baseUri) {
			if (!self.protocol) {
				self.protocol = baseUri.protocol;
			}

			if (!self.userInfo) {
				self.userInfo = baseUri.userInfo;
			}

			if (!self.port && self.host === 'mce_host') {
				self.port = baseUri.port;
			}

			if (!self.host || self.host === 'mce_host') {
				self.host = baseUri.host;
			}

			self.source = '';
		}

		if (isProtocolRelative) {
			self.protocol = '';
		}

		//t.path = t.path || '/';
	}

	URI.prototype = {
		/**
		 * Sets the internal path part of the URI.
		 *
		 * @method setPath
		 * @param {string} path Path string to set.
		 */
		setPath: function(path) {
			var self = this;

			path = /^(.*?)\/?(\w+)?$/.exec(path);

			// Update path parts
			self.path = path[0];
			self.directory = path[1];
			self.file = path[2];

			// Rebuild source
			self.source = '';
			self.getURI();
		},

		/**
		 * Converts the specified URI into a relative URI based on the current URI instance location.
		 *
		 * @method toRelative
		 * @param {String} uri URI to convert into a relative path/URI.
		 * @return {String} Relative URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an absolute URL to an relative URL url will be somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
		 */
		toRelative: function(uri) {
			var self = this, output;

			if (uri === "./") {
				return uri;
			}

			uri = new URI(uri, {base_uri: self});

			// Not on same domain/port or protocol
			if ((uri.host != 'mce_host' && self.host != uri.host && uri.host) || self.port != uri.port ||
				(self.protocol != uri.protocol && uri.protocol !== "")) {
				return uri.getURI();
			}

			var tu = self.getURI(), uu = uri.getURI();

			// Allow usage of the base_uri when relative_urls = true
			if (tu == uu || (tu.charAt(tu.length - 1) == "/" && tu.substr(0, tu.length - 1) == uu)) {
				return tu;
			}

			output = self.toRelPath(self.path, uri.path);

			// Add query
			if (uri.query) {
				output += '?' + uri.query;
			}

			// Add anchor
			if (uri.anchor) {
				output += '#' + uri.anchor;
			}

			return output;
		},

		/**
		 * Converts the specified URI into a absolute URI based on the current URI instance location.
		 *
		 * @method toAbsolute
		 * @param {String} uri URI to convert into a relative path/URI.
		 * @param {Boolean} noHost No host and protocol prefix.
		 * @return {String} Absolute URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an relative URL to an absolute URL url will be http://www.site.com/dir/somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
		 */
		toAbsolute: function(uri, noHost) {
			uri = new URI(uri, {base_uri: this});

			return uri.getURI(this.host == uri.host && this.protocol == uri.protocol ? noHost : 0);
		},

		/**
		 * Converts a absolute path into a relative path.
		 *
		 * @method toRelPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Absolute path to convert into a relative path.
		 */
		toRelPath: function(base, path) {
			var items, breakPoint = 0, out = '', i, l;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0, l = base.length; i < l; i++) {
					if (i >= items.length || base[i] != items[i]) {
						breakPoint = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0, l = items.length; i < l; i++) {
					if (i >= base.length || base[i] != items[i]) {
						breakPoint = i + 1;
						break;
					}
				}
			}

			if (breakPoint === 1) {
				return path;
			}

			for (i = 0, l = base.length - (breakPoint - 1); i < l; i++) {
				out += "../";
			}

			for (i = breakPoint - 1, l = items.length; i < l; i++) {
				if (i != breakPoint - 1) {
					out += "/" + items[i];
				} else {
					out += items[i];
				}
			}

			return out;
		},

		/**
		 * Converts a relative path into a absolute path.
		 *
		 * @method toAbsPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Relative path to convert into an absolute path.
		 */
		toAbsPath: function(base, path) {
			var i, nb = 0, o = [], tr, outPath;

			// Split paths
			tr = /\/$/.test(path) ? '/' : '';
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k) {
					o.push(k);
				}
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length === 0 || path[i] === ".") {
					continue;
				}

				// Is parent
				if (path[i] === '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0) {
				outPath = o.reverse().join('/');
			} else {
				outPath = base.slice(0, i).join('/') + '/' + o.reverse().join('/');
			}

			// Add front / if it's needed
			if (outPath.indexOf('/') !== 0) {
				outPath = '/' + outPath;
			}

			// Add traling / if it's needed
			if (tr && outPath.lastIndexOf('/') !== outPath.length - 1) {
				outPath += tr;
			}

			return outPath;
		},

		/**
		 * Returns the full URI of the internal structure.
		 *
		 * @method getURI
		 * @param {Boolean} noProtoHost Optional no host and protocol part. Defaults to false.
		 */
		getURI: function(noProtoHost) {
			var s, self = this;

			// Rebuild source
			if (!self.source || noProtoHost) {
				s = '';

				if (!noProtoHost) {
					if (self.protocol) {
						s += self.protocol + '://';
					} else {
						s += '//';
					}

					if (self.userInfo) {
						s += self.userInfo + '@';
					}

					if (self.host) {
						s += self.host;
					}

					if (self.port) {
						s += ':' + self.port;
					}
				}

				if (self.path) {
					s += self.path;
				}

				if (self.query) {
					s += '?' + self.query;
				}

				if (self.anchor) {
					s += '#' + self.anchor;
				}

				self.source = s;
			}

			return self.source;
		}
	};

	return URI;
});

// Included from: js/tinymce/classes/util/Class.js

/**
 * Class.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * This utilitiy class is used for easier inheritage.
 *
 * Features:
 * * Exposed super functions: this._super();
 * * Mixins
 * * Dummy functions
 * * Property functions: var value = object.value(); and object.value(newValue);
 * * Static functions
 * * Defaults settings
 */
define("tinymce/util/Class", [
	"tinymce/util/Tools"
], function(Tools) {
	var each = Tools.each, extend = Tools.extend;

	var extendClass, initializing;

	function Class() {
	}

	// Provides classical inheritance, based on code made by John Resig
	Class.extend = extendClass = function(prop) {
		var Self = this, _super = Self.prototype, prototype, name, member;

		// The dummy class constructor
		function Class() {
			var i, mixins, mixin, self;

			// All construction is actually done in the init method
			if (!initializing) {
				self = this;

				// Run class constuctor
				if (self.init) {
					self.init.apply(self, arguments);
				}

				// Run mixin constructors
				mixins = self.Mixins;
				if (mixins) {
					i = mixins.length;
					while (i--) {
						mixin = mixins[i];
						if (mixin.init) {
							mixin.init.apply(self, arguments);
						}
					}
				}
			}
		}

		// Dummy function, needs to be extended in order to provide functionality
		function dummy() {
			return this;
		}

		// Creates a overloaded method for the class
		// this enables you to use this._super(); to call the super function
		function createMethod(name, fn) {
			return function(){
				var self = this, tmp = self._super, ret;

				self._super = _super[name];
				ret = fn.apply(self, arguments);
				self._super = tmp;

				return ret;
			};
		}

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new Self();
		initializing = false;

		// Add mixins
		if (prop.Mixins) {
			each(prop.Mixins, function(mixin) {
				mixin = mixin;

				for (var name in mixin) {
					if (name !== "init") {
						prop[name] = mixin[name];
					}
				}
			});

			if (_super.Mixins) {
				prop.Mixins = _super.Mixins.concat(prop.Mixins);
			}
		}

		// Generate dummy methods
		if (prop.Methods) {
			each(prop.Methods.split(','), function(name) {
				prop[name] = dummy;
			});
		}

		// Generate property methods
		if (prop.Properties) {
			each(prop.Properties.split(','), function(name) {
				var fieldName = '_' + name;

				prop[name] = function(value) {
					var self = this, undef;

					// Set value
					if (value !== undef) {
						self[fieldName] = value;

						return self;
					}

					// Get value
					return self[fieldName];
				};
			});
		}

		// Static functions
		if (prop.Statics) {
			each(prop.Statics, function(func, name) {
				Class[name] = func;
			});
		}

		// Default settings
		if (prop.Defaults && _super.Defaults) {
			prop.Defaults = extend({}, _super.Defaults, prop.Defaults);
		}

		// Copy the properties over onto the new prototype
		for (name in prop) {
			member = prop[name];

			if (typeof member == "function" && _super[name]) {
				prototype[name] = createMethod(name, member);
			} else {
				prototype[name] = member;
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendible
		Class.extend = extendClass;

		return Class;
	};

	return Class;
});

// Included from: js/tinymce/classes/ui/Selector.js

/**
 * Selector.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Selector engine, enables you to select controls by using CSS like expressions.
 * We currently only support basic CSS expressions to reduce the size of the core
 * and the ones we support should be enough for most cases.
 *
 * @example
 * Supported expressions:
 *  element
 *  element#name
 *  element.class
 *  element[attr]
 *  element[attr*=value]
 *  element[attr~=value]
 *  element[attr!=value]
 *  element[attr^=value]
 *  element[attr$=value]
 *  element:<state>
 *  element:not(<expression>)
 *  element:first
 *  element:last
 *  element:odd
 *  element:even
 *  element element
 *  element > element
 *
 * @class tinymce.ui.Selector
 */
define("tinymce/ui/Selector", [
	"tinymce/util/Class"
], function(Class) {
	"use strict";

	/**
	 * Produces an array with a unique set of objects. It will not compare the values
	 * but the references of the objects.
	 *
	 * @private
	 * @method unqiue
	 * @param {Array} array Array to make into an array with unique items.
	 * @return {Array} Array with unique items.
	 */
	function unique(array) {
		var uniqueItems = [], i = array.length, item;

		while (i--) {
			item = array[i];

			if (!item.__checked) {
				uniqueItems.push(item);
				item.__checked = 1;
			}
		}

		i = uniqueItems.length;
		while (i--) {
			delete uniqueItems[i].__checked;
		}

		return uniqueItems;
	}

	var expression = /^([\w\\*]+)?(?:#([\w\\]+))?(?:\.([\w\\\.]+))?(?:\[\@?([\w\\]+)([\^\$\*!~]?=)([\w\\]+)\])?(?:\:(.+))?/i;

	/*jshint maxlen:255 */
	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		whiteSpace = /^\s*|\s*$/g,
		Collection;

	var Selector = Class.extend({
		/**
		 * Constructs a new Selector instance.
		 *
		 * @constructor
		 * @method init
		 * @param {String} selector CSS like selector expression.
		 */
		init: function(selector) {
			var match = this.match;

			function compileNameFilter(name) {
				if (name) {
					name = name.toLowerCase();

					return function(item) {
						return name === '*' || item.type === name;
					};
				}
			}

			function compileIdFilter(id) {
				if (id) {
					return function(item) {
						return item._name === id;
					};
				}
			}

			function compileClassesFilter(classes) {
				if (classes) {
					classes = classes.split('.');

					return function(item) {
						var i = classes.length;

						while (i--) {
							if (!item.hasClass(classes[i])) {
								return false;
							}
						}

						return true;
					};
				}
			}

			function compileAttrFilter(name, cmp, check) {
				if (name) {
					return function(item) {
						var value = item[name] ? item[name]() : '';

						return !cmp ? !!check :
							cmp === "=" ? value === check :
							cmp === "*=" ? value.indexOf(check) >= 0 :
							cmp === "~=" ? (" " + value + " ").indexOf(" " + check + " ") >= 0 :
							cmp === "!=" ? value != check :
							cmp === "^=" ? value.indexOf(check) === 0 :
							cmp === "$=" ? value.substr(value.length - check.length) === check :
							false;
					};
				}
			}

			function compilePsuedoFilter(name) {
				var notSelectors;

				if (name) {
					name = /(?:not\((.+)\))|(.+)/i.exec(name);

					if (!name[1]) {
						name = name[2];

						return function(item, index, length) {
							return name === 'first' ? index === 0 :
								name === 'last' ? index === length - 1 :
								name === 'even' ? index % 2 === 0 :
								name === 'odd' ? index % 2 === 1 :
								item[name] ? item[name]() :
								false;
						};
					} else {
						// Compile not expression
						notSelectors = parseChunks(name[1], []);

						return function(item) {
							return !match(item, notSelectors);
						};
					}
				}
			}

			function compile(selector, filters, direct) {
				var parts;

				function add(filter) {
					if (filter) {
						filters.push(filter);
					}
				}

				// Parse expression into parts
				parts = expression.exec(selector.replace(whiteSpace, ''));

				add(compileNameFilter(parts[1]));
				add(compileIdFilter(parts[2]));
				add(compileClassesFilter(parts[3]));
				add(compileAttrFilter(parts[4], parts[5], parts[6]));
				add(compilePsuedoFilter(parts[7]));

				// Mark the filter with psuedo for performance
				filters.psuedo = !!parts[7];
				filters.direct = direct;

				return filters;
			}

			// Parser logic based on Sizzle by John Resig
			function parseChunks(selector, selectors) {
				var parts = [], extra, matches, i;

				do {
					chunker.exec("");
					matches = chunker.exec(selector);

					if (matches) {
						selector = matches[3];
						parts.push(matches[1]);

						if (matches[2]) {
							extra = matches[3];
							break;
						}
					}
				} while (matches);

				if (extra) {
					parseChunks(extra, selectors);
				}

				selector = [];
				for (i = 0; i < parts.length; i++) {
					if (parts[i] != '>') {
						selector.push(compile(parts[i], [], parts[i - 1] === '>'));
					}
				}

				selectors.push(selector);

				return selectors;
			}

			this._selectors = parseChunks(selector, []);
		},

		/**
		 * Returns true/false if the selector matches the specified control.
		 *
		 * @method match
		 * @param {tinymce.ui.Control} control Control to match agains the selector.
		 * @param {Array} selectors Optional array of selectors, mostly used internally.
		 * @return {Boolean} true/false state if the control matches or not.
		 */
		match: function(control, selectors) {
			var i, l, si, sl, selector, fi, fl, filters, index, length, siblings, count, item;

			selectors = selectors || this._selectors;
			for (i = 0, l = selectors.length; i < l; i++) {
				selector = selectors[i];
				sl = selector.length;
				item = control;
				count = 0;

				for (si = sl - 1; si >= 0; si--) {
					filters = selector[si];

					while (item) {
						// Find the index and length since a psuedo filter like :first needs it
						if (filters.psuedo) {
							siblings = item.parent().items();
							index = length = siblings.length;
							while (index--) {
								if (siblings[index] === item) {
									break;
								}
							}
						}

						for (fi = 0, fl = filters.length; fi < fl; fi++) {
							if (!filters[fi](item, index, length)) {
								fi = fl + 1;
								break;
							}
						}

						if (fi === fl) {
							count++;
							break;
						} else {
							// If it didn't match the right most expression then
							// break since it's no point looking at the parents
							if (si === sl - 1) {
								break;
							}
						}

						item = item.parent();
					}
				}

				// If we found all selectors then return true otherwise continue looking
				if (count === sl) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Returns a tinymce.ui.Collection with matches of the specified selector inside the specified container.
		 *
		 * @method find
		 * @param {tinymce.ui.Control} container Container to look for items in.
		 * @return {tinymce.ui.Collection} Collection with matched elements.
		 */
		find: function(container) {
			var matches = [], i, l, selectors = this._selectors;

			function collect(items, selector, index) {
				var i, l, fi, fl, item, filters = selector[index];

				for (i = 0, l = items.length; i < l; i++) {
					item = items[i];

					// Run each filter agains the item
					for (fi = 0, fl = filters.length; fi < fl; fi++) {
						if (!filters[fi](item, i, l)) {
							fi = fl + 1;
							break;
						}
					}

					// All filters matched the item
					if (fi === fl) {
						// Matched item is on the last expression like: panel toolbar [button]
						if (index == selector.length - 1) {
							matches.push(item);
						} else {
							// Collect next expression type
							if (item.items) {
								collect(item.items(), selector, index + 1);
							}
						}
					} else if (filters.direct) {
						return;
					}

					// Collect child items
					if (item.items) {
						collect(item.items(), selector, index);
					}
				}
			}

			if (container.items) {
				for (i = 0, l = selectors.length; i < l; i++) {
					collect(container.items(), selectors[i], 0);
				}

				// Unique the matches if needed
				if (l > 1) {
					matches = unique(matches);
				}
			}

			// Fix for circular reference
			if (!Collection) {
				// TODO: Fix me!
				Collection = Selector.Collection;
			}

			return new Collection(matches);
		}
	});

	return Selector;
});

// Included from: js/tinymce/classes/ui/Collection.js

/**
 * Collection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Control collection, this class contains control instances and it enables you to
 * perform actions on all the contained items. This is very similar to how jQuery works.
 *
 * @example
 * someCollection.show().disabled(true);
 *
 * @class tinymce.ui.Collection
 */
define("tinymce/ui/Collection", [
	"tinymce/util/Tools",
	"tinymce/ui/Selector",
	"tinymce/util/Class"
], function(Tools, Selector, Class) {
	"use strict";

	var Collection, proto, push = Array.prototype.push, slice = Array.prototype.slice;

	proto = {
		/**
		 * Current number of contained control instances.
		 *
		 * @field length
		 * @type Number
		 */
		length: 0,

		/**
		 * Constructor for the collection.
		 *
		 * @constructor
		 * @method init
		 * @param {Array} items Optional array with items to add.
		 */
		init: function(items) {
			if (items) {
				this.add(items);
			}
		},

		/**
		 * Adds new items to the control collection.
		 *
		 * @method add
		 * @param {Array} items Array if items to add to collection.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		add: function(items) {
			var self = this;

			// Force single item into array
			if (!Tools.isArray(items)) {
				if (items instanceof Collection) {
					self.add(items.toArray());
				} else {
					push.call(self, items);
				}
			} else {
				push.apply(self, items);
			}

			return self;
		},

		/**
		 * Sets the contents of the collection. This will remove any existing items
		 * and replace them with the ones specified in the input array.
		 *
		 * @method set
		 * @param {Array} items Array with items to set into the Collection.
		 * @return {tinymce.ui.Collection} Collection instance.
		 */
		set: function(items) {
			var self = this, len = self.length, i;

			self.length = 0;
			self.add(items);

			// Remove old entries
			for (i = self.length; i < len; i++) {
				delete self[i];
			}

			return self;
		},

		/**
		 * Filters the collection item based on the specified selector expression or selector function.
		 *
		 * @method filter
		 * @param {String} selector Selector expression to filter items by.
		 * @return {tinymce.ui.Collection} Collection containing the filtered items.
		 */
		filter: function(selector) {
			var self = this, i, l, matches = [], item, match;

			// Compile string into selector expression
			if (typeof(selector) === "string") {
				selector = new Selector(selector);

				match = function(item) {
					return selector.match(item);
				};
			} else {
				// Use selector as matching function
				match = selector;
			}

			for (i = 0, l = self.length; i < l; i++) {
				item = self[i];

				if (match(item)) {
					matches.push(item);
				}
			}

			return new Collection(matches);
		},

		/**
		 * Slices the items within the collection.
		 *
		 * @method slice
		 * @param {Number} index Index to slice at.
		 * @param {Number} len Optional length to slice.
		 * @return {tinymce.ui.Collection} Current collection.
		 */
		slice: function() {
			return new Collection(slice.apply(this, arguments));
		},

		/**
		 * Makes the current collection equal to the specified index.
		 *
		 * @method eq
		 * @param {Number} index Index of the item to set the collection to.
		 * @return {tinymce.ui.Collection} Current collection.
		 */
		eq: function(index) {
			return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
		},

		/**
		 * Executes the specified callback on each item in collection.
		 *
		 * @method each
		 * @param {function} callback Callback to execute for each item in collection.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		each: function(callback) {
			Tools.each(this, callback);

			return this;
		},

		/**
		 * Returns an JavaScript array object of the contents inside the collection.
		 *
		 * @method toArray
		 * @return {Array} Array with all items from collection.
		 */
		toArray: function() {
			return Tools.toArray(this);
		},

		/**
		 * Finds the index of the specified control or return -1 if it isn't in the collection.
		 *
		 * @method indexOf
		 * @param {Control} ctrl Control instance to look for.
		 * @return {Number} Index of the specified control or -1.
		 */
		indexOf: function(ctrl) {
			var self = this, i = self.length;

			while (i--) {
				if (self[i] === ctrl) {
					break;
				}
			}

			return i;
		},

		/**
		 * Returns a new collection of the contents in reverse order.
		 *
		 * @method reverse
		 * @return {tinymce.ui.Collection} Collection instance with reversed items.
		 */
		reverse: function() {
			return new Collection(Tools.toArray(this).reverse());
		},

		/**
		 * Returns true/false if the class exists or not.
		 *
		 * @method hasClass
		 * @param {String} cls Class to check for.
		 * @return {Boolean} true/false state if the class exists or not.
		 */
		hasClass: function(cls) {
			return this[0] ? this[0].hasClass(cls) : false;
		},

		/**
		 * Sets/gets the specific property on the items in the collection. The same as executing control.<property>(<value>);
		 *
		 * @method prop
		 * @param {String} name Property name to get/set.
		 * @param {Object} value Optional object value to set.
		 * @return {tinymce.ui.Collection} Current collection instance or value of the first item on a get operation.
		 */
		prop: function(name, value) {
			var self = this, undef, item;

			if (value !== undef) {
				self.each(function(item) {
					if (item[name]) {
						item[name](value);
					}
				});

				return self;
			}

			item = self[0];

			if (item && item[name]) {
				return item[name]();
			}
		},

		/**
		 * Executes the specific function name with optional arguments an all items in collection if it exists.
		 *
		 * @example collection.exec("myMethod", arg1, arg2, arg3);
		 * @method exec
		 * @param {String} name Name of the function to execute.
		 * @param {Object} ... Multiple arguments to pass to each function.
		 * @return {tinymce.ui.Collection} Current collection.
		 */
		exec: function(name) {
			var self = this, args = Tools.toArray(arguments).slice(1);

			self.each(function(item) {
				if (item[name]) {
					item[name].apply(item, args);
				}
			});

			return self;
		},

		/**
		 * Remove all items from collection and DOM.
		 *
		 * @method remove
		 * @return {tinymce.ui.Collection} Current collection.
		 */
		remove: function() {
			var i = this.length;

			while (i--) {
				this[i].remove();
			}

			return this;
		}

		/**
		 * Fires the specified event by name and arguments on the control. This will execute all
		 * bound event handlers.
		 *
		 * @method fire
		 * @param {String} name Name of the event to fire.
		 * @param {Object} args Optional arguments to pass to the event.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// fire: function(event, args) {}, -- Generated by code below

		/**
		 * Binds a callback to the specified event. This event can both be
		 * native browser events like "click" or custom ones like PostRender.
		 *
		 * The callback function will have two parameters the first one being the control that received the event
		 * the second one will be the event object either the browsers native event object or a custom JS object.
		 *
		 * @method on
		 * @param {String} name Name of the event to bind. For example "click".
		 * @param {String/function} callback Callback function to execute ones the event occurs.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// on: function(name, callback) {}, -- Generated by code below

		/**
		 * Unbinds the specified event and optionally a specific callback. If you omit the name
		 * parameter all event handlers will be removed. If you omit the callback all event handles
		 * by the specified name will be removed.
		 *
		 * @method off
		 * @param {String} name Optional name for the event to unbind.
		 * @param {function} callback Optional callback function to unbind.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// off: function(name, callback) {}, -- Generated by code below

		/**
		 * Shows the items in the current collection.
		 *
		 * @method show
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// show: function() {}, -- Generated by code below

		/**
		 * Hides the items in the current collection.
		 *
		 * @method hide
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// hide: function() {}, -- Generated by code below

		/**
		 * Sets/gets the text contents of the items in the current collection.
		 *
		 * @method text
		 * @return {tinymce.ui.Collection} Current collection instance or text value of the first item on a get operation.
		 */
		// text: function(value) {}, -- Generated by code below

		/**
		 * Sets/gets the name contents of the items in the current collection.
		 *
		 * @method name
		 * @return {tinymce.ui.Collection} Current collection instance or name value of the first item on a get operation.
		 */
		// name: function(value) {}, -- Generated by code below

		/**
		 * Sets/gets the disabled state on the items in the current collection.
		 *
		 * @method disabled
		 * @return {tinymce.ui.Collection} Current collection instance or disabled state of the first item on a get operation.
		 */
		// disabled: function(state) {}, -- Generated by code below

		/**
		 * Sets/gets the active state on the items in the current collection.
		 *
		 * @method active
		 * @return {tinymce.ui.Collection} Current collection instance or active state of the first item on a get operation.
		 */
		// active: function(state) {}, -- Generated by code below

		/**
		 * Sets/gets the selected state on the items in the current collection.
		 *
		 * @method selected
		 * @return {tinymce.ui.Collection} Current collection instance or selected state of the first item on a get operation.
		 */
		// selected: function(state) {}, -- Generated by code below

		/**
		 * Sets/gets the selected state on the items in the current collection.
		 *
		 * @method visible
		 * @return {tinymce.ui.Collection} Current collection instance or visible state of the first item on a get operation.
		 */
		// visible: function(state) {}, -- Generated by code below

		/**
		 * Adds a class to all items in the collection.
		 *
		 * @method addClass
		 * @param {String} cls Class to add to each item.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// addClass: function(cls) {}, -- Generated by code below

		/**
		 * Removes the specified class from all items in collection.
		 *
		 * @method removeClass
		 * @param {String} cls Class to remove from each item.
		 * @return {tinymce.ui.Collection} Current collection instance.
		 */
		// removeClass: function(cls) {}, -- Generated by code below
	};

	// Extend tinymce.ui.Collection prototype with some generated control specific methods
	Tools.each('fire on off show hide addClass removeClass append prepend before after reflow'.split(' '), function(name) {
		proto[name] = function() {
			var args = Tools.toArray(arguments);

			this.each(function(ctrl) {
				if (name in ctrl) {
					ctrl[name].apply(ctrl, args);
				}
			});

			return this;
		};
	});

	// Extend tinymce.ui.Collection prototype with some property methods
	Tools.each('text name disabled active selected checked visible parent value data'.split(' '), function(name) {
		proto[name] = function(value) {
			return this.prop(name, value);
		};
	});

	// Create class based on the new prototype
	Collection = Class.extend(proto);

	// Stick Collection into Selector to prevent circual references
	Selector.Collection = Collection;

	return Collection;
});

// Included from: js/tinymce/classes/ui/DomUtils.js

/**
 * DOMUtils.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/ui/DomUtils", [
	"tinymce/util/Tools",
	"tinymce/dom/DOMUtils"
], function(Tools, DOMUtils) {
	"use strict";

	return {
		id: function() {
			return DOMUtils.DOM.uniqueId();
		},

		createFragment: function(html) {
			return DOMUtils.DOM.createFragment(html);
		},

		getWindowSize: function() {
			return DOMUtils.DOM.getViewPort();
		},

		getSize: function(elm) {
			var width, height;

			if (elm.getBoundingClientRect) {
				var rect = elm.getBoundingClientRect();

				width = Math.max(rect.width || (rect.right - rect.left), elm.offsetWidth);
				height = Math.max(rect.height || (rect.bottom - rect.bottom), elm.offsetHeight);
			} else {
				width = elm.offsetWidth;
				height = elm.offsetHeight;
			}

			return {width: width, height: height};
		},

		getPos: function(elm, root) {
			return DOMUtils.DOM.getPos(elm, root);
		},

		getViewPort: function(win) {
			return DOMUtils.DOM.getViewPort(win);
		},

		get: function(id) {
			return document.getElementById(id);
		},

		addClass : function(elm, cls) {
			return DOMUtils.DOM.addClass(elm, cls);
		},

		removeClass : function(elm, cls) {
			return DOMUtils.DOM.removeClass(elm, cls);
		},

		hasClass : function(elm, cls) {
			return DOMUtils.DOM.hasClass(elm, cls);
		},

		toggleClass: function(elm, cls, state) {
			return DOMUtils.DOM.toggleClass(elm, cls, state);
		},

		css: function(elm, name, value) {
			return DOMUtils.DOM.setStyle(elm, name, value);
		},

		on: function(target, name, callback, scope) {
			return DOMUtils.DOM.bind(target, name, callback, scope);
		},

		off: function(target, name, callback) {
			return DOMUtils.DOM.unbind(target, name, callback);
		},

		fire: function(target, name, args) {
			return DOMUtils.DOM.fire(target, name, args);
		},

		innerHtml: function(elm, html) {
			// Workaround for <div> in <p> bug on IE 8 #6178
			DOMUtils.DOM.setHTML(elm, html);
		}
	};
});

// Included from: js/tinymce/classes/ui/Control.js

/**
 * Control.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This is the base class for all controls and containers. All UI control instances inherit
 * from this one as it has the base logic needed by all of them.
 *
 * @class tinymce.ui.Control
 */
define("tinymce/ui/Control", [
	"tinymce/util/Class",
	"tinymce/util/Tools",
	"tinymce/ui/Collection",
	"tinymce/ui/DomUtils"
], function(Class, Tools, Collection, DomUtils) {
	"use strict";

	var nativeEvents = Tools.makeMap("focusin focusout scroll click dblclick mousedown mouseup mousemove mouseover" +
								" mouseout mouseenter mouseleave wheel keydown keypress keyup contextmenu", " ");

	var elementIdCache = {};
	var hasMouseWheelEventSupport = "onmousewheel" in document;
	var hasWheelEventSupport = false;

	var Control = Class.extend({
		Statics: {
			elementIdCache: elementIdCache
		},

		isRtl: function() {
			return Control.rtl;
		},

		/**
		 * Class/id prefix to use for all controls.
		 *
		 * @final
		 * @field {String} classPrefix
		 */
		classPrefix: "mce-",

		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} style Style CSS properties to add.
		 * @setting {String} border Border box values example: 1 1 1 1
		 * @setting {String} padding Padding box values example: 1 1 1 1
		 * @setting {String} margin Margin box values example: 1 1 1 1
		 * @setting {Number} minWidth Minimal width for the control.
		 * @setting {Number} minHeight Minimal height for the control.
		 * @setting {String} classes Space separated list of classes to add.
		 * @setting {String} role WAI-ARIA role to use for control.
		 * @setting {Boolean} hidden Is the control hidden by default.
		 * @setting {Boolean} disabled Is the control disabled by default.
		 * @setting {String} name Name of the control instance.
		 */
		init: function(settings) {
			var self = this, classes, i;

			self.settings = settings = Tools.extend({}, self.Defaults, settings);

			// Initial states
			self._id = DomUtils.id();
			self._text = self._name = '';
			self._width = self._height = 0;
			self._aria = {role: settings.role};

			// Setup classes
			classes = settings.classes;
			if (classes) {
				classes = classes.split(' ');
				classes.map = {};
				i = classes.length;
				while (i--) {
					classes.map[classes[i]] = true;
				}
			}

			self._classes = classes || [];
			self.visible(true);

			// Set some properties
			Tools.each('title text width height name classes visible disabled active value'.split(' '), function(name) {
				var value = settings[name], undef;

				if (value !== undef) {
					self[name](value);
				} else if (self['_' + name] === undef) {
					self['_' + name] = false;
				}
			});

			self.on('click', function() {
				if (self.disabled()) {
					return false;
				}
			});

			// TODO: Is this needed duplicate code see above?
			if (settings.classes) {
				Tools.each(settings.classes.split(' '), function(cls) {
					self.addClass(cls);
				});
			}

			/**
			 * Name/value object with settings for the current control.
			 *
			 * @field {Object} settings
			 */
			self.settings = settings;

			self._borderBox = self.parseBox(settings.border);
			self._paddingBox = self.parseBox(settings.padding);
			self._marginBox = self.parseBox(settings.margin);

			if (settings.hidden) {
				self.hide();
			}
		},

		// Will generate getter/setter methods for these properties
		Properties: 'parent,title,text,width,height,disabled,active,name,value',

		// Will generate empty dummy functions for these
		Methods: 'renderHtml',

		/**
		 * Returns the root element to render controls into.
		 *
		 * @method getContainerElm
		 * @return {Element} HTML DOM element to render into.
		 */
		getContainerElm: function() {
			return document.body;
		},

		/**
		 * Returns a control instance for the current DOM element.
		 *
		 * @method getParentCtrl
		 * @param {Element} elm HTML dom element to get parent control from.
		 * @return {tinymce.ui.Control} Control instance or undefined.
		 */
		getParentCtrl: function(elm) {
			var ctrl, lookup = this.getRoot().controlIdLookup;

			while (elm && lookup) {
				ctrl = lookup[elm.id];
				if (ctrl) {
					break;
				}

				elm = elm.parentNode;
			}

			return ctrl;
		},

		/**
		 * Parses the specified box value. A box value contains 1-4 properties in clockwise order.
		 *
		 * @method parseBox
		 * @param {String/Number} value Box value "0 1 2 3" or "0" etc.
		 * @return {Object} Object with top/right/bottom/left properties.
		 * @private
		 */
		parseBox: function(value) {
			var len, radix = 10;

			if (!value) {
				return;
			}

			if (typeof(value) === "number") {
				value = value || 0;

				return {
					top: value,
					left: value,
					bottom: value,
					right: value
				};
			}

			value = value.split(' ');
			len = value.length;

			if (len === 1) {
				value[1] = value[2] = value[3] = value[0];
			} else if (len === 2) {
				value[2] = value[0];
				value[3] = value[1];
			} else if (len === 3) {
				value[3] = value[1];
			}

			return {
				top: parseInt(value[0], radix) || 0,
				right: parseInt(value[1], radix) || 0,
				bottom: parseInt(value[2], radix) || 0,
				left: parseInt(value[3], radix) || 0
			};
		},

		borderBox: function() {
			return this._borderBox;
		},

		paddingBox: function() {
			return this._paddingBox;
		},

		marginBox: function() {
			return this._marginBox;
		},

		measureBox: function(elm, prefix) {
			function getStyle(name) {
				var defaultView = document.defaultView;

				if (defaultView) {
					// Remove camelcase
					name = name.replace(/[A-Z]/g, function(a) {
						return '-' + a;
					});

					return defaultView.getComputedStyle(elm, null).getPropertyValue(name);
				}

				return elm.currentStyle[name];
			}

			function getSide(name) {
				var val = parseFloat(getStyle(name), 10);

				return isNaN(val) ? 0 : val;
			}

			return {
				top: getSide(prefix + "TopWidth"),
				right: getSide(prefix + "RightWidth"),
				bottom: getSide(prefix + "BottomWidth"),
				left: getSide(prefix + "LeftWidth")
			};
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, settings = self.settings, borderBox, layoutRect;
			var elm = self.getEl(), width, height, minWidth, minHeight, autoResize;
			var startMinWidth, startMinHeight, initialSize;

			// Measure the current element
			borderBox = self._borderBox = self._borderBox || self.measureBox(elm, 'border');
			self._paddingBox = self._paddingBox || self.measureBox(elm, 'padding');
			self._marginBox = self._marginBox || self.measureBox(elm, 'margin');
			initialSize = DomUtils.getSize(elm);

			// Setup minWidth/minHeight and width/height
			startMinWidth = settings.minWidth;
			startMinHeight = settings.minHeight;
			minWidth = startMinWidth || initialSize.width;
			minHeight = startMinHeight || initialSize.height;
			width = settings.width;
			height = settings.height;
			autoResize = settings.autoResize;
			autoResize = typeof(autoResize) != "undefined" ? autoResize : !width && !height;

			width = width || minWidth;
			height = height || minHeight;

			var deltaW = borderBox.left + borderBox.right;
			var deltaH = borderBox.top + borderBox.bottom;

			var maxW = settings.maxWidth || 0xFFFF;
			var maxH = settings.maxHeight || 0xFFFF;

			// Setup initial layout rect
			self._layoutRect = layoutRect = {
				x: settings.x || 0,
				y: settings.y || 0,
				w: width,
				h: height,
				deltaW: deltaW,
				deltaH: deltaH,
				contentW: width - deltaW,
				contentH: height - deltaH,
				innerW: width - deltaW,
				innerH: height - deltaH,
				startMinWidth: startMinWidth || 0,
				startMinHeight: startMinHeight || 0,
				minW: Math.min(minWidth, maxW),
				minH: Math.min(minHeight, maxH),
				maxW: maxW,
				maxH: maxH,
				autoResize: autoResize,
				scrollW: 0
			};

			self._lastLayoutRect = {};

			return layoutRect;
		},

		/**
		 * Getter/setter for the current layout rect.
		 *
		 * @method layoutRect
		 * @param {Object} [newRect] Optional new layout rect.
		 * @return {tinymce.ui.Control/Object} Current control or rect object.
		 */
		layoutRect: function(newRect) {
			var self = this, curRect = self._layoutRect, lastLayoutRect, size, deltaWidth, deltaHeight, undef, repaintControls;

			// Initialize default layout rect
			if (!curRect) {
				curRect = self.initLayoutRect();
			}

			// Set new rect values
			if (newRect) {
				// Calc deltas between inner and outer sizes
				deltaWidth = curRect.deltaW;
				deltaHeight = curRect.deltaH;

				// Set x position
				if (newRect.x !== undef) {
					curRect.x = newRect.x;
				}

				// Set y position
				if (newRect.y !== undef) {
					curRect.y = newRect.y;
				}

				// Set minW
				if (newRect.minW !== undef) {
					curRect.minW = newRect.minW;
				}

				// Set minH
				if (newRect.minH !== undef) {
					curRect.minH = newRect.minH;
				}

				// Set new width and calculate inner width
				size = newRect.w;
				if (size !== undef) {
					size = size < curRect.minW ? curRect.minW : size;
					size = size > curRect.maxW ? curRect.maxW : size;
					curRect.w = size;
					curRect.innerW = size - deltaWidth;
				}

				// Set new height and calculate inner height
				size = newRect.h;
				if (size !== undef) {
					size = size < curRect.minH ? curRect.minH : size;
					size = size > curRect.maxH ? curRect.maxH : size;
					curRect.h = size;
					curRect.innerH = size - deltaHeight;
				}

				// Set new inner width and calculate width
				size = newRect.innerW;
				if (size !== undef) {
					size = size < curRect.minW - deltaWidth ? curRect.minW - deltaWidth : size;
					size = size > curRect.maxW - deltaWidth ? curRect.maxW - deltaWidth : size;
					curRect.innerW = size;
					curRect.w = size + deltaWidth;
				}

				// Set new height and calculate inner height
				size = newRect.innerH;
				if (size !== undef) {
					size = size < curRect.minH - deltaHeight ? curRect.minH - deltaHeight : size;
					size = size > curRect.maxH - deltaHeight ? curRect.maxH - deltaHeight : size;
					curRect.innerH = size;
					curRect.h = size + deltaHeight;
				}

				// Set new contentW
				if (newRect.contentW !== undef) {
					curRect.contentW = newRect.contentW;
				}

				// Set new contentH
				if (newRect.contentH !== undef) {
					curRect.contentH = newRect.contentH;
				}

				// Compare last layout rect with the current one to see if we need to repaint or not
				lastLayoutRect = self._lastLayoutRect;
				if (lastLayoutRect.x !== curRect.x || lastLayoutRect.y !== curRect.y ||
					lastLayoutRect.w !== curRect.w || lastLayoutRect.h !== curRect.h) {
					repaintControls = Control.repaintControls;

					if (repaintControls) {
						if (repaintControls.map && !repaintControls.map[self._id]) {
							repaintControls.push(self);
							repaintControls.map[self._id] = true;
						}
					}

					lastLayoutRect.x = curRect.x;
					lastLayoutRect.y = curRect.y;
					lastLayoutRect.w = curRect.w;
					lastLayoutRect.h = curRect.h;
				}

				return self;
			}

			return curRect;
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, style, bodyStyle, rect, borderBox, borderW = 0, borderH = 0, lastRepaintRect, round;

			// Use Math.round on all values on IE < 9
			round = !document.createRange ? Math.round : function(value) {
				return value;
			};

			style = self.getEl().style;
			rect = self._layoutRect;
			lastRepaintRect = self._lastRepaintRect || {};

			borderBox = self._borderBox;
			borderW = borderBox.left + borderBox.right;
			borderH = borderBox.top + borderBox.bottom;

			if (rect.x !== lastRepaintRect.x) {
				style.left = round(rect.x) + 'px';
				lastRepaintRect.x = rect.x;
			}

			if (rect.y !== lastRepaintRect.y) {
				style.top = round(rect.y) + 'px';
				lastRepaintRect.y = rect.y;
			}

			if (rect.w !== lastRepaintRect.w) {
				style.width = round(rect.w - borderW) + 'px';
				lastRepaintRect.w = rect.w;
			}

			if (rect.h !== lastRepaintRect.h) {
				style.height = round(rect.h - borderH) + 'px';
				lastRepaintRect.h = rect.h;
			}

			// Update body if needed
			if (self._hasBody && rect.innerW !== lastRepaintRect.innerW) {
				bodyStyle = self.getEl('body').style;
				bodyStyle.width = round(rect.innerW) + 'px';
				lastRepaintRect.innerW = rect.innerW;
			}

			if (self._hasBody && rect.innerH !== lastRepaintRect.innerH) {
				bodyStyle = bodyStyle || self.getEl('body').style;
				bodyStyle.height = round(rect.innerH) + 'px';
				lastRepaintRect.innerH = rect.innerH;
			}

			self._lastRepaintRect = lastRepaintRect;
			self.fire('repaint', {}, false);
		},

		/**
		 * Binds a callback to the specified event. This event can both be
		 * native browser events like "click" or custom ones like PostRender.
		 *
		 * The callback function will be passed a DOM event like object that enables yout do stop propagation.
		 *
		 * @method on
		 * @param {String} name Name of the event to bind. For example "click".
		 * @param {String/function} callback Callback function to execute ones the event occurs.
		 * @return {tinymce.ui.Control} Current control object.
		 */
		on: function(name, callback) {
			var self = this, bindings, handlers, names, i;

			function resolveCallbackName(name) {
				var callback, scope;

				return function(e) {
					if (!callback) {
						self.parents().each(function(ctrl) {
							var callbacks = ctrl.settings.callbacks;

							if (callbacks && (callback = callbacks[name])) {
								scope = ctrl;
								return false;
							}
						});
					}

					return callback.call(scope, e);
				};
			}

			if (callback) {
				if (typeof(callback) == 'string') {
					callback = resolveCallbackName(callback);
				}

				names = name.toLowerCase().split(' ');
				i = names.length;
				while (i--) {
					name = names[i];

					bindings = self._bindings;
					if (!bindings) {
						bindings = self._bindings = {};
					}

					handlers = bindings[name];
					if (!handlers) {
						handlers = bindings[name] = [];
					}

					handlers.push(callback);

					if (nativeEvents[name]) {
						if (!self._nativeEvents) {
							self._nativeEvents = {name: true};
						} else {
							self._nativeEvents[name] = true;
						}

						if (self._rendered) {
							self.bindPendingEvents();
						}
					}
				}
			}

			return self;
		},

		/**
		 * Unbinds the specified event and optionally a specific callback. If you omit the name
		 * parameter all event handlers will be removed. If you omit the callback all event handles
		 * by the specified name will be removed.
		 *
		 * @method off
		 * @param {String} [name] Name for the event to unbind.
		 * @param {function} [callback] Callback function to unbind.
		 * @return {mxex.ui.Control} Current control object.
		 */
		off: function(name, callback) {
			var self = this, i, bindings = self._bindings, handlers, bindingName, names, hi;

			if (bindings) {
				if (name) {
					names = name.toLowerCase().split(' ');
					i = names.length;
					while (i--) {
						name = names[i];
						handlers = bindings[name];

						// Unbind all handlers
						if (!name) {
							for (bindingName in bindings) {
								bindings[bindingName].length = 0;
							}

							return self;
						}

						if (handlers) {
							// Unbind all by name
							if (!callback) {
								handlers.length = 0;
							} else {
								// Unbind specific ones
								hi = handlers.length;
								while (hi--) {
									if (handlers[hi] === callback) {
										handlers.splice(hi, 1);
									}
								}
							}
						}
					}
				} else {
					self._bindings = [];
				}
			}

			return self;
		},

		/**
		 * Fires the specified event by name and arguments on the control. This will execute all
		 * bound event handlers.
		 *
		 * @method fire
		 * @param {String} name Name of the event to fire.
		 * @param {Object} [args] Arguments to pass to the event.
		 * @param {Boolean} [bubble] Value to control bubbeling. Defaults to true.
		 * @return {Object} Current arguments object.
		 */
		fire: function(name, args, bubble) {
			var self = this, i, l, handlers, parentCtrl;

			name = name.toLowerCase();

			// Dummy function that gets replaced on the delegation state functions
			function returnFalse() {
				return false;
			}

			// Dummy function that gets replaced on the delegation state functions
			function returnTrue() {
				return true;
			}

			// Setup empty object if args is omited
			args = args || {};

			// Stick type into event object
			if (!args.type) {
				args.type = name;
			}

			// Stick control into event
			if (!args.control) {
				args.control = self;
			}

			// Add event delegation methods if they are missing
			if (!args.preventDefault) {
				// Add preventDefault method
				args.preventDefault = function() {
					args.isDefaultPrevented = returnTrue;
				};

				// Add stopPropagation
				args.stopPropagation = function() {
					args.isPropagationStopped = returnTrue;
				};

				// Add stopImmediatePropagation
				args.stopImmediatePropagation = function() {
					args.isImmediatePropagationStopped = returnTrue;
				};

				// Add event delegation states
				args.isDefaultPrevented = returnFalse;
				args.isPropagationStopped = returnFalse;
				args.isImmediatePropagationStopped = returnFalse;
			}

			if (self._bindings) {
				handlers = self._bindings[name];

				if (handlers) {
					for (i = 0, l = handlers.length; i < l; i++) {
						// Execute callback and break if the callback returns a false
						if (!args.isImmediatePropagationStopped() && handlers[i].call(self, args) === false) {
							break;
						}
					}
				}
			}

			// Bubble event up to parent controls
			if (bubble !== false) {
				parentCtrl = self.parent();
				while (parentCtrl && !args.isPropagationStopped()) {
					parentCtrl.fire(name, args, false);
					parentCtrl = parentCtrl.parent();
				}
			}

			return args;
		},

		/**
		 * Returns true/false if the specified event has any listeners.
		 *
		 * @method hasEventListeners
		 * @param {String} name Name of the event to check for.
		 * @return {Boolean} True/false state if the event has listeners.
		 */
		hasEventListeners: function(name) {
			return name in this._bindings;
		},

		/**
		 * Returns a control collection with all parent controls.
		 *
		 * @method parents
		 * @param {String} selector Optional selector expression to find parents.
		 * @return {tinymce.ui.Collection} Collection with all parent controls.
		 */
		parents: function(selector) {
			var ctrl = this, parents = new Collection();

			// Add each parent to collection
			for (ctrl = ctrl.parent(); ctrl; ctrl = ctrl.parent()) {
				parents.add(ctrl);
			}

			// Filter away everything that doesn't match the selector
			if (selector) {
				parents = parents.filter(selector);
			}

			return parents;
		},

		/**
		 * Returns the control next to the current control.
		 *
		 * @method next
		 * @return {tinymce.ui.Control} Next control instance.
		 */
		next: function() {
			var parentControls = this.parent().items();

			return parentControls[parentControls.indexOf(this) + 1];
		},

		/**
		 * Returns the control previous to the current control.
		 *
		 * @method prev
		 * @return {tinymce.ui.Control} Previous control instance.
		 */
		prev: function() {
			var parentControls = this.parent().items();

			return parentControls[parentControls.indexOf(this) - 1];
		},

		/**
		 * Find the common ancestor for two control instances.
		 *
		 * @method findCommonAncestor
		 * @param {tinymce.ui.Control} ctrl1 First control.
		 * @param {tinymce.ui.Control} ctrl2 Second control.
		 * @return {tinymce.ui.Control} Ancestor control instance.
		 */
		findCommonAncestor: function(ctrl1, ctrl2) {
			var parentCtrl;

			while (ctrl1) {
				parentCtrl = ctrl2;

				while (parentCtrl && ctrl1 != parentCtrl) {
					parentCtrl = parentCtrl.parent();
				}

				if (ctrl1 == parentCtrl) {
					break;
				}

				ctrl1 = ctrl1.parent();
			}

			return ctrl1;
		},

		/**
		 * Returns true/false if the specific control has the specific class.
		 *
		 * @method hasClass
		 * @param {String} cls Class to check for.
		 * @param {String} [group] Sub element group name.
		 * @return {Boolean} True/false if the control has the specified class.
		 */
		hasClass: function(cls, group) {
			var classes = this._classes[group || 'control'];

			cls = this.classPrefix + cls;

			return classes && !!classes.map[cls];
		},

		/**
		 * Adds the specified class to the control
		 *
		 * @method addClass
		 * @param {String} cls Class to check for.
		 * @param {String} [group] Sub element group name.
		 * @return {tinymce.ui.Control} Current control object.
		 */
		addClass: function(cls, group) {
			var self = this, classes, elm;

			cls = this.classPrefix + cls;
			classes = self._classes[group || 'control'];

			if (!classes) {
				classes = [];
				classes.map = {};
				self._classes[group || 'control'] = classes;
			}

			if (!classes.map[cls]) {
				classes.map[cls] = cls;
				classes.push(cls);

				if (self._rendered) {
					elm = self.getEl(group);

					if (elm) {
						elm.className = classes.join(' ');
					}
				}
			}

			return self;
		},

		/**
		 * Removes the specified class from the control.
		 *
		 * @method removeClass
		 * @param {String} cls Class to remove.
		 * @param {String} [group] Sub element group name.
		 * @return {tinymce.ui.Control} Current control object.
		 */
		removeClass: function(cls, group) {
			var self = this, classes, i, elm;

			cls = this.classPrefix + cls;
			classes = self._classes[group || 'control'];
			if (classes && classes.map[cls]) {
				delete classes.map[cls];

				i = classes.length;
				while (i--) {
					if (classes[i] === cls) {
						classes.splice(i, 1);
					}
				}
			}

			if (self._rendered) {
				elm = self.getEl(group);

				if (elm) {
					elm.className = classes.join(' ');
				}
			}

			return self;
		},

		/**
		 * Toggles the specified class on the control.
		 *
		 * @method toggleClass
		 * @param {String} cls Class to remove.
		 * @param {Boolean} state True/false state to add/remove class.
		 * @param {String} [group] Sub element group name.
		 * @return {tinymce.ui.Control} Current control object.
		 */
		toggleClass: function(cls, state, group) {
			var self = this;

			if (state) {
				self.addClass(cls, group);
			} else {
				self.removeClass(cls, group);
			}

			return self;
		},

		/**
		 * Returns the class string for the specified group name.
		 *
		 * @method classes
		 * @param {String} [group] Group to get clases by.
		 * @return {String} Classes for the specified group.
		 */
		classes: function(group) {
			var classes = this._classes[group || 'control'];

			return classes ? classes.join(' ') : '';
		},

		/**
		 * Sets the inner HTML of the control element.
		 *
		 * @method innerHtml
		 * @param {String} html Html string to set as inner html.
		 * @return {tinymce.ui.Control} Current control object.
		 */
		innerHtml: function(html) {
			DomUtils.innerHtml(this.getEl(), html);
			return this;
		},

		/**
		 * Returns the control DOM element or sub element.
		 *
		 * @method getEl
		 * @param {String} [suffix] Suffix to get element by.
		 * @param {Boolean} [dropCache] True if the cache for the element should be dropped.
		 * @return {Element} HTML DOM element for the current control or it's children.
		 */
		getEl: function(suffix, dropCache) {
			var elm, id = suffix ? this._id + '-' + suffix : this._id;

			elm = elementIdCache[id] = (dropCache === true ? null : elementIdCache[id]) || DomUtils.get(id);

			return elm;
		},

		/**
		 * Sets/gets the visible for the control.
		 *
		 * @method visible
		 * @param {Boolean} state Value to set to control.
		 * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
		 */
		visible: function(state) {
			var self = this, parentCtrl;

			if (typeof(state) !== "undefined") {
				if (self._visible !== state) {
					if (self._rendered) {
						self.getEl().style.display = state ? '' : 'none';
					}

					self._visible = state;

					// Parent container needs to reflow
					parentCtrl = self.parent();
					if (parentCtrl) {
						parentCtrl._lastRect = null;
					}

					self.fire(state ? 'show' : 'hide');
				}

				return self;
			}

			return self._visible;
		},

		/**
		 * Sets the visible state to true.
		 *
		 * @method show
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		show: function() {
			return this.visible(true);
		},

		/**
		 * Sets the visible state to false.
		 *
		 * @method hide
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		hide: function() {
			return this.visible(false);
		},

		/**
		 * Focuses the current control.
		 *
		 * @method focus
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		focus: function() {
			try {
				this.getEl().focus();
			} catch (ex) {
				// Ignore IE error
			}

			return this;
		},

		/**
		 * Blurs the current control.
		 *
		 * @method blur
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		blur: function() {
			this.getEl().blur();

			return this;
		},

		/**
		 * Sets the specified aria property.
		 *
		 * @method aria
		 * @param {String} name Name of the aria property to set.
		 * @param {String} value Value of the aria property.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		aria: function(name, value) {
			var self = this, elm = self.getEl();

			if (typeof(value) === "undefined") {
				return self._aria[name];
			} else {
				self._aria[name] = value;
			}

			if (self._rendered) {
				if (name == 'label') {
					elm.setAttribute('aria-labelledby', self._id);
				}

				elm.setAttribute(name == 'role' ? name : 'aria-' + name, value);
			}

			return self;
		},

		/**
		 * Encodes the specified string with HTML entities. It will also
		 * translate the string to different languages.
		 *
		 * @method encode
		 * @param {String/Object/Array} text Text to entity encode.
		 * @param {Boolean} [translate=true] False if the contents shouldn't be translated.
		 * @return {String} Encoded and possible traslated string. 
		 */
		encode: function(text, translate) {
			if (translate !== false && Control.translate) {
				text = Control.translate(text);
			}

			return (text || '').replace(/[&<>"]/g, function(match) {
				return '&#' + match.charCodeAt(0) + ';';
			});
		},

		/**
		 * Adds items before the current control.
		 *
		 * @method before
		 * @param {Array/tinymce.ui.Collection} items Array of items to prepend before this control.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		before: function(items) {
			var self = this, parent = self.parent();

			if (parent) {
				parent.insert(items, parent.items().indexOf(self), true);
			}

			return self;
		},

		/**
		 * Adds items after the current control.
		 *
		 * @method after
		 * @param {Array/tinymce.ui.Collection} items Array of items to append after this control.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		after: function(items) {
			var self = this, parent = self.parent();

			if (parent) {
				parent.insert(items, parent.items().indexOf(self));
			}

			return self;
		},

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			var self = this, elm = self.getEl(), parent = self.parent(), newItems, i;

			if (self.items) {
				var controls = self.items().toArray();
				i = controls.length;
				while (i--) {
					controls[i].remove();
				}
			}

			if (parent && parent.items) {
				newItems = [];

				parent.items().each(function(item) {
					if (item !== self) {
						newItems.push(item);
					}
				});

				parent.items().set(newItems);
				parent._lastRect = null;
			}

			if (self._eventsRoot && self._eventsRoot == self) {
				DomUtils.off(elm);
			}

			var lookup = self.getRoot().controlIdLookup;
			if (lookup) {
				delete lookup[self._id];
			}

			delete elementIdCache[self._id];

			if (elm && elm.parentNode) {
				var nodes = elm.getElementsByTagName('*');

				i = nodes.length;
				while (i--) {
					delete elementIdCache[nodes[i].id];
				}

				elm.parentNode.removeChild(elm);
			}

			self._rendered = false;

			return self;
		},

		/**
		 * Renders the control before the specified element.
		 *
		 * @method renderBefore
		 * @param {Element} elm Element to render before.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		renderBefore: function(elm) {
			var self = this;

			elm.parentNode.insertBefore(DomUtils.createFragment(self.renderHtml()), elm);
			self.postRender();

			return self;
		},

		/**
		 * Renders the control to the specified element.
		 *
		 * @method renderBefore
		 * @param {Element} elm Element to render to.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		renderTo: function(elm) {
			var self = this;

			elm = elm || self.getContainerElm();
			elm.appendChild(DomUtils.createFragment(self.renderHtml()));
			self.postRender();

			return self;
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		postRender: function() {
			var self = this, settings = self.settings, elm, box, parent, name, parentEventsRoot;

			// Bind on<event> settings
			for (name in settings) {
				if (name.indexOf("on") === 0) {
					self.on(name.substr(2), settings[name]);
				}
			}

			if (self._eventsRoot) {
				for (parent = self.parent(); !parentEventsRoot && parent; parent = parent.parent()) {
					parentEventsRoot = parent._eventsRoot;
				}

				if (parentEventsRoot) {
					for (name in parentEventsRoot._nativeEvents) {
						self._nativeEvents[name] = true;
					}
				}
			}

			self.bindPendingEvents();

			if (settings.style) {
				elm = self.getEl();
				if (elm) {
					elm.setAttribute('style', settings.style);
					elm.style.cssText = settings.style;
				}
			}

			if (!self._visible) {
				DomUtils.css(self.getEl(), 'display', 'none');
			}

			if (self.settings.border) {
				box = self.borderBox();
				DomUtils.css(self.getEl(), {
					'border-top-width': box.top,
					'border-right-width': box.right,
					'border-bottom-width': box.bottom,
					'border-left-width': box.left
				});
			}

			// Add instance to lookup
			var root = self.getRoot();
			if (!root.controlIdLookup) {
				root.controlIdLookup = {};
			}

			root.controlIdLookup[self._id] = self;

			for (var key in self._aria) {
				self.aria(key, self._aria[key]);
			}

			self.fire('postrender', {}, false);
		},

		/**
		 * Scrolls the current control into view.
		 *
		 * @method scrollIntoView
		 * @param {String} align Alignment in view top|center|bottom.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		scrollIntoView: function(align) {
			function getOffset(elm, rootElm) {
				var x, y, parent = elm;

				x = y = 0;
				while (parent && parent != rootElm && parent.nodeType) {
					x += parent.offsetLeft || 0;
					y += parent.offsetTop || 0;
					parent = parent.offsetParent;
				}

				return {x: x, y: y};
			}

			var elm = this.getEl(), parentElm = elm.parentNode;
			var x, y, width, height, parentWidth, parentHeight;
			var pos = getOffset(elm, parentElm);

			x = pos.x;
			y = pos.y;
			width = elm.offsetWidth;
			height = elm.offsetHeight;
			parentWidth = parentElm.clientWidth;
			parentHeight = parentElm.clientHeight;

			if (align == "end") {
				x -= parentWidth - width;
				y -= parentHeight - height;
			} else if (align == "center") {
				x -= (parentWidth / 2) - (width / 2);
				y -= (parentHeight / 2) - (height / 2);
			}

			parentElm.scrollLeft = x;
			parentElm.scrollTop = y;

			return this;
		},

		/**
		 * Binds pending DOM events.
		 *
		 * @private
		 */
		bindPendingEvents: function() {
			var self = this, i, l, parents, eventRootCtrl, nativeEvents, name;

			function delegate(e) {
				var control = self.getParentCtrl(e.target);

				if (control) {
					control.fire(e.type, e);
				}
			}

			function mouseLeaveHandler() {
				var ctrl = eventRootCtrl._lastHoverCtrl;

				if (ctrl) {
					ctrl.fire("mouseleave", {target: ctrl.getEl()});

					ctrl.parents().each(function(ctrl) {
						ctrl.fire("mouseleave", {target: ctrl.getEl()});
					});

					eventRootCtrl._lastHoverCtrl = null;
				}
			}

			function mouseEnterHandler(e) {
				var ctrl = self.getParentCtrl(e.target), lastCtrl = eventRootCtrl._lastHoverCtrl, idx = 0, i, parents, lastParents;

				// Over on a new control
				if (ctrl !== lastCtrl) {
					eventRootCtrl._lastHoverCtrl = ctrl;

					parents = ctrl.parents().toArray().reverse();
					parents.push(ctrl);

					if (lastCtrl) {
						lastParents = lastCtrl.parents().toArray().reverse();
						lastParents.push(lastCtrl);

						for (idx = 0; idx < lastParents.length; idx++) {
							if (parents[idx] !== lastParents[idx]) {
								break;
							}
						}

						for (i = lastParents.length - 1; i >= idx; i--) {
							lastCtrl = lastParents[i];
							lastCtrl.fire("mouseleave", {
								target : lastCtrl.getEl()
							});
						}
					}

					for (i = idx; i < parents.length; i++) {
						ctrl = parents[i];
						ctrl.fire("mouseenter", {
							target : ctrl.getEl()
						});
					}
				}
			}

			function fixWheelEvent(e) {
				e.preventDefault();

				if (e.type == "mousewheel") {
					e.deltaY = - 1/40 * e.wheelDelta;

					if (e.wheelDeltaX) {
						e.deltaX = -1/40 * e.wheelDeltaX;
					}
				} else {
					e.deltaX = 0;
					e.deltaY = e.detail;
				}

				e = self.fire("wheel", e);
			}

			self._rendered = true;

			nativeEvents = self._nativeEvents;
			if (nativeEvents) {
				// Find event root element if it exists
				parents = self.parents().toArray();
				parents.unshift(self);
				for (i = 0, l = parents.length; !eventRootCtrl && i < l; i++) {
					eventRootCtrl = parents[i]._eventsRoot;
				}

				// Event root wasn't found the use the root control
				if (!eventRootCtrl) {
					eventRootCtrl = parents[parents.length - 1] || self;
				}

				// Set the eventsRoot property on children that didn't have it
				self._eventsRoot = eventRootCtrl;
				for (l = i, i = 0; i < l; i++) {
					parents[i]._eventsRoot = eventRootCtrl;
				}

				// Bind native event delegates
				for (name in nativeEvents) {
					if (!nativeEvents) {
						return false;
					}

					if (name === "wheel" && !hasWheelEventSupport) {
						if (hasMouseWheelEventSupport) {
							DomUtils.on(self.getEl(), "mousewheel", fixWheelEvent);
						} else {
							DomUtils.on(self.getEl(), "DOMMouseScroll", fixWheelEvent);
						}

						continue;
					}

					// Special treatment for mousenter/mouseleave since these doesn't bubble
					if (name === "mouseenter" || name === "mouseleave") {
						// Fake mousenter/mouseleave
						if (!eventRootCtrl._hasMouseEnter) {
							DomUtils.on(eventRootCtrl.getEl(), "mouseleave", mouseLeaveHandler);
							DomUtils.on(eventRootCtrl.getEl(), "mouseover", mouseEnterHandler);
							eventRootCtrl._hasMouseEnter = 1;
						}
					} else if (!eventRootCtrl[name]) {
						DomUtils.on(eventRootCtrl.getEl(), name, delegate);
						eventRootCtrl[name] = true;
					}

					// Remove the event once it's bound
					nativeEvents[name] = false;
				}
			}
		},

		getRoot: function() {
			var ctrl = this, rootControl, parents = [];

			while (ctrl) {
				if (ctrl.rootControl) {
					rootControl = ctrl.rootControl;
					break;
				}

				parents.push(ctrl);
				rootControl = ctrl;
				ctrl = ctrl.parent();
			}

			if (!rootControl) {
				rootControl = this;
			}

			var i = parents.length;
			while (i--) {
				parents[i].rootControl = rootControl;
			}

			return rootControl;
		},

		/**
		 * Reflows the current control and it's parents.
		 * This should be used after you for example append children to the current control so
		 * that the layout managers know that they need to reposition everything.
		 *
		 * @example
		 * container.append({type: 'button', text: 'My button'}).reflow();
		 *
		 * @method reflow
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		reflow: function() {
			this.repaint();

			return this;
		}

		/**
		 * Sets/gets the parent container for the control.
		 *
		 * @method parent
		 * @param {tinymce.ui.Container} parent Optional parent to set.
		 * @return {tinymce.ui.Control} Parent control or the current control on a set action.
		 */
		// parent: function(parent) {} -- Generated

		/**
		 * Sets/gets the text for the control.
		 *
		 * @method text
		 * @param {String} value Value to set to control.
		 * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
		 */
		// text: function(value) {} -- Generated

		/**
		 * Sets/gets the width for the control.
		 *
		 * @method width
		 * @param {Number} value Value to set to control.
		 * @return {Number/tinymce.ui.Control} Current control on a set operation or current value on a get.
		 */
		// width: function(value) {} -- Generated

		/**
		 * Sets/gets the height for the control.
		 *
		 * @method height
		 * @param {Number} value Value to set to control.
		 * @return {Number/tinymce.ui.Control} Current control on a set operation or current value on a get.
		 */
		// height: function(value) {} -- Generated

		/**
		 * Sets/gets the disabled state on the control.
		 *
		 * @method disabled
		 * @param {Boolean} state Value to set to control.
		 * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
		 */
		// disabled: function(state) {} -- Generated

		/**
		 * Sets/gets the active for the control.
		 *
		 * @method active
		 * @param {Boolean} state Value to set to control.
		 * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
		 */
		// active: function(state) {} -- Generated

		/**
		 * Sets/gets the name for the control.
		 *
		 * @method name
		 * @param {String} value Value to set to control.
		 * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
		 */
		// name: function(value) {} -- Generated

		/**
		 * Sets/gets the title for the control.
		 *
		 * @method title
		 * @param {String} value Value to set to control.
		 * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
		 */
		// title: function(value) {} -- Generated
	});

	return Control;
});

// Included from: js/tinymce/classes/ui/Factory.js

/**
 * Factory.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class is a factory for control instances. This enables you
 * to create instances of controls without having to require the UI controls directly.
 *
 * It also allow you to override or add new control types.
 *
 * @class tinymce.ui.Factory
 */
define("tinymce/ui/Factory", [], function() {
	"use strict";

	var types = {}, namespaceInit;

	return {
		/**
		 * Adds a new control instance type to the factory.
		 *
		 * @method add
		 * @param {String} type Type name for example "button".
		 * @param {function} typeClass Class type function.
		 */
		add: function(type, typeClass) {
			types[type.toLowerCase()] = typeClass;
		},

		/**
		 * Returns true/false if the specified type exists or not.
		 *
		 * @method has
		 * @param {String} type Type to look for.
		 * @return {Boolean} true/false if the control by name exists.
		 */
		has: function(type) {
			return !!types[type.toLowerCase()];
		},

		/**
		 * Creates a new control instance based on the settings provided. The instance created will be
		 * based on the specified type property it can also create whole structures of components out of
		 * the specified JSON object.
		 *
		 * @example
		 * tinymce.ui.Factory.create({
		 *     type: 'button',
		 *     text: 'Hello world!'
		 * });
		 *
		 * @method create
		 * @param {Object/String} settings Name/Value object with items used to create the type.
		 * @return {tinymce.ui.Control} Control instance based on the specified type.
		 */
		create: function(type, settings) {
			var ControlType, name, namespace;

			// Build type lookup
			if (!namespaceInit) {
				namespace = tinymce.ui;

				for (name in namespace) {
					types[name.toLowerCase()] = namespace[name];
				}

				namespaceInit = true;
			}

			// If string is specified then use it as the type
			if (typeof(type) == 'string') {
				settings = settings || {};
				settings.type = type;
			} else {
				settings = type;
				type = settings.type;
			}

			// Find control type
			type = type.toLowerCase();
			ControlType = types[type];

			// #if debug

			if (!ControlType) {
				throw new Error("Could not find control by type: " + type);
			}

			// #endif

			ControlType = new ControlType(settings);
			ControlType.type = type; // Set the type on the instance, this will be used by the Selector engine

			return ControlType;
		}
	};
});

// Included from: js/tinymce/classes/ui/Container.js

/**
 * Container.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Container control. This is extended by all controls that can have
 * children such as panels etc. You can also use this class directly as an
 * generic container instance. The container doesn't have any specific role or style.
 *
 * @-x-less Container.less
 * @class tinymce.ui.Container
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Container", [
	"tinymce/ui/Control",
	"tinymce/ui/Collection",
	"tinymce/ui/Selector",
	"tinymce/ui/Factory",
	"tinymce/util/Tools",
	"tinymce/ui/DomUtils"
], function(Control, Collection, Selector, Factory, Tools, DomUtils) {
	"use strict";

	var selectorCache = {};

	return Control.extend({
		layout: '',
		innerClass: 'container-inner',

		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Array} items Items to add to container in JSON format or control instances.
		 * @setting {String} layout Layout manager by name to use.
		 * @setting {Object} defaults Default settings to apply to all items.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			settings = self.settings;
			self._fixed = settings.fixed;
			self._items = new Collection();

			if (self.isRtl()) {
				self.addClass('rtl');
			}

			self.addClass('container');
			self.addClass('container-body', 'body');

			if (settings.containerCls) {
				self.addClass(settings.containerCls);
			}

			self._layout = Factory.create((settings.layout || self.layout) + 'layout');

			if (self.settings.items) {
				self.add(self.settings.items);
			}

			// TODO: Fix this!
			self._hasBody = true;
		},

		/**
		 * Returns a collection of child items that the container currently have.
		 *
		 * @method items
		 * @return {tinymce.ui.Collection} Control collection direct child controls.
		 */
		items: function() {
			return this._items;
		},

		/**
		 * Find child controls by selector.
		 *
		 * @method find
		 * @param {String} selector Selector CSS pattern to find children by.
		 * @return {tinymce.ui.Collection} Control collection with child controls.
		 */
		find: function(selector) {
			selector = selectorCache[selector] = selectorCache[selector] || new Selector(selector);

			return selector.find(this);
		},

		/**
		 * Adds one or many items to the current container. This will create instances of
		 * the object representations if needed.
		 *
		 * @method add
		 * @param {Array/Object/tinymce.ui.Control} items Array or item that will be added to the container.
		 * @return {tinymce.ui.Collection} Current collection control.
		 */
		add: function(items) {
			var self = this;

			self.items().add(self.create(items)).parent(self);

			return self;
		},

		/**
		 * Focuses the current container instance. This will look
		 * for the first control in the container and focus that.
		 *
		 * @method focus
		 * @return {tinymce.ui.Collection} Current instance.
		 */
		focus: function() {
			var self = this;

			if (self.keyNav) {
				self.keyNav.focusFirst();
			} else {
				self._super();
			}

			return self;
		},

		/**
		 * Replaces the specified child control with a new control.
		 *
		 * @method replace
		 * @param {tinymce.ui.Control} oldItem Old item to be replaced.
		 * @param {tinymce.ui.Control} newItem New item to be inserted.
		 */
		replace: function(oldItem, newItem) {
			var ctrlElm, items = this.items(), i = items.length;

			// Replace the item in collection
			while (i--) {
				if (items[i] === oldItem) {
					items[i] = newItem;
					break;
				}
			}

			if (i >= 0) {
				// Remove new item from DOM
				ctrlElm = newItem.getEl();
				if (ctrlElm) {
					ctrlElm.parentNode.removeChild(ctrlElm);
				}

				// Remove old item from DOM
				ctrlElm = oldItem.getEl();
				if (ctrlElm) {
					ctrlElm.parentNode.removeChild(ctrlElm);
				}
			}

			// Adopt the item
			newItem.parent(this);
		},

		/**
		 * Creates the specified items. If any of the items is plain JSON style objects
		 * it will convert these into real tinymce.ui.Control instances.
		 *
		 * @method create
		 * @param {Array} items Array of items to convert into control instances.
		 * @return {Array} Array with control instances.
		 */
		create: function(items) {
			var self = this, settings, ctrlItems = [];

			// Non array structure, then force it into an array
			if (!Tools.isArray(items)) {
				items = [items];
			}

			// Add default type to each child control
			Tools.each(items, function(item) {
				if (item) {
					// Construct item if needed
					if (!(item instanceof Control)) {
						// Name only then convert it to an object
						if (typeof(item) == "string") {
							item = {type: item};
						}

						// Create control instance based on input settings and default settings
						settings = Tools.extend({}, self.settings.defaults, item);
						item.type = settings.type = settings.type || item.type || self.settings.defaultType ||
							(settings.defaults ? settings.defaults.type : null);
						item = Factory.create(settings);
					}

					ctrlItems.push(item);
				}
			});

			return ctrlItems;
		},

		/**
		 * Renders new control instances.
		 *
		 * @private
		 */
		renderNew: function() {
			var self = this;

			// Render any new items
			self.items().each(function(ctrl, index) {
				var containerElm, fragment;

				ctrl.parent(self);

				if (!ctrl._rendered) {
					containerElm = self.getEl('body');
					fragment = DomUtils.createFragment(ctrl.renderHtml());

					// Insert or append the item
					if (containerElm.hasChildNodes() && index <= containerElm.childNodes.length - 1) {
						containerElm.insertBefore(fragment, containerElm.childNodes[index]);
					} else {
						containerElm.appendChild(fragment);
					}

					ctrl.postRender();
				}
			});

			self._layout.applyClasses(self);
			self._lastRect = null;

			return self;
		},

		/**
		 * Appends new instances to the current container.
		 *
		 * @method append
		 * @param {Array/tinymce.ui.Collection} items Array if controls to append.
		 * @return {tinymce.ui.Container} Current container instance.
		 */
		append: function(items) {
			return this.add(items).renderNew();
		},

		/**
		 * Prepends new instances to the current container.
		 *
		 * @method prepend
		 * @param {Array/tinymce.ui.Collection} items Array if controls to prepend.
		 * @return {tinymce.ui.Container} Current container instance.
		 */
		prepend: function(items) {
			var self = this;

			self.items().set(self.create(items).concat(self.items().toArray()));

			return self.renderNew();
		},

		/**
		 * Inserts an control at a specific index.
		 *
		 * @method insert
		 * @param {Array/tinymce.ui.Collection} items Array if controls to insert.
		 * @param {Number} index Index to insert controls at.
		 * @param {Boolean} [before=false] Inserts controls before the index.
		 */
		insert: function(items, index, before) {
			var self = this, curItems, beforeItems, afterItems;

			items = self.create(items);
			curItems = self.items();

			if (!before && index < curItems.length - 1) {
				index += 1;
			}

			if (index >= 0 && index < curItems.length) {
				beforeItems = curItems.slice(0, index).toArray();
				afterItems = curItems.slice(index).toArray();
				curItems.set(beforeItems.concat(items, afterItems));
			}

			return self.renderNew();
		},

		/**
		 * Populates the form fields from the specified JSON data object.
		 *
		 * Control items in the form that matches the data will have it's value set.
		 *
		 * @method fromJSON
		 * @param {Object} data JSON data object to set control values by.
		 * @return {tinymce.ui.Container} Current form instance.
		 */
		fromJSON: function(data) {
			var self = this;

			for (var name in data) {
				self.find('#' + name).value(data[name]);
			}

			return self;
		},

		/**
		 * Serializes the form into a JSON object by getting all items
		 * that has a name and a value.
		 *
		 * @method toJSON
		 * @return {Object} JSON object with form data.
		 */
		toJSON: function() {
			var self = this, data = {};

			self.find('*').each(function(ctrl) {
				var name = ctrl.name(), value = ctrl.value();

				if (name && typeof(value) != "undefined") {
					data[name] = value;
				}
			});

			return data;
		},

		preRender: function() {
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, role = this.settings.role;

			self.preRender();
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '"' + (role ? ' role="' + this.settings.role + '"' : '') + '>' +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">'+
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.Container} Current combobox instance.
		 */
		postRender: function() {
			var self = this, box;

			self.items().exec('postRender');
			self._super();

			self._layout.postRender(self);
			self._rendered = true;

			if (self.settings.style) {
				DomUtils.css(self.getEl(), self.settings.style);
			}

			if (self.settings.border) {
				box = self.borderBox();
				DomUtils.css(self.getEl(), {
					'border-top-width': box.top,
					'border-right-width': box.right,
					'border-bottom-width': box.bottom,
					'border-left-width': box.left
				});
			}

			return self;
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, layoutRect = self._super();

			// Recalc container size by asking layout manager
			self._layout.recalc(self);

			return layoutRect;
		},

		/**
		 * Recalculates the positions of the controls in the current container.
		 * This is invoked by the reflow method and shouldn't be called directly.
		 *
		 * @method recalc
		 */
		recalc: function() {
			var self = this, rect = self._layoutRect, lastRect = self._lastRect;

			if (!lastRect || lastRect.w != rect.w || lastRect.h != rect.h) {
				self._layout.recalc(self);
				rect = self.layoutRect();
				self._lastRect = {x: rect.x, y: rect.y, w: rect.w, h: rect.h};
				return true;
			}
		},

		/**
		 * Reflows the current container and it's children and possible parents.
		 * This should be used after you for example append children to the current control so
		 * that the layout managers know that they need to reposition everything.
		 *
		 * @example
		 * container.append({type: 'button', text: 'My button'}).reflow();
		 *
		 * @method reflow
		 * @return {tinymce.ui.Container} Current container instance.
		 */
		reflow: function() {
			var i, items;

			if (this.visible()) {
				Control.repaintControls = [];
				Control.repaintControls.map = {};

				items = this.recalc();
				i = Control.repaintControls.length;

				while (i--) {
					Control.repaintControls[i].repaint();
				}

				// TODO: Fix me!
				if (this.settings.layout !== "flow" && this.settings.layout !== "stack") {
					this.repaint();
				}

				Control.repaintControls = [];
			}

			return this;
		}
	});
});

// Included from: js/tinymce/classes/ui/DragHelper.js

/**
 * DragHelper.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Drag/drop helper class.
 *
 * @example
 * var dragHelper = new tinymce.ui.DragHelper('mydiv', {
 *     start: function(evt) {
 *     },
 *
 *     drag: function(evt) {
 *     },
 *
 *     end: function(evt) {
 *     }
 * });
 *
 * @class tinymce.ui.DragHelper
 */
define("tinymce/ui/DragHelper", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	function getDocumentSize() {
		var doc = document, documentElement, body, scrollWidth, clientWidth;
		var offsetWidth, scrollHeight, clientHeight, offsetHeight, max = Math.max;

		documentElement = doc.documentElement;
		body = doc.body;

		scrollWidth = max(documentElement.scrollWidth, body.scrollWidth);
		clientWidth = max(documentElement.clientWidth, body.clientWidth);
		offsetWidth = max(documentElement.offsetWidth, body.offsetWidth);

		scrollHeight = max(documentElement.scrollHeight, body.scrollHeight);
		clientHeight = max(documentElement.clientHeight, body.clientHeight);
		offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

		return {
			width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
			height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
		};
	}

	return function(id, settings) {
		var eventOverlayElm, doc = document, downButton, start, stop, drag, startX, startY;

		settings = settings || {};

		function getHandleElm() {
			return doc.getElementById(settings.handle || id);
		}

		start = function(e) {
			var docSize = getDocumentSize(), handleElm, cursor;

			e.preventDefault();
			downButton = e.button;
			handleElm = getHandleElm();
			startX = e.screenX;
			startY = e.screenY;

			// Grab cursor from handle
			if (window.getComputedStyle) {
				cursor = window.getComputedStyle(handleElm, null).getPropertyValue("cursor");
			} else {
				cursor = handleElm.runtimeStyle.cursor;
			}

			// Create event overlay and add it to document
			eventOverlayElm = doc.createElement('div');
			DomUtils.css(eventOverlayElm, {
				position: "absolute",
				top: 0, left: 0,
				width: docSize.width,
				height: docSize.height,
				zIndex: 0x7FFFFFFF,
				opacity: 0.0001,
				background: 'red',
				cursor: cursor
			});

			doc.body.appendChild(eventOverlayElm);

			// Bind mouse events
			DomUtils.on(doc, 'mousemove', drag);
			DomUtils.on(doc, 'mouseup', stop);

			// Begin drag
			settings.start(e);
		};

		drag = function(e) {
			if (e.button !== downButton) {
				return stop(e);
			}

			e.deltaX = e.screenX - startX;
			e.deltaY = e.screenY - startY;

			e.preventDefault();
			settings.drag(e);
		};

		stop = function(e) {
			DomUtils.off(doc, 'mousemove', drag);
			DomUtils.off(doc, 'mouseup', stop);

			eventOverlayElm.parentNode.removeChild(eventOverlayElm);

			if (settings.stop) {
				settings.stop(e);
			}
		};

		/**
		 * Destroys the drag/drop helper instance.
		 *
		 * @method destroy
		 */
		this.destroy = function() {
			DomUtils.off(getHandleElm());
		};

		DomUtils.on(getHandleElm(), 'mousedown', start);
	};
});

// Included from: js/tinymce/classes/ui/Scrollable.js

/**
 * Scrollable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin makes controls scrollable using custom scrollbars.
 *
 * @-x-less Scrollable.less
 * @mixin tinymce.ui.Scrollable
 */
define("tinymce/ui/Scrollable", [
	"tinymce/ui/DomUtils",
	"tinymce/ui/DragHelper"
], function(DomUtils, DragHelper) {
	"use strict";

	return {
		init: function() {
			var self = this;
			self.on('repaint', self.renderScroll);
		},

		renderScroll: function() {
			var self = this, margin = 2;

			function repaintScroll() {
				var hasScrollH, hasScrollV, bodyElm;

				function repaintAxis(axisName, posName, sizeName, contentSizeName, hasScroll, ax) {
					var containerElm, scrollBarElm, scrollThumbElm;
					var containerSize, scrollSize, ratio, rect;
					var posNameLower, sizeNameLower;

					scrollBarElm = self.getEl('scroll' + axisName);
					if (scrollBarElm) {
						posNameLower = posName.toLowerCase();
						sizeNameLower = sizeName.toLowerCase();

						if (self.getEl('absend')) {
							DomUtils.css(self.getEl('absend'), posNameLower, self.layoutRect()[contentSizeName] - 1);
						}

						if (!hasScroll) {
							DomUtils.css(scrollBarElm, 'display', 'none');
							return;
						}

						DomUtils.css(scrollBarElm, 'display', 'block');
						containerElm = self.getEl('body');
						scrollThumbElm = self.getEl('scroll' + axisName + "t");
						containerSize = containerElm["client" + sizeName] - (margin * 2);
						containerSize -= hasScrollH && hasScrollV ? scrollBarElm["client" + ax] : 0;
						scrollSize = containerElm["scroll" + sizeName];
						ratio = containerSize / scrollSize;

						rect = {};
						rect[posNameLower] = containerElm["offset" + posName] + margin;
						rect[sizeNameLower] = containerSize;
						DomUtils.css(scrollBarElm, rect);

						rect = {};
						rect[posNameLower] = containerElm["scroll" + posName] * ratio;
						rect[sizeNameLower] = containerSize * ratio;
						DomUtils.css(scrollThumbElm, rect);
					}
				}

				bodyElm = self.getEl('body');
				hasScrollH = bodyElm.scrollWidth > bodyElm.clientWidth;
				hasScrollV = bodyElm.scrollHeight > bodyElm.clientHeight;

				repaintAxis("h", "Left", "Width", "contentW", hasScrollH, "Height");
				repaintAxis("v", "Top", "Height", "contentH", hasScrollV, "Width");
			}

			function addScroll() {
				function addScrollAxis(axisName, posName, sizeName, deltaPosName, ax) {
					var scrollStart, axisId = self._id + '-scroll' + axisName, prefix = self.classPrefix;

					self.getEl().appendChild(DomUtils.createFragment(
						'<div id="' + axisId + '" class="' + prefix + 'scrollbar ' + prefix + 'scrollbar-' + axisName + '">' +
							'<div id="' + axisId + 't" class="' + prefix + 'scrollbar-thumb"></div>' +
						'</div>'
					));

					self.draghelper = new DragHelper(axisId + 't', {
						start: function() {
							scrollStart = self.getEl('body')["scroll" + posName];
							DomUtils.addClass(DomUtils.get(axisId), prefix + 'active');
						},

						drag: function(e) {
							var ratio, hasScrollH, hasScrollV, containerSize, layoutRect = self.layoutRect();

							hasScrollH = layoutRect.contentW > layoutRect.innerW;
							hasScrollV = layoutRect.contentH > layoutRect.innerH;
							containerSize = self.getEl('body')["client" + sizeName] - (margin * 2);
							containerSize -= hasScrollH && hasScrollV ? self.getEl('scroll' + axisName)["client" + ax] : 0;

							ratio = containerSize / self.getEl('body')["scroll" + sizeName];
							self.getEl('body')["scroll" + posName] = scrollStart + (e["delta" + deltaPosName] / ratio);
						},

						stop: function() {
							DomUtils.removeClass(DomUtils.get(axisId), prefix + 'active');
						}
					});
/*
					self.on('click', function(e) {
						if (e.target.id == self._id + '-scrollv') {

						}
					});*/
				}

				self.addClass('scroll');

				addScrollAxis("v", "Top", "Height", "Y", "Width");
				addScrollAxis("h", "Left", "Width", "X", "Height");
			}

			if (self.settings.autoScroll) {
				if (!self._hasScroll) {
					self._hasScroll = true;
					addScroll();

					self.on('wheel', function(e) {
						var bodyEl = self.getEl('body');

						bodyEl.scrollLeft += (e.deltaX || 0) * 10;
						bodyEl.scrollTop += e.deltaY * 10;

						repaintScroll();
					});

					DomUtils.on(self.getEl('body'), "scroll", repaintScroll);
				}

				repaintScroll();
			}
		}
	};
});

// Included from: js/tinymce/classes/ui/Panel.js

/**
 * Panel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new panel.
 *
 * @-x-less Panel.less
 * @class tinymce.ui.Panel
 * @extends tinymce.ui.Container
 * @mixes tinymce.ui.Scrollable
 */
define("tinymce/ui/Panel", [
	"tinymce/ui/Container",
	"tinymce/ui/Scrollable"
], function(Container, Scrollable) {
	"use strict";

	return Container.extend({
		Defaults: {
			layout: 'fit',
			containerCls: 'panel'
		},

		Mixins: [Scrollable],

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, innerHtml = self.settings.html;

			self.preRender();
			layout.preRender(self);

			if (typeof(innerHtml) == "undefined") {
				innerHtml = (
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						layout.renderHtml(self) +
					'</div>'
				);
			} else {
				if (typeof(innerHtml) == 'function') {
					innerHtml = innerHtml.call(self);
				}

				self._hasBody = false;
			}

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self._preBodyHtml || '') +
					innerHtml +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/Movable.js

/**
 * Movable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Movable mixin. Makes controls movable absolute and relative to other elements.
 *
 * @mixin tinymce.ui.Movable
 */
define("tinymce/ui/Movable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	function calculateRelativePosition(ctrl, targetElm, rel) {
		var ctrlElm, pos, x, y, selfW, selfH, targetW, targetH, viewport, size;

		viewport = DomUtils.getViewPort();

		// Get pos of target
		pos = DomUtils.getPos(targetElm);
		x = pos.x;
		y = pos.y;

		if (ctrl._fixed) {
			x -= viewport.x;
			y -= viewport.y;
		}

		// Get size of self
		ctrlElm = ctrl.getEl();
		size = DomUtils.getSize(ctrlElm);
		selfW = size.width;
		selfH = size.height;

		// Get size of target
		size = DomUtils.getSize(targetElm);
		targetW = size.width;
		targetH = size.height;

		// Parse align string
		rel = (rel || '').split('');

		// Target corners
		if (rel[0] === 'b') {
			y += targetH;
		}

		if (rel[1] === 'r') {
			x += targetW;
		}

		if (rel[0] === 'c') {
			y += Math.round(targetH / 2);
		}

		if (rel[1] === 'c') {
			x += Math.round(targetW / 2);
		}

		// Self corners
		if (rel[3] === 'b') {
			y -= selfH;
		}

		if (rel[4] === 'r') {
			x -= selfW;
		}

		if (rel[3] === 'c') {
			y -= Math.round(selfH / 2);
		}

		if (rel[4] === 'c') {
			x -= Math.round(selfW / 2);
		}

		return {
			x: x,
			y: y,
			w: selfW,
			h: selfH
		};
	}

	return {
		/**
		 * Tests various positions to get the most suitable one.
		 *
		 * @method testMoveRel
		 * @param {DOMElement} elm Element to position against.
		 * @param {Array} rels Array with relative positions.
		 * @return {String} Best suitable relative position.
		 */
		testMoveRel: function(elm, rels) {
			var viewPortRect = DomUtils.getViewPort();

			for (var i = 0; i < rels.length; i++) {
				var pos = calculateRelativePosition(this, elm, rels[i]);

				if (this._fixed) {
					if (pos.x > 0 && pos.x + pos.w < viewPortRect.w && pos.y > 0 && pos.y + pos.h < viewPortRect.h) {
						return rels[i];
					}
				} else {
					if (pos.x > viewPortRect.x && pos.x + pos.w < viewPortRect.w + viewPortRect.x &&
						pos.y > viewPortRect.y && pos.y + pos.h < viewPortRect.h + viewPortRect.y) {
						return rels[i];
					}
				}
			}

			return rels[0];
		},

		/**
		 * Move relative to the specified element.
		 *
		 * @method moveRel
		 * @param {Element} elm Element to move relative to.
		 * @param {String} rel Relative mode. For example: br-tl.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveRel: function(elm, rel) {
			if (typeof(rel) != 'string') {
				rel = this.testMoveRel(elm, rel);
			}

			var pos = calculateRelativePosition(this, elm, rel);
			return this.moveTo(pos.x, pos.y);
		},

		/**
		 * Move by a relative x, y values.
		 *
		 * @method moveBy
		 * @param {Number} dx Relative x position.
		 * @param {Number} dy Relative y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveBy: function(dx, dy) {
			var self = this, rect = self.layoutRect();

			self.moveTo(rect.x + dx, rect.y + dy);

			return self;
		},

		/**
		 * Move to absolute position.
		 *
		 * @method moveTo
		 * @param {Number} x Absolute x position.
		 * @param {Number} y Absolute y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveTo: function(x, y) {
			var self = this;

			// TODO: Move this to some global class
			function contrain(value, max, size) {
				if (value < 0) {
					return 0;
				}

				if (value + size > max) {
					value = max - size;
					return value < 0 ? 0 : value;
				}

				return value;
			}

			if (self.settings.constrainToViewport) {
				var viewPortRect = DomUtils.getViewPort(window);
				var layoutRect = self.layoutRect();

				x = contrain(x, viewPortRect.w + viewPortRect.x, layoutRect.w);
				y = contrain(y, viewPortRect.h + viewPortRect.y, layoutRect.h);
			}

			if (self._rendered) {
				self.layoutRect({x: x, y: y}).repaint();
			} else {
				self.settings.x = x;
				self.settings.y = y;
			}

			self.fire('move', {x: x, y: y});

			return self;
		}
	};
});

// Included from: js/tinymce/classes/ui/Resizable.js

/**
 * Resizable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Resizable mixin. Enables controls to be resized.
 *
 * @mixin tinymce.ui.Resizable
 */
define("tinymce/ui/Resizable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	return {
		/** 
		 * Resizes the control to contents.
		 *
		 * @method resizeToContent
		 */
		resizeToContent: function() {
			this._layoutRect.autoResize = true;
			this._lastRect = null;
			this.reflow();
		},

		/** 
		 * Resizes the control to a specific width/height.
		 *
		 * @method resizeTo
		 * @param {Number} w Control width.
		 * @param {Number} h Control height.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		resizeTo: function(w, h) {
			// TODO: Fix hack
			if (w <= 1 || h <= 1) {
				var rect = DomUtils.getWindowSize();

				w = w <= 1 ? w * rect.w : w;
				h = h <= 1 ? h * rect.h : h;
			}

			this._layoutRect.autoResize = false;
			return this.layoutRect({minW: w, minH: h, w: w, h: h}).reflow();
		},

		/** 
		 * Resizes the control to a specific relative width/height.
		 *
		 * @method resizeBy
		 * @param {Number} dw Relative control width.
		 * @param {Number} dh Relative control height.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		resizeBy: function(dw, dh) {
			var self = this, rect = self.layoutRect();

			return self.resizeTo(rect.w + dw, rect.h + dh);
		}
	};
});

// Included from: js/tinymce/classes/ui/FloatPanel.js

/**
 * FloatPanel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a floating panel.
 *
 * @-x-less FloatPanel.less
 * @class tinymce.ui.FloatPanel
 * @extends tinymce.ui.Panel
 * @mixes tinymce.ui.Movable
 * @mixes tinymce.ui.Resizable
 */
define("tinymce/ui/FloatPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/Movable",
	"tinymce/ui/Resizable",
	"tinymce/ui/DomUtils"
], function(Panel, Movable, Resizable, DomUtils) {
	"use strict";

	var documentClickHandler, documentScrollHandler, visiblePanels = [];
	var zOrder = [], hasModal;

	var FloatPanel = Panel.extend({
		Mixins: [Movable, Resizable],

		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} autohide Automatically hide the panel.
		 */
		init: function(settings) {
			var self = this;

			function reorder() {
				var i, zIndex = FloatPanel.zIndex || 0xFFFF, topModal;

				if (zOrder.length) {
					for (i = 0; i < zOrder.length; i++) {
						if (zOrder[i].modal) {
							zIndex++;
							topModal = zOrder[i];
						}

						zOrder[i].getEl().style.zIndex = zIndex;
						zOrder[i].zIndex = zIndex;
						zIndex++;
					}
				}

				var modalBlockEl = document.getElementById(self.classPrefix + 'modal-block');

				if (topModal) {
					DomUtils.css(modalBlockEl, 'z-index', topModal.zIndex - 1);
				} else if (modalBlockEl) {
					modalBlockEl.parentNode.removeChild(modalBlockEl);
					hasModal = false;
				}

				FloatPanel.currentZIndex = zIndex;
			}

			function isChildOf(ctrl, parent) {
				while (ctrl) {
					if (ctrl == parent) {
						return true;
					}

					ctrl = ctrl.parent();
				}
			}

			/**
			 * Repositions the panel to the top of page if the panel is outside of the visual viewport. It will
			 * also reposition all child panels of the current panel.
			 */
			function repositionPanel(panel) {
				var scrollY = DomUtils.getViewPort().y;

				function toggleFixedChildPanels(fixed, deltaY) {
					var parent;

					for (var i = 0; i < visiblePanels.length; i++) {
						if (visiblePanels[i] != panel) {
							parent = visiblePanels[i].parent();

							while (parent && (parent = parent.parent())) {
								if (parent == panel) {
									visiblePanels[i].fixed(fixed).moveBy(0, deltaY).repaint();
								}
							}
						}
					}
				}

				if (panel.settings.autofix) {
					if (!panel._fixed) {
						panel._autoFixY = panel.layoutRect().y;

						if (panel._autoFixY < scrollY) {
							panel.fixed(true).layoutRect({y: 0}).repaint();
							toggleFixedChildPanels(true, scrollY - panel._autoFixY);
						}
					} else {
						if (panel._autoFixY > scrollY) {
							panel.fixed(false).layoutRect({y: panel._autoFixY}).repaint();
							toggleFixedChildPanels(false, panel._autoFixY - scrollY);
						}
					}
				}
			}

			self._super(settings);
			self._eventsRoot = self;

			self.addClass('floatpanel');

			// Hide floatpanes on click out side the root button
			if (settings.autohide) {
				if (!documentClickHandler) {
					documentClickHandler = function(e) {
						// Hide any float panel when a click is out side that float panel and the
						// float panels direct parent for example a click on a menu button
						var i = visiblePanels.length;
						while (i--) {
							var panel = visiblePanels[i], clickCtrl = panel.getParentCtrl(e.target);

							if (panel.settings.autohide) {
								if (clickCtrl) {
									if (isChildOf(clickCtrl, panel) || panel.parent() === clickCtrl) {
										continue;
									}
								}

								e = panel.fire('autohide', {target: e.target});
								if (!e.isDefaultPrevented()) {
									panel.hide();
								}
							}
						}
					};

					DomUtils.on(document, 'click', documentClickHandler);
				}

				visiblePanels.push(self);
			}

			if (settings.autofix) {
				if (!documentScrollHandler) {
					documentScrollHandler = function() {
						var i;

						i = visiblePanels.length;
						while (i--) {
							repositionPanel(visiblePanels[i]);
						}
					};

					DomUtils.on(window, 'scroll', documentScrollHandler);
				}

				self.on('move', function() {
					repositionPanel(this);
				});
			}

			self.on('postrender show', function(e) {
				if (e.control == self) {
					var modalBlockEl, prefix = self.classPrefix;

					if (self.modal && !hasModal) {
						modalBlockEl = DomUtils.createFragment('<div id="' + prefix + 'modal-block" class="' +
							prefix + 'reset ' + prefix + 'fade"></div>');
						modalBlockEl = modalBlockEl.firstChild;

						self.getContainerElm().appendChild(modalBlockEl);

						setTimeout(function() {
							DomUtils.addClass(modalBlockEl, prefix + 'in');
							DomUtils.addClass(self.getEl(), prefix + 'in');
						}, 0);

						hasModal = true;
					}

					zOrder.push(self);
					reorder();
				}
			});

			self.on('close hide', function(e) {
				if (e.control == self) {
					var i = zOrder.length;

					while (i--) {
						if (zOrder[i] === self) {
							zOrder.splice(i, 1);
						}
					}

					reorder();
				}
			});

			self.on('show', function() {
				self.parents().each(function(ctrl) {
					if (ctrl._fixed) {
						self.fixed(true);
						return false;
					}
				});
			});

			if (settings.popover) {
				self._preBodyHtml = '<div class="' + self.classPrefix + 'arrow"></div>';
				self.addClass('popover').addClass('bottom').addClass(self.isRtl() ? 'end' : 'start');
			}
		},

		fixed: function(state) {
			var self = this;

			if (self._fixed != state) {
				if (self._rendered) {
					var viewport = DomUtils.getViewPort();

					if (state) {
						self.layoutRect().y -= viewport.y;
					} else {
						self.layoutRect().y += viewport.y;
					}
				}

				self.toggleClass('fixed', state);
				self._fixed = state;
			}

			return self;
		},

		/**
		 * Shows the current float panel.
		 *
		 * @method show
		 * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
		 */
		show: function() {
			var self = this, i, state = self._super();

			i = visiblePanels.length;
			while (i--) {
				if (visiblePanels[i] === self) {
					break;
				}
			}

			if (i === -1) {
				visiblePanels.push(self);
			}

			return state;
		},

		/**
		 * Hides the current float panel.
		 *
		 * @method hide
		 * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
		 */
		hide: function() {
			removeVisiblePanel(this);
			return this._super();
		},

		/**
		 * Hides all visible the float panels.
		 *
		 * @method hideAll
		 */
		hideAll: function() {
			FloatPanel.hideAll();
		},

		/**
		 * Closes the float panel. This will remove the float panel from page and fire the close event.
		 *
		 * @method close
		 */
		close: function() {
			var self = this;

			self.fire('close');

			return self.remove();
		},

		/**
		 * Removes the float panel from page.
		 *
		 * @method remove
		 */
		remove: function() {
			removeVisiblePanel(this);
			this._super();
		}
	});

	/**
	 * Hides all visible the float panels.
	 *
	 * @static
	 * @method hideAll
	 */
	FloatPanel.hideAll = function() {
		var i = visiblePanels.length;

		while (i--) {
			var panel = visiblePanels[i];

			if (panel.settings.autohide) {
				panel.fire('cancel', {}, false);
				panel.hide();
				visiblePanels.splice(i, 1);
			}
		}
	};

	function removeVisiblePanel(panel) {
		var i;

		i = visiblePanels.length;
		while (i--) {
			if (visiblePanels[i] === panel) {
				visiblePanels.splice(i, 1);
			}
		}

		i = zOrder.length;
		while (i--) {
			if (zOrder[i] === panel) {
				zOrder.splice(i, 1);
			}
		}
	}

	return FloatPanel;
});

// Included from: js/tinymce/classes/ui/KeyboardNavigation.js

/**
 * KeyboardNavigation.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles keyboard navigation of controls and elements.
 *
 * @class tinymce.ui.KeyboardNavigation
 */
define("tinymce/ui/KeyboardNavigation", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	/**
	 * Create a new KeyboardNavigation instance to handle the focus for a specific element.
	 *
	 * @constructor
	 * @param {Object} settings the settings object to define how keyboard navigation works.
	 *
	 * @setting {tinymce.ui.Control} root the root control navigation focus movement is scoped to this root.
	 * @setting {Array} items an array containing the items to move focus between. Every object in this array must have an
	 *                        id attribute which maps to the actual DOM element and it must be able to have focus i.e. tabIndex=-1.
	 * @setting {Function} onCancel the callback for when the user presses escape or otherwise indicates canceling.
	 * @setting {Function} onAction (optional) the action handler to call when the user activates an item.
	 * @setting {Boolean} enableLeftRight (optional, default) when true, the up/down arrows move through items.
	 * @setting {Boolean} enableUpDown (optional) when true, the up/down arrows move through items.
	 * Note for both up/down and left/right explicitly set both enableLeftRight and enableUpDown to true.
	 */
	return function(settings) {
		var root = settings.root, enableUpDown = settings.enableUpDown !== false;
		var enableLeftRight = settings.enableLeftRight !== false;
		var items = settings.items, focussedId;

		/**
		 * Initializes the items array if needed. This will collect items/elements
		 * from the specified root control.
		 */
		function initItems() {
			if (!items) {
				items = [];

				if (root.find) {
					// Root is a container then get child elements using the UI API
					root.find('*').each(function(ctrl) {
						if (ctrl.canFocus) {
							items.push(ctrl.getEl());
						}
					});
				} else {
					// Root is a control/widget then get the child elements of that control
					var elements = root.getEl().getElementsByTagName('*');
					for (var i = 0; i < elements.length; i++) {
						if (elements[i].id && elements[i]) {
							items.push(elements[i]);
						}
					}
				}
			}
		}

		/**
		 * Returns the currently focused element.
		 *
		 * @private
		 * @return {Element} Currently focused element.
		 */
		function getFocusElement() {
			return document.getElementById(focussedId);
		}

		/**
		 * Returns the currently focused elements wai aria role.
		 *
		 * @private
		 * @param {Element} elm Optional element to get role from.
		 * @return {String} Role of specified element.
		 */
		function getRole(elm) {
			elm = elm || getFocusElement();

			return elm && elm.getAttribute('role');
		}

		/**
		 * Returns the role of the parent element.
		 *
		 * @private
		 * @param {Element} elm Optional element to get parent role from.
		 * @return {String} Role of the first parent that has a role.
		 */
		function getParentRole(elm) {
			var role, parent = elm || getFocusElement();

			while ((parent = parent.parentNode)) {
				if ((role = getRole(parent))) {
					return role;
				}
			}
		}

		/**
		 * Returns an wai aria property by name.
		 *
		 * @private
		 * @param {String} name Name of the aria property to get for example "disabled".
		 * @return {String} Aria property value.
		 */
		function getAriaProp(name) {
			var elm = document.getElementById(focussedId);

			if (elm) {
				return elm.getAttribute('aria-' + name);
			}
		}

		/**
		 * Executes the onAction event callback. This is when the user presses enter/space.
		 *
		 * @private
		 */
		function action() {
			var focusElm = getFocusElement();

			if (focusElm && (focusElm.nodeName == "TEXTAREA" || focusElm.type == "text")) {
				return;
			}

			if (settings.onAction) {
				settings.onAction(focussedId);
			} else {
				DomUtils.fire(getFocusElement(), 'click', {keyboard: true});
			}

			return true;
		}

		/**
		 * Cancels the current navigation. The same as pressing the Esc key.
		 *
		 * @method cancel
		 */
		function cancel() {
			var focusElm;

			if (settings.onCancel) {
				if ((focusElm = getFocusElement())) {
					focusElm.blur();
				}

				settings.onCancel();
			} else {
				settings.root.fire('cancel');
			}
		}

		/**
		 * Moves the focus to the next or previous item. It will wrap to start/end if it can't move.
		 *
		 * @method moveFocus
		 * @param {Number} dir Direction for move -1 or 1.
		 */
		function moveFocus(dir) {
			var idx = -1, focusElm, i;
			var visibleItems = [];

			function isVisible(elm) {
				var rootElm = root ? root.getEl() : document.body;

				while (elm && elm != rootElm) {
					if (elm.style.display == 'none') {
						return false;
					}

					elm = elm.parentNode;
				}

				return true;
			}

			initItems();

			// TODO: Optimize this, will be slow on lots of items
			i = visibleItems.length;
			for (i = 0; i < items.length; i++) {
				if (isVisible(items[i])) {
					visibleItems.push(items[i]);
				}
			}

			i = visibleItems.length;
			while (i--) {
				if (visibleItems[i].id === focussedId) {
					idx = i;
					break;
				}
			}

			idx += dir;
			if (idx < 0) {
				idx = visibleItems.length - 1;
			} else if (idx >= visibleItems.length) {
				idx = 0;
			}

			focusElm = visibleItems[idx];
			focusElm.focus();
			focussedId = focusElm.id;

			if (settings.actOnFocus) {
				action();
			}
		}

		/**
		 * Moves focus to the first item or the last focused item if root is a toolbar.
		 *
		 * @method focusFirst
		 * @return {[type]} [description]
		 */
		function focusFirst() {
			var i, rootRole;

			rootRole = getRole(settings.root.getEl());
			initItems();

			i = items.length;
			while (i--) {
				if (rootRole == 'toolbar' && items[i].id === focussedId) {
					items[i].focus();
					return;
				}
			}

			items[0].focus();
		}

		// Handle accessible keys
		root.on('keydown', function(e) {
			var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40;
			var DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32, DOM_VK_TAB = 9;
			var preventDefault;

			switch (e.keyCode) {
				case DOM_VK_LEFT:
					if (enableLeftRight) {
						if (settings.leftAction) {
							settings.leftAction();
						} else {
							moveFocus(-1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_RIGHT:
					if (enableLeftRight) {
						if (getRole() == 'menuitem' && getParentRole() == 'menu') {
							if (getAriaProp('haspopup')) {
								action();
							}
						} else {
							moveFocus(1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_UP:
					if (enableUpDown) {
						moveFocus(-1);
						preventDefault = true;
					}
					break;

				case DOM_VK_DOWN:
					if (enableUpDown) {
						if (getRole() == 'menuitem' && getParentRole() == 'menubar') {
							action();
						} else if (getRole() == 'button' && getAriaProp('haspopup')) {
							action();
						} else {
							moveFocus(1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_TAB:
					preventDefault = true;

					if (e.shiftKey) {
						moveFocus(-1);
					} else {
						moveFocus(1);
					}
					break;

				case DOM_VK_ESCAPE:
					preventDefault = true;
					cancel();
					break;

				case DOM_VK_ENTER:
				case DOM_VK_RETURN:
				case DOM_VK_SPACE:
					preventDefault = action();
					break;
			}

			if (preventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		});

		// Init on focus in
		root.on('focusin', function(e) {
			initItems();
			focussedId = e.target.id;
		});

		return {
			moveFocus: moveFocus,
			focusFirst: focusFirst,
			cancel: cancel
		};
	};
});

// Included from: js/tinymce/classes/ui/Window.js

/**
 * Window.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new window.
 *
 * @-x-less Window.less
 * @class tinymce.ui.Window
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/Window", [
	"tinymce/ui/FloatPanel",
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils",
	"tinymce/ui/KeyboardNavigation",
	"tinymce/ui/DragHelper"
], function(FloatPanel, Panel, DomUtils, KeyboardNavigation, DragHelper) {
	"use strict";

	var Window = FloatPanel.extend({
		modal: true,

		Defaults: {
			border: 1,
			layout: 'flex',
			containerCls: 'panel',
			role: 'dialog',
			callbacks: {
				submit: function() {
					this.fire('submit', {data: this.toJSON()});
				},

				close: function() {
					this.close();
				}
			}
		},

		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			if (self.isRtl()) {
				self.addClass('rtl');
			}

			self.addClass('window');
			self._fixed = true;

			// Create statusbar
			if (settings.buttons) {
				self.statusbar = new Panel({
					layout: 'flex',
					border: '1 0 0 0',
					spacing: 3,
					padding: 10,
					align: 'center',
					pack: self.isRtl() ? 'start' : 'end',
					defaults: {
						type: 'button'
					},
					items: settings.buttons
				});

				self.statusbar.addClass('foot');
				self.statusbar.parent(self);
			}

			self.on('click', function(e) {
				if (e.target.className.indexOf(self.classPrefix + 'close') != -1) {
					self.close();
				}
			});

			self.aria('label', settings.title);
			self._fullscreen = false;
		},

		/**
		 * Recalculates the positions of the controls in the current container.
		 * This is invoked by the reflow method and shouldn't be called directly.
		 *
		 * @method recalc
		 */
		recalc: function() {
			var self = this, statusbar = self.statusbar, layoutRect, width, x, needsRecalc;

			if (self._fullscreen) {
				self.layoutRect(DomUtils.getWindowSize());
				self.layoutRect().contentH = self.layoutRect().innerH;
			}

			self._super();

			layoutRect = self.layoutRect();

			// Resize window based on title width
			if (self.settings.title && !self._fullscreen) {
				width = layoutRect.headerW;
				if (width > layoutRect.w) {
					x = layoutRect.x - Math.max(0, width / 2);
					self.layoutRect({w: width, x: x});
					needsRecalc = true;
				}
			}

			// Resize window based on statusbar width
			if (statusbar) {
				statusbar.layoutRect({w: self.layoutRect().innerW}).recalc();

				width = statusbar.layoutRect().minW + layoutRect.deltaW;
				if (width > layoutRect.w) {
					x = layoutRect.x - Math.max(0, width - layoutRect.w);
					self.layoutRect({w: width, x: x});
					needsRecalc = true;
				}
			}

			// Recalc body and disable auto resize
			if (needsRecalc) {
				self.recalc();
			}
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, layoutRect = self._super(), deltaH = 0, headEl;

			// Reserve vertical space for title
			if (self.settings.title && !self._fullscreen) {
				headEl = self.getEl('head');

				var size = DomUtils.getSize(headEl);

				layoutRect.headerW = size.width;
				layoutRect.headerH = size.height;

				deltaH += layoutRect.headerH;
			}

			// Reserve vertical space for statusbar
			if (self.statusbar) {
				deltaH += self.statusbar.layoutRect().h;
			}

			layoutRect.deltaH += deltaH;
			layoutRect.minH += deltaH;
			//layoutRect.innerH -= deltaH;
			layoutRect.h += deltaH;

			var rect = DomUtils.getWindowSize();

			layoutRect.x = Math.max(0, rect.w / 2 - layoutRect.w / 2);
			layoutRect.y = Math.max(0, rect.h / 2 - layoutRect.h / 2);

			return layoutRect;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, id = self._id, prefix = self.classPrefix;
			var settings = self.settings, headerHtml = '', footerHtml = '', html = settings.html;

			self.preRender();
			layout.preRender(self);

			if (settings.title) {
				headerHtml = (
					'<div id="' + id + '-head" class="' + prefix + 'window-head">' +
						'<div class="' + prefix + 'title">' + self.encode(settings.title) + '</div>' +
						'<button type="button" class="' + prefix + 'close" aria-hidden="true">&times;</button>' +
						'<div id="' + id + '-dragh" class="' + prefix + 'dragh"></div>' +
					'</div>'
				);
			}

			if (settings.url) {
				html = '<iframe src="' + settings.url + '" tabindex="-1"></iframe>';
			}

			if (typeof(html) == "undefined") {
				html = layout.renderHtml(self);
			}

			if (self.statusbar) {
				footerHtml = self.statusbar.renderHtml();
			}

			return (
				'<div id="' + id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					headerHtml +
					'<div id="' + id + '-body" class="' + self.classes('body') + '">' +
						html +
					'</div>' +
					footerHtml +
				'</div>'
			);
		},

		/**
		 * Switches the window fullscreen mode.
		 *
		 * @method fullscreen
		 * @param {Boolean} state True/false state.
		 * @return {tinymce.ui.Window} Current window instance.
		 */
		fullscreen: function(state) {
			var self = this, documentElement = document.documentElement, slowRendering, prefix = self.classPrefix, layoutRect;

			if (state != self._fullscreen) {
				DomUtils.on(window, 'resize', function() {
					var time;

					if (self._fullscreen) {
						// Time the layout time if it's to slow use a timeout to not hog the CPU
						if (!slowRendering) {
							time = new Date().getTime();

							var rect = DomUtils.getWindowSize();
							self.moveTo(0, 0).resizeTo(rect.w, rect.h);

							if ((new Date().getTime()) - time > 50) {
								slowRendering = true;
							}
						} else {
							if (!self._timer) {
								self._timer = setTimeout(function() {
									var rect = DomUtils.getWindowSize();
									self.moveTo(0, 0).resizeTo(rect.w, rect.h);

									self._timer = 0;
								}, 50);
							}
						}
					}
				});

				layoutRect = self.layoutRect();
				self._fullscreen = state;

				if (!state) {
					self._borderBox = self.parseBox(self.settings.border);
					self.getEl('head').style.display = '';
					layoutRect.deltaH += layoutRect.headerH;
					DomUtils.removeClass(documentElement, prefix + 'fullscreen');
					DomUtils.removeClass(document.body, prefix + 'fullscreen');
					self.removeClass('fullscreen');
					self.moveTo(self._initial.x, self._initial.y).resizeTo(self._initial.w, self._initial.h);
				} else {
					self._initial = {x: layoutRect.x, y: layoutRect.y, w: layoutRect.w, h: layoutRect.h};

					self._borderBox = self.parseBox('0');
					self.getEl('head').style.display = 'none';
					layoutRect.deltaH -= layoutRect.headerH + 2;
					DomUtils.addClass(documentElement, prefix + 'fullscreen');
					DomUtils.addClass(document.body, prefix + 'fullscreen');
					self.addClass('fullscreen');

					var rect = DomUtils.getWindowSize();
					self.moveTo(0, 0).resizeTo(rect.w, rect.h);
				}
			}

			return self.reflow();
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, items = [], focusCtrl, autoFocusFound, startPos;

			setTimeout(function() {
				self.addClass('in');
			}, 0);

			self.keyboardNavigation = new KeyboardNavigation({
				root: self,
				enableLeftRight: false,
				enableUpDown: false,
				items: items,
				onCancel: function() {
					self.close();
				}
			});

			self.find('*').each(function(ctrl) {
				if (ctrl.canFocus) {
					autoFocusFound = autoFocusFound || ctrl.settings.autofocus;
					focusCtrl = focusCtrl || ctrl;

					// TODO: Figure out a better way
					if (ctrl.subinput) {
						items.push(ctrl.getEl('inp'));

						if (ctrl.getEl('open')) {
							items.push(ctrl.getEl('open'));
						}
					} else {
						items.push(ctrl.getEl());
					}
				}
			});

			if (self.statusbar) {
				self.statusbar.find('*').each(function(ctrl) {
					if (ctrl.canFocus) {
						autoFocusFound = autoFocusFound || ctrl.settings.autofocus;
						focusCtrl = focusCtrl || ctrl;
						items.push(ctrl.getEl());
					}
				});
			}

			self._super();

			if (self.statusbar) {
				self.statusbar.postRender();
			}

			if (!autoFocusFound && focusCtrl) {
				focusCtrl.focus();
			}

			this.dragHelper = new DragHelper(self._id + '-dragh', {
				start: function() {
					startPos = {
						x: self.layoutRect().x,
						y: self.layoutRect().y
					};
				},

				drag: function(e) {
					self.moveTo(startPos.x + e.deltaX, startPos.y + e.deltaY);
				}
			});

			self.on('submit', function(e) {
				if (!e.isDefaultPrevented()) {
					self.close();
				}
			});
		},

		/**
		 * Fires a submit event with the serialized form.
		 *
		 * @method submit
		 * @return {Object} Event arguments object.
		 */
		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			var self = this, prefix = self.classPrefix;

			self.dragHelper.destroy();
			self._super();

			if (self.statusbar) {
				this.statusbar.remove();
			}

			if (self._fullscreen) {
				DomUtils.removeClass(document.documentElement, prefix + 'fullscreen');
				DomUtils.removeClass(document.body, prefix + 'fullscreen');
			}
		}
	});

	return Window;
});

// Included from: js/tinymce/classes/ui/MessageBox.js

/**
 * MessageBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to create MessageBoxes like alerts/confirms etc.
 *
 * @class tinymce.ui.Window
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/MessageBox", [
	"tinymce/ui/Window"
], function(Window) {
	"use strict";

	var MessageBox = Window.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			settings = {
				border: 1,
				padding: 20,
				layout: 'flex',
				pack: "center",
				align: "center",
				containerCls: 'panel',
				autoScroll: true,
				buttons: {type: "button", text: "Ok", action: "ok"},
				items: {
					type: "label",
					multiline: true,
					maxWidth: 500,
					maxHeight: 200
				}
			};

			this._super(settings);
		},

		Statics: {
			/**
			 * Ok buttons constant.
			 *
			 * @static
			 * @final
			 * @field {Number} OK
			 */
			OK: 1,

			/**
			 * Ok/cancel buttons constant.
			 *
			 * @static
			 * @final
			 * @field {Number} OK_CANCEL
			 */
			OK_CANCEL: 2,

			/**
			 * yes/no buttons constant.
			 *
			 * @static
			 * @final
			 * @field {Number} YES_NO
			 */
			YES_NO: 3,

			/**
			 * yes/no/cancel buttons constant.
			 *
			 * @static
			 * @final
			 * @field {Number} YES_NO_CANCEL
			 */
			YES_NO_CANCEL: 4,

			/**
			 * Constructs a new message box and renders it to the body element.
			 *
			 * @static
			 * @method msgBox
			 * @param {Object} settings Name/value object with settings.
			 */
			msgBox: function(settings) {
				var buttons, callback = settings.callback || function() {};

				switch (settings.buttons) {
					case MessageBox.OK_CANCEL:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
								callback(true);
							}},

							{type: "button", text: "Cancel", onClick: function(e) {
								e.control.parents()[1].close();
								callback(false);
							}}
						];
						break;

					case MessageBox.YES_NO:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
								callback(true);
							}}
						];
						break;

					case MessageBox.YES_NO_CANCEL:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
							}}
						];
						break;

					default:
						buttons = [
							{type: "button", text: "Ok", subtype: "primary", onClick: function(e) {
								e.control.parents()[1].close();
								callback(true);
							}}
						];
						break;
				}

				return new Window({
					padding: 20,
					x: settings.x,
					y: settings.y,
					minWidth: 300,
					minHeight: 100,
					layout: "flex",
					pack: "center",
					align: "center",
					buttons: buttons,
					title: settings.title,
					items: {
						type: "label",
						multiline: true,
						maxWidth: 500,
						maxHeight: 200,
						text: settings.text
					},
					onClose: settings.onClose
				}).renderTo(document.body).reflow();
			},

			/**
			 * Creates a new alert dialog.
			 *
			 * @method alert
			 * @param {Object} settings Settings for the alert dialog.
			 * @param {function} [callback] Callback to execute when the user makes a choice.
			 */
			alert: function(settings, callback) {
				if (typeof(settings) == "string") {
					settings = {text: settings};
				}

				settings.callback = callback;
				return MessageBox.msgBox(settings);
			},

			/**
			 * Creates a new confirm dialog.
			 *
			 * @method confirm
			 * @param {Object} settings Settings for the confirm dialog.
			 * @param {function} [callback] Callback to execute when the user makes a choice.
			 */
			confirm: function(settings, callback) {
				if (typeof(settings) == "string") {
					settings = {text: settings};
				}

				settings.callback = callback;
				settings.buttons = MessageBox.OK_CANCEL;

				return MessageBox.msgBox(settings);
			}
		}
	});

	return MessageBox;
});

// Included from: js/tinymce/classes/WindowManager.js

/**
 * WindowManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
 *
 * @class tinymce.WindowManager
 * @example
 * // Opens a new dialog with the file.htm file and the size 320x240
 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
 * tinymce.activeEditor.windowManager.open({
 *    url: 'file.htm',
 *    width: 320,
 *    height: 240
 * }, {
 *    custom_param: 1
 * });
 *
 * // Displays an alert box using the active editors window manager instance
 * tinymce.activeEditor.windowManager.alert('Hello world!');
 *
 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
 * tinymce.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
 *    if (s)
 *       tinymce.activeEditor.windowManager.alert("Ok");
 *    else
 *       tinymce.activeEditor.windowManager.alert("Cancel");
 * });
 */
define("tinymce/WindowManager", [
	"tinymce/ui/Window",
	"tinymce/ui/MessageBox"
], function(Window, MessageBox) {
	return function(editor) {
		var self = this, windows = [];

		function getTopMostWindow() {
			if (windows.length) {
				return windows[windows.length - 1];
			}
		}

		self.windows = windows;

		/**
		 * Opens a new window.
		 *
		 * @method open
		 * @param {Object} args Optional name/value settings collection contains things like width/height/url etc.
		 * @option {String} title Window title.
		 * @option {String} file URL of the file to open in the window.
		 * @option {Number} width Width in pixels.
		 * @option {Number} height Height in pixels.
		 * @option {Boolean} resizable Specifies whether the popup window is resizable or not.
		 * @option {Boolean} maximizable Specifies whether the popup window has a "maximize" button and can get maximized or not.
		 * @option {String/bool} scrollbars Specifies whether the popup window can have scrollbars if required (i.e. content
		 * larger than the popup size specified).
		 */
		self.open = function(args, params) {
			var win;

			editor.editorManager.activeEditor = editor;

			args.title = args.title || ' ';

			// Handle URL
			args.url = args.url || args.file; // Legacy
			if (args.url) {
				args.width = parseInt(args.width || 320, 10);
				args.height = parseInt(args.height || 240, 10);
			}

			// Handle body
			if (args.body) {
				args.items = {
					defaults: args.defaults,
					type: args.bodyType || 'form',
					items: args.body
				};
			}

			if (!args.url && !args.buttons) {
				args.buttons = [
					{text: 'Ok', subtype: 'primary', onclick: function() {
						win.find('form')[0].submit();
						win.close();
					}},

					{text: 'Cancel', onclick: function() {
						win.close();
					}}
				];
			}

			win = new Window(args);
			windows.push(win);

			win.on('close', function() {
				var i = windows.length;

				while (i--) {
					if (windows[i] === win) {
						windows.splice(i, 1);
					}
				}

				editor.focus();
			});

			// Handle data
			if (args.data) {
				win.on('postRender', function() {
					this.find('*').each(function(ctrl) {
						var name = ctrl.name();

						if (name in args.data) {
							ctrl.value(args.data[name]);
						}
					});
				});
			}

			// store args and parameters
			win.features = args || {};
			win.params = params || {};

			// Takes a snapshot in the FocusManager of the selection before focus is lost to dialog
			editor.nodeChanged();

			return win.renderTo(document.body).reflow();
		};

		/**
		 * Creates a alert dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method alert
		 * @param {String} message Text to display in the new alert dialog.
		 * @param {function} callback Callback function to be executed after the user has selected ok.
		 * @param {Object} scope Optional scope to execute the callback in.
		 * @example
		 * // Displays an alert box using the active editors window manager instance
		 * tinymce.activeEditor.windowManager.alert('Hello world!');
		 */
		self.alert = function(message, callback, scope) {
			MessageBox.alert(message, function() {
				if (callback) {
					callback.call(scope || this);
				}
			});
		};

		/**
		 * Creates a confirm dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @method confirm
		 * @param {String} messageText to display in the new confirm dialog.
		 * @param {function} callback Callback function to be executed after the user has selected ok or cancel.
		 * @param {Object} scope Optional scope to execute the callback in.
		 * @example
		 * // Displays an confirm box and an alert message will be displayed depending on what you choose in the confirm
		 * tinymce.activeEditor.windowManager.confirm("Do you want to do something", function(s) {
		 *    if (s)
		 *       tinymce.activeEditor.windowManager.alert("Ok");
		 *    else
		 *       tinymce.activeEditor.windowManager.alert("Cancel");
		 * });
		 */
		self.confirm = function(message, callback, scope) {
			MessageBox.confirm(message, function(state) {
				callback.call(scope || this, state);
			});
		};

		/**
		 * Closes the top most window.
		 *
		 * @method close
		 */
		self.close = function() {
			if (getTopMostWindow()) {
				getTopMostWindow().close();
			}
		};

		/**
		 * Returns the params of the last window open call. This can be used in iframe based
		 * dialog to get params passed from the tinymce plugin.
		 *
		 * @example
		 * var dialogArguments = top.tinymce.activeEditor.windowManager.getParams();
		 *
		 * @method getParams
		 * @return {Object} Name/value object with parameters passed from windowManager.open call.
		 */
		self.getParams = function() {
			return getTopMostWindow() ? getTopMostWindow().params : null;
		};

		/**
		 * Sets the params of the last opened window.
		 *
		 * @method setParams
		 * @param {Object} params Params object to set for the last opened window.
		 */
		self.setParams = function(params) {
			if (getTopMostWindow()) {
				getTopMostWindow().params = params;
			}
		};
	};
});

// Included from: js/tinymce/classes/util/Quirks.js

/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * @ignore-file
 */

/**
 * This file includes fixes for various browser quirks it's made to make it easy to add/remove browser specific fixes.
 *
 * @class tinymce.util.Quirks
 */
define("tinymce/util/Quirks", [
	"tinymce/util/VK",
	"tinymce/dom/RangeUtils",
	"tinymce/html/Node",
	"tinymce/html/Entities",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(VK, RangeUtils, Node, Entities, Env, Tools) {
	return function(editor) {
		var each = Tools.each;
		var BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection = editor.selection,
			settings = editor.settings, parser = editor.parser, serializer = editor.serializer;
		var isGecko = Env.gecko, isIE = Env.ie, isWebKit = Env.webkit;

		/**
		 * Executes a command with a specific state this can be to enable/disable browser editing features.
		 */
		function setEditorCommandState(cmd, state) {
			try {
				editor.getDoc().execCommand(cmd, false, state);
			} catch (ex) {
				// Ignore
			}
		}

		/**
		 * Returns current IE document mode.
		 */
		function getDocumentMode() {
			var documentMode = editor.getDoc().documentMode;

			return documentMode ? documentMode : 6;
		}

		/**
		 * Returns true/false if the event is prevented or not.
		 *
		 * @private
		 * @param {Event} e Event object.
		 * @return {Boolean} true/false if the event is prevented or not.
		 */
		function isDefaultPrevented(e) {
			return e.isDefaultPrevented();
		}

		/**
		 * Fixes a WebKit bug when deleting contents using backspace or delete key.
		 * WebKit will produce a span element if you delete across two block elements.
		 *
		 * Example:
		 * <h1>a</h1><p>|b</p>
		 *
		 * Will produce this on backspace:
		 * <h1>a<span style="<all runtime styles>">b</span></p>
		 *
		 * This fixes the backspace to produce:
		 * <h1>a|b</p>
		 *
		 * See bug: https://bugs.webkit.org/show_bug.cgi?id=45784
		 *
		 * This fixes the following delete scenarios:
		 *  1. Delete by pressing backspace key.
		 *  2. Delete by pressing delete key.
		 *  3. Delete by pressing backspace key with ctrl/cmd (Word delete).
		 *  4. Delete by pressing delete key with ctrl/cmd (Word delete).
		 *  5. Delete by drag/dropping contents inside the editor.
		 *  6. Delete by using Cut Ctrl+X/Cmd+X.
		 *  7. Delete by selecting contents and writing a character.'
		 *
		 * This code is a ugly hack since writing full custom delete logic for just this bug
		 * fix seemed like a huge task. I hope we can remove this before the year 2030. 
		 */
		function cleanupStylesWhenDeleting() {
			var doc = editor.getDoc();

			if (!window.MutationObserver) {
				return;
			}

			function customDelete(isForward) {
				var mutationObserver = new MutationObserver(function() {});

				Tools.each(editor.getBody().getElementsByTagName('*'), function(elm) {
					// Mark existing spans
					if (elm.tagName == 'SPAN') {
						elm.setAttribute('mce-data-marked', 1);
					}

					// Make sure all elements has a data-mce-style attribute
					if (!elm.hasAttribute('data-mce-style') && elm.hasAttribute('style')) {
						editor.dom.setAttrib(elm, 'style', elm.getAttribute('style'));
					}
				});

				// Observe added nodes and style attribute changes
				mutationObserver.observe(editor.getDoc(), {
					childList: true,
					attributes: true,
					subtree: true,
					attributeFilter: ['style']
				});

				editor.getDoc().execCommand(isForward ? 'ForwardDelete' : 'Delete', false, null);

				var rng = editor.selection.getRng();
				var caretElement = rng.startContainer.parentNode;

				Tools.each(mutationObserver.takeRecords(), function(record) {
					// Restore style attribute to previous value
					if (record.attributeName == "style") {
						var oldValue = record.target.getAttribute('data-mce-style');

						if (oldValue) {
							record.target.setAttribute("style", oldValue);
						} else {
							record.target.removeAttribute("style");
						}
					}

					// Remove all spans that isn't maked and retain selection
					Tools.each(record.addedNodes, function(node) {
						if (node.nodeName == "SPAN" && !node.getAttribute('mce-data-marked')) {
							var offset, container;

							if (node == caretElement) {
								offset = rng.startOffset;
								container = node.firstChild;
							}

							dom.remove(node, true);

							if (container) {
								rng.setStart(container, offset);
								rng.setEnd(container, offset);
								editor.selection.setRng(rng);
							}
						}
					});
				});

				mutationObserver.disconnect();

				// Remove any left over marks
				Tools.each(editor.dom.select('span[mce-data-marked]'), function(span) {
					span.removeAttribute('mce-data-marked');
				});
			}

			editor.on('keydown', function(e) {
				var isForward = e.keyCode == DELETE, isMeta = VK.metaKeyPressed(e);

				if (!isDefaultPrevented(e) && (isForward || e.keyCode == BACKSPACE)) {
					var rng = editor.selection.getRng(), container = rng.startContainer, offset = rng.startOffset;

					// Ignore non meta delete in the where there is text before/after the caret
					if (!isMeta && rng.collapsed && container.nodeType == 3) {
						if (isForward ? offset < container.data.length : offset > 0) {
							return;
						}
					}

					e.preventDefault();

					if (isMeta) {
						editor.selection.getSel().modify("extend", isForward ? "forward" : "backward", "word");
					}

					customDelete(isForward);
				}
			});

			editor.on('keypress', function(e) {
				if (!isDefaultPrevented(e) && !selection.isCollapsed() && e.charCode && !VK.metaKeyPressed(e)) {
					e.preventDefault();
					customDelete(true);
					editor.selection.setContent(String.fromCharCode(e.charCode));
				}
			});

			editor.addCommand('Delete', function() {
				customDelete();
			});

			editor.addCommand('ForwardDelete', function() {
				customDelete(true);
			});

			editor.on('dragstart', function(e) {
				e.dataTransfer.setData('mce-internal', editor.selection.getContent());
			});

			editor.on('drop', function(e) {
				if (!isDefaultPrevented(e)) {
					var internalContent = e.dataTransfer.getData('mce-internal');

					if (internalContent && doc.caretRangeFromPoint) {
						e.preventDefault();
						customDelete();
						editor.selection.setRng(doc.caretRangeFromPoint(e.x, e.y));
						editor.insertContent(internalContent);
					}
				}
			});

			editor.on('cut', function(e) {
				if (!isDefaultPrevented(e) && e.clipboardData) {
					e.preventDefault();
					e.clipboardData.clearData();
					e.clipboardData.setData('text/html', editor.selection.getContent());
					e.clipboardData.setData('text/plain', editor.selection.getContent({format: 'text'}));
					customDelete(true);
				}
			});
		}

		/**
		 * Makes sure that the editor body becomes empty when backspace or delete is pressed in empty editors.
		 *
		 * For example:
		 * <p><b>|</b></p>
		 *
		 * Or:
		 * <h1>|</h1>
		 *
		 * Or:
		 * [<h1></h1>]
		 */
		function emptyEditorWhenDeleting() {
			function serializeRng(rng) {
				var body = dom.create("body");
				var contents = rng.cloneContents();
				body.appendChild(contents);
				return selection.serializer.serialize(body, {format: 'html'});
			}

			function allContentsSelected(rng) {
				if (!rng.setStart) {
					if (rng.item) {
						return false;
					}

					var bodyRng = rng.duplicate();
					bodyRng.moveToElementText(editor.getBody());
					return RangeUtils.compareRanges(rng, bodyRng);
				}

				var selection = serializeRng(rng);

				var allRng = dom.createRng();
				allRng.selectNode(editor.getBody());

				var allSelection = serializeRng(allRng);
				return selection === allSelection;
			}

			editor.on('keydown', function(e) {
				var keyCode = e.keyCode, isCollapsed, body;

				// Empty the editor if it's needed for example backspace at <p><b>|</b></p>
				if (!isDefaultPrevented(e) && (keyCode == DELETE || keyCode == BACKSPACE)) {
					isCollapsed = editor.selection.isCollapsed();
					body = editor.getBody();

					// Selection is collapsed but the editor isn't empty
					if (isCollapsed && !dom.isEmpty(body)) {
						return;
					}

					// Selection isn't collapsed but not all the contents is selected
					if (!isCollapsed && !allContentsSelected(editor.selection.getRng())) {
						return;
					}

					// Manually empty the editor
					e.preventDefault();
					editor.setContent('');

					if (body.firstChild && dom.isBlock(body.firstChild)) {
						editor.selection.setCursorLocation(body.firstChild, 0);
					} else {
						editor.selection.setCursorLocation(body, 0);
					}

					editor.nodeChanged();
				}
			});
		}

		/**
		 * WebKit doesn't select all the nodes in the body when you press Ctrl+A.
		 * IE selects more than the contents <body>[<p>a</p>]</body> instead of <body><p>[a]</p]</body> see bug #6438
		 * This selects the whole body so that backspace/delete logic will delete everything
		 */
		function selectAll() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode == 65 && VK.metaKeyPressed(e)) {
					e.preventDefault();
					editor.execCommand('SelectAll');
				}
			});
		}

		/**
		 * WebKit has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
		 * The IME on Mac doesn't initialize when it doesn't fire a proper focus event.
		 *
		 * This seems to happen when the user manages to click the documentElement element then the window doesn't get proper focus until
		 * you enter a character into the editor.
		 *
		 * It also happens when the first focus in made to the body.
		 *
		 * See: https://bugs.webkit.org/show_bug.cgi?id=83566
		 */
		function inputMethodFocus() {
			if (!editor.settings.content_editable) {
				// Case 1 IME doesn't initialize if you focus the document
				dom.bind(editor.getDoc(), 'focusin', function() {
					selection.setRng(selection.getRng());
				});

				// Case 2 IME doesn't initialize if you click the documentElement it also doesn't properly fire the focusin event
				dom.bind(editor.getDoc(), 'mousedown', function(e) {
					if (e.target == editor.getDoc().documentElement) {
						editor.getBody().focus();
						selection.setRng(selection.getRng());
					}
				});
			}
		}

		/**
		 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
		 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
		 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
		 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
		 * browsers.
		 *
		 * It also fixes a bug on Firefox where it's impossible to delete HR elements.
		 */
		function removeHrOnBackspace() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
					if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
						var node = selection.getNode();
						var previousSibling = node.previousSibling;

						if (node.nodeName == 'HR') {
							dom.remove(node);
							e.preventDefault();
							return;
						}

						if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "hr") {
							dom.remove(previousSibling);
							e.preventDefault();
						}
					}
				}
			});
		}

		/**
		 * Firefox 3.x has an issue where the body element won't get proper focus if you click out
		 * side it's rectangle.
		 */
		function focusBody() {
			// Fix for a focus bug in FF 3.x where the body element
			// wouldn't get proper focus if the user clicked on the HTML element
			if (!window.Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
				editor.on('mousedown', function(e) {
					if (!isDefaultPrevented(e) && e.target.nodeName === "HTML") {
						var body = editor.getBody();

						// Blur the body it's focused but not correctly focused
						body.blur();

						// Refocus the body after a little while
						setTimeout(function() {
							body.focus();
						}, 0);
					}
				});
			}
		}

		/**
		 * WebKit has a bug where it isn't possible to select image, hr or anchor elements
		 * by clicking on them so we need to fake that.
		 */
		function selectControlElements() {
			editor.on('click', function(e) {
				e = e.target;

				// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
				// WebKit can't even do simple things like selecting an image
				// Needs tobe the setBaseAndExtend or it will fail to select floated images
				if (/^(IMG|HR)$/.test(e.nodeName)) {
					selection.getSel().setBaseAndExtent(e, 0, e, 1);
				}

				if (e.nodeName == 'A' && dom.hasClass(e, 'mce-item-anchor')) {
					selection.select(e);
				}

				editor.nodeChanged();
			});
		}

		/**
		 * Fixes a Gecko bug where the style attribute gets added to the wrong element when deleting between two block elements.
		 *
		 * Fixes do backspace/delete on this:
		 * <p>bla[ck</p><p style="color:red">r]ed</p>
		 *
		 * Would become:
		 * <p>bla|ed</p>
		 *
		 * Instead of:
		 * <p style="color:red">bla|ed</p>
		 */
		function removeStylesWhenDeletingAcrossBlockElements() {
			function getAttributeApplyFunction() {
				var template = dom.getAttribs(selection.getStart().cloneNode(false));

				return function() {
					var target = selection.getStart();

					if (target !== editor.getBody()) {
						dom.setAttrib(target, "style", null);

						each(template, function(attr) {
							target.setAttributeNode(attr.cloneNode(true));
						});
					}
				};
			}

			function isSelectionAcrossElements() {
				return !selection.isCollapsed() &&
					dom.getParent(selection.getStart(), dom.isBlock) != dom.getParent(selection.getEnd(), dom.isBlock);
			}

			editor.on('keypress', function(e) {
				var applyAttributes;

				if (!isDefaultPrevented(e) && (e.keyCode == 8 || e.keyCode == 46) && isSelectionAcrossElements()) {
					applyAttributes = getAttributeApplyFunction();
					editor.getDoc().execCommand('delete', false, null);
					applyAttributes();
					e.preventDefault();
					return false;
				}
			});

			dom.bind(editor.getDoc(), 'cut', function(e) {
				var applyAttributes;

				if (!isDefaultPrevented(e) && isSelectionAcrossElements()) {
					applyAttributes = getAttributeApplyFunction();

					setTimeout(function() {
						applyAttributes();
					}, 0);
				}
			});
		}

		/**
		 * Fire a nodeChanged when the selection is changed on WebKit this fixes selection issues on iOS5. It only fires the nodeChange
		 * event every 50ms since it would other wise update the UI when you type and it hogs the CPU.
		 */
		function selectionChangeNodeChanged() {
			var lastRng, selectionTimer;

			editor.on('selectionchange', function() {
				if (selectionTimer) {
					clearTimeout(selectionTimer);
					selectionTimer = 0;
				}

				selectionTimer = window.setTimeout(function() {
					var rng = selection.getRng();

					// Compare the ranges to see if it was a real change or not
					if (!lastRng || !RangeUtils.compareRanges(rng, lastRng)) {
						editor.nodeChanged();
						lastRng = rng;
					}
				}, 50);
			});
		}

		/**
		 * Screen readers on IE needs to have the role application set on the body.
		 */
		function ensureBodyHasRoleApplication() {
			document.body.setAttribute("role", "application");
		}

		/**
		 * Backspacing into a table behaves differently depending upon browser type.
		 * Therefore, disable Backspace when cursor immediately follows a table.
		 */
		function disableBackspaceIntoATable() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
					if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
						var previousSibling = selection.getNode().previousSibling;
						if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "table") {
							e.preventDefault();
							return false;
						}
					}
				}
			});
		}

		/**
		 * Old IE versions can't properly render BR elements in PRE tags white in contentEditable mode. So this
		 * logic adds a \n before the BR so that it will get rendered.
		 */
		function addNewLinesBeforeBrInPre() {
			// IE8+ rendering mode does the right thing with BR in PRE
			if (getDocumentMode() > 7) {
				return;
			}

			// Enable display: none in area and add a specific class that hides all BR elements in PRE to
			// avoid the caret from getting stuck at the BR elements while pressing the right arrow key
			setEditorCommandState('RespectVisibilityInDesign', true);
			editor.contentStyles.push('.mceHideBrInPre pre br {display: none}');
			dom.addClass(editor.getBody(), 'mceHideBrInPre');

			// Adds a \n before all BR elements in PRE to get them visual
			parser.addNodeFilter('pre', function(nodes) {
				var i = nodes.length, brNodes, j, brElm, sibling;

				while (i--) {
					brNodes = nodes[i].getAll('br');
					j = brNodes.length;
					while (j--) {
						brElm = brNodes[j];

						// Add \n before BR in PRE elements on older IE:s so the new lines get rendered
						sibling = brElm.prev;
						if (sibling && sibling.type === 3 && sibling.value.charAt(sibling.value - 1) != '\n') {
							sibling.value += '\n';
						} else {
							brElm.parent.insert(new Node('#text', 3), brElm, true).value = '\n';
						}
					}
				}
			});

			// Removes any \n before BR elements in PRE since other browsers and in contentEditable=false mode they will be visible
			serializer.addNodeFilter('pre', function(nodes) {
				var i = nodes.length, brNodes, j, brElm, sibling;

				while (i--) {
					brNodes = nodes[i].getAll('br');
					j = brNodes.length;
					while (j--) {
						brElm = brNodes[j];
						sibling = brElm.prev;
						if (sibling && sibling.type == 3) {
							sibling.value = sibling.value.replace(/\r?\n$/, '');
						}
					}
				}
			});
		}

		/**
		 * Moves style width/height to attribute width/height when the user resizes an image on IE.
		 */
		function removePreSerializedStylesWhenSelectingControls() {
			dom.bind(editor.getBody(), 'mouseup', function() {
				var value, node = selection.getNode();

				// Moved styles to attributes on IMG eements
				if (node.nodeName == 'IMG') {
					// Convert style width to width attribute
					if ((value = dom.getStyle(node, 'width'))) {
						dom.setAttrib(node, 'width', value.replace(/[^0-9%]+/g, ''));
						dom.setStyle(node, 'width', '');
					}

					// Convert style height to height attribute
					if ((value = dom.getStyle(node, 'height'))) {
						dom.setAttrib(node, 'height', value.replace(/[^0-9%]+/g, ''));
						dom.setStyle(node, 'height', '');
					}
				}
			});
		}

		/**
		 * Removes a blockquote when backspace is pressed at the beginning of it.
		 *
		 * For example:
		 * <blockquote><p>|x</p></blockquote>
		 *
		 * Becomes:
		 * <p>|x</p>
		 */
		function removeBlockQuoteOnBackSpace() {
			// Add block quote deletion handler
			editor.on('keydown', function(e) {
				var rng, container, offset, root, parent;

				if (isDefaultPrevented(e) || e.keyCode != VK.BACKSPACE) {
					return;
				}

				rng = selection.getRng();
				container = rng.startContainer;
				offset = rng.startOffset;
				root = dom.getRoot();
				parent = container;

				if (!rng.collapsed || offset !== 0) {
					return;
				}

				while (parent && parent.parentNode && parent.parentNode.firstChild == parent && parent.parentNode != root) {
					parent = parent.parentNode;
				}

				// Is the cursor at the beginning of a blockquote?
				if (parent.tagName === 'BLOCKQUOTE') {
					// Remove the blockquote
					editor.formatter.toggle('blockquote', null, parent);

					// Move the caret to the beginning of container
					rng = dom.createRng();
					rng.setStart(container, 0);
					rng.setEnd(container, 0);
					selection.setRng(rng);
				}
			});
		}

		/**
		 * Sets various Gecko editing options on mouse down and before a execCommand to disable inline table editing that is broken etc.
		 */
		function setGeckoEditingOptions() {
			function setOpts() {
				editor._refreshContentEditable();

				setEditorCommandState("StyleWithCSS", false);
				setEditorCommandState("enableInlineTableEditing", false);

				if (!settings.object_resizing) {
					setEditorCommandState("enableObjectResizing", false);
				}
			}

			if (!settings.readonly) {
				editor.on('BeforeExecCommand MouseDown', setOpts);
			}
		}

		/**
		 * Fixes a gecko link bug, when a link is placed at the end of block elements there is
		 * no way to move the caret behind the link. This fix adds a bogus br element after the link.
		 *
		 * For example this:
		 * <p><b><a href="#">x</a></b></p>
		 *
		 * Becomes this:
		 * <p><b><a href="#">x</a></b><br></p>
		 */
		function addBrAfterLastLinks() {
			function fixLinks() {
				each(dom.select('a'), function(node) {
					var parentNode = node.parentNode, root = dom.getRoot();

					if (parentNode.lastChild === node) {
						while (parentNode && !dom.isBlock(parentNode)) {
							if (parentNode.parentNode.lastChild !== parentNode || parentNode === root) {
								return;
							}

							parentNode = parentNode.parentNode;
						}

						dom.add(parentNode, 'br', {'data-mce-bogus': 1});
					}
				});
			}

			editor.on('SetContent ExecCommand', function(e) {
				if (e.type == "setcontent" || e.command === 'mceInsertLink') {
					fixLinks();
				}
			});
		}

		/**
		 * WebKit will produce DIV elements here and there by default. But since TinyMCE uses paragraphs by
		 * default we want to change that behavior.
		 */
		function setDefaultBlockType() {
			if (settings.forced_root_block) {
				editor.on('init', function() {
					setEditorCommandState('DefaultParagraphSeparator', settings.forced_root_block);
				});
			}
		}

		/**
		 * Removes ghost selections from images/tables on Gecko.
		 */
		function removeGhostSelection() {
			editor.on('Undo Redo SetContent', function(e) {
				if (!e.initial) {
					editor.execCommand('mceRepaint');
				}
			});
		}

		/**
		 * Deletes the selected image on IE instead of navigating to previous page.
		 */
		function deleteControlItemOnBackSpace() {
			editor.on('keydown', function(e) {
				var rng;

				if (!isDefaultPrevented(e) && e.keyCode == BACKSPACE) {
					rng = editor.getDoc().selection.createRange();
					if (rng && rng.item) {
						e.preventDefault();
						editor.undoManager.beforeChange();
						dom.remove(rng.item(0));
						editor.undoManager.add();
					}
				}
			});
		}

		/**
		 * IE10 doesn't properly render block elements with the right height until you add contents to them.
		 * This fixes that by adding a padding-right to all empty text block elements.
		 * See: https://connect.microsoft.com/IE/feedback/details/743881
		 */
		function renderEmptyBlocksFix() {
			var emptyBlocksCSS;

			// IE10+
			if (getDocumentMode() >= 10) {
				emptyBlocksCSS = '';
				each('p div h1 h2 h3 h4 h5 h6'.split(' '), function(name, i) {
					emptyBlocksCSS += (i > 0 ? ',' : '') + name + ':empty';
				});

				editor.contentStyles.push(emptyBlocksCSS + '{padding-right: 1px !important}');
			}
		}

		/**
		 * Old IE versions can't retain contents within noscript elements so this logic will store the contents
		 * as a attribute and the insert that value as it's raw text when the DOM is serialized.
		 */
		function keepNoScriptContents() {
			if (getDocumentMode() < 9) {
				parser.addNodeFilter('noscript', function(nodes) {
					var i = nodes.length, node, textNode;

					while (i--) {
						node = nodes[i];
						textNode = node.firstChild;

						if (textNode) {
							node.attr('data-mce-innertext', textNode.value);
						}
					}
				});

				serializer.addNodeFilter('noscript', function(nodes) {
					var i = nodes.length, node, textNode, value;

					while (i--) {
						node = nodes[i];
						textNode = nodes[i].firstChild;

						if (textNode) {
							textNode.value = Entities.decode(textNode.value);
						} else {
							// Old IE can't retain noscript value so an attribute is used to store it
							value = node.attributes.map['data-mce-innertext'];
							if (value) {
								node.attr('data-mce-innertext', null);
								textNode = new Node('#text', 3);
								textNode.value = value;
								textNode.raw = true;
								node.append(textNode);
							}
						}
					}
				});
			}
		}

		/**
		 * IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode.
		 */
		function fixCaretSelectionOfDocumentElementOnIe() {
			var doc = dom.doc, body = doc.body, started, startRng, htmlElm;

			// Return range from point or null if it failed
			function rngFromPoint(x, y) {
				var rng = body.createTextRange();

				try {
					rng.moveToPoint(x, y);
				} catch (ex) {
					// IE sometimes throws and exception, so lets just ignore it
					rng = null;
				}

				return rng;
			}

			// Fires while the selection is changing
			function selectionChange(e) {
				var pointRng;

				// Check if the button is down or not
				if (e.button) {
					// Create range from mouse position
					pointRng = rngFromPoint(e.x, e.y);

					if (pointRng) {
						// Check if pointRange is before/after selection then change the endPoint
						if (pointRng.compareEndPoints('StartToStart', startRng) > 0) {
							pointRng.setEndPoint('StartToStart', startRng);
						} else {
							pointRng.setEndPoint('EndToEnd', startRng);
						}

						pointRng.select();
					}
				} else {
					endSelection();
				}
			}

			// Removes listeners
			function endSelection() {
				var rng = doc.selection.createRange();

				// If the range is collapsed then use the last start range
				if (startRng && !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0) {
					startRng.select();
				}

				dom.unbind(doc, 'mouseup', endSelection);
				dom.unbind(doc, 'mousemove', selectionChange);
				startRng = started = 0;
			}

			// Make HTML element unselectable since we are going to handle selection by hand
			doc.documentElement.unselectable = true;

			// Detect when user selects outside BODY
			dom.bind(doc, 'mousedown contextmenu', function(e) {
				if (e.target.nodeName === 'HTML') {
					if (started) {
						endSelection();
					}

					// Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
					htmlElm = doc.documentElement;
					if (htmlElm.scrollHeight > htmlElm.clientHeight) {
						return;
					}

					started = 1;
					// Setup start position
					startRng = rngFromPoint(e.x, e.y);
					if (startRng) {
						// Listen for selection change events
						dom.bind(doc, 'mouseup', endSelection);
						dom.bind(doc, 'mousemove', selectionChange);

						dom.win.focus();
						startRng.select();
					}
				}
			});
		}

		/**
		 * Fixes selection issues on Gecko where the caret can be placed between two inline elements like <b>a</b>|<b>b</b>
		 * this fix will lean the caret right into the closest inline element.
		 */
		function normalizeSelection() {
			// Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i> except for Ctrl+A since it selects everything
			editor.on('keyup focusin', function(e) {
				if (e.keyCode != 65 || !VK.metaKeyPressed(e)) {
					selection.normalize();
				}
			});
		}

		/**
		 * Forces Gecko to render a broken image icon if it fails to load an image.
		 */
		function showBrokenImageIcon() {
			editor.contentStyles.push(
				'img:-moz-broken {' +
					'-moz-force-broken-image-icon:1;' +
					'min-width:24px;' +
					'min-height:24px' +
				'}'
			);
		}

		/**
		 * iOS has a bug where it's impossible to type if the document has a touchstart event
		 * bound and the user touches the document while having the on screen keyboard visible.
		 *
		 * The touch event moves the focus to the parent document while having the caret inside the iframe
		 * this fix moves the focus back into the iframe document.
		 */
		function restoreFocusOnKeyDown() {
			if (!editor.inline) {
				editor.on('keydown', function() {
					if (document.activeElement == document.body) {
						editor.getWin().focus();
					}
				});
			}
		}

		/**
		 * IE 11 has an annoying issue where you can't move focus into the editor
		 * by clicking on the white area HTML element. We used to be able to to fix this with
		 * the fixCaretSelectionOfDocumentElementOnIe fix. But since M$ removed the selection
		 * object it's not possible anymore. So we need to hack in a ungly CSS to force the
		 * body to be at least 150px. If the user clicks the HTML element out side this 150px region
		 * we simply move the focus into the first paragraph. Not ideal since you loose the
		 * positioning of the caret but goot enough for most cases.
		 */
		function bodyHeight() {
			if (!editor.inline) {
				editor.contentStyles.push('body {min-height: 150px}');
				editor.on('click', function(e) {
					if (e.target.nodeName == 'HTML') {
						editor.execCommand('SelectAll');
						editor.selection.collapse(true);
						editor.nodeChanged();
					}
				});
			}
		}

		/**
		 * Firefox on Mac OS will move the browser back to the previous page if you press CMD+Left arrow.
		 * You might then loose all your work so we need to block that behavior and replace it with our own.
		 */
		function blockCmdArrowNavigation() {
			if (Env.mac) {
				editor.on('keydown', function(e) {
					if (VK.metaKeyPressed(e) && (e.keyCode == 37 || e.keyCode == 39)) {
						e.preventDefault();
						editor.selection.getSel().modify('move', e.keyCode == 37 ? 'backward' : 'forward', 'word');
					}
				});
			}
		}

		/**
		 * Disables the autolinking in IE 9+ this is then re-enabled by the autolink plugin.
		 */
		function disableAutoUrlDetect() {
			setEditorCommandState("AutoUrlDetect", false);
		}

		// All browsers
		disableBackspaceIntoATable();
		removeBlockQuoteOnBackSpace();
		emptyEditorWhenDeleting();
		normalizeSelection();

		// WebKit
		if (isWebKit) {
			cleanupStylesWhenDeleting();
			inputMethodFocus();
			selectControlElements();
			setDefaultBlockType();

			// iOS
			if (Env.iOS) {
				selectionChangeNodeChanged();
				restoreFocusOnKeyDown();
				bodyHeight();
			} else {
				selectAll();
			}
		}

		// IE
		if (isIE && Env.ie < 11) {
			removeHrOnBackspace();
			ensureBodyHasRoleApplication();
			addNewLinesBeforeBrInPre();
			removePreSerializedStylesWhenSelectingControls();
			deleteControlItemOnBackSpace();
			renderEmptyBlocksFix();
			keepNoScriptContents();
			fixCaretSelectionOfDocumentElementOnIe();
		}

		if (Env.ie >= 11) {
			bodyHeight();
		}

		if (Env.ie) {
			selectAll();
			disableAutoUrlDetect();
		}

		// Gecko
		if (isGecko) {
			removeHrOnBackspace();
			focusBody();
			removeStylesWhenDeletingAcrossBlockElements();
			setGeckoEditingOptions();
			addBrAfterLastLinks();
			removeGhostSelection();
			showBrokenImageIcon();
			blockCmdArrowNavigation();
		}
	};
});

// Included from: js/tinymce/classes/util/Observable.js

/**
 * Observable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin will add event binding logic to classes.
 *
 * @mixin tinymce.util.Observable
 */
define("tinymce/util/Observable", [
	"tinymce/util/Tools"
], function(Tools) {
	var bindingsName = "__bindings";
	var nativeEvents = Tools.makeMap(
		"focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange" +
		" mouseout mouseenter mouseleave keydown keypress keyup contextmenu dragstart dragend dragover draggesture dragdrop drop drag", ' '
	);

	function returnFalse() {
		return false;
	}

	function returnTrue() {
		return true;
	}

	return {
		/**
		 * Fires the specified event by name.
		 *
		 * @method fire
		 * @param {String} name Name of the event to fire.
		 * @param {tinymce.Event/Object?} args Event arguments.
		 * @param {Boolean?} bubble True/false if the event is to be bubbled.
		 * @return {tinymce.Event} Event instance passed in converted into tinymce.Event instance.
		 * @example
		 * instance.fire('event', {...});
		 */
		fire: function(name, args, bubble) {
			var self = this, handlers, i, l, callback, parent;

			name = name.toLowerCase();
			args = args || {};
			args.type = name;

			// Setup target is there isn't one
			if (!args.target) {
				args.target = self;
			}

			// Add event delegation methods if they are missing
			if (!args.preventDefault) {
				// Add preventDefault method
				args.preventDefault = function() {
					args.isDefaultPrevented = returnTrue;
				};

				// Add stopPropagation
				args.stopPropagation = function() {
					args.isPropagationStopped = returnTrue;
				};

				// Add stopImmediatePropagation
				args.stopImmediatePropagation = function() {
					args.isImmediatePropagationStopped = returnTrue;
				};

				// Add event delegation states
				args.isDefaultPrevented = returnFalse;
				args.isPropagationStopped = returnFalse;
				args.isImmediatePropagationStopped = returnFalse;
			}

			//console.log(name, args);

			if (self[bindingsName]) {
				handlers = self[bindingsName][name];

				if (handlers) {
					for (i = 0, l = handlers.length; i < l; i++) {
						handlers[i] = callback = handlers[i];

						// Stop immediate propagation if needed
						if (args.isImmediatePropagationStopped()) {
							break;
						}

						// If callback returns false then prevent default and stop all propagation
						if (callback.call(self, args) === false) {
							args.preventDefault();
							return args;
						}
					}
				}
			}

			// Bubble event up to parents
			if (bubble !== false && self.parent) {
				parent = self.parent();
				while (parent && !args.isPropagationStopped()) {
					parent.fire(name, args, false);
					parent = parent.parent();
				}
			}

			return args;
		},

		/**
		 * Binds an event listener to a specific event by name.
		 *
		 * @method on
		 * @param {String} name Event name or space separated list of events to bind.
		 * @param {callback} callback Callback to be executed when the event occurs.
		 * @return {Object} Current class instance.
		 * @example
		 * instance.on('event', function(e) {
		 *     // Callback logic
		 * });
		 */
		on: function(name, callback) {
			var self = this, bindings, handlers, names, i;

			if (callback === false) {
				callback = function() {
					return false;
				};
			}

			if (callback) {
				names = name.toLowerCase().split(' ');
				i = names.length;
				while (i--) {
					name = names[i];

					bindings = self[bindingsName];
					if (!bindings) {
						bindings = self[bindingsName] = {};
					}

					handlers = bindings[name];
					if (!handlers) {
						handlers = bindings[name] = [];
						if (self.bindNative && nativeEvents[name]) {
							self.bindNative(name);
						}
					}

					handlers.push(callback);
				}
			}

			return self;
		},

		/**
		 * Unbinds an event listener to a specific event by name.
		 *
		 * @method off
		 * @param {String?} name Name of the event to unbind.
		 * @param {callback?} callback Callback to unbind.
		 * @return {Object} Current class instance.
		 * @example
		 * // Unbind specific callback
		 * instance.off('event', handler);
		 *
		 * // Unbind all listeners by name
		 * instance.off('event');
		 *
		 * // Unbind all events
		 * instance.off();
		 */
		off: function(name, callback) {
			var self = this, i, bindings = self[bindingsName], handlers, bindingName, names, hi;

			if (bindings) {
				if (name) {
					names = name.toLowerCase().split(' ');
					i = names.length;
					while (i--) {
						name = names[i];
						handlers = bindings[name];

						// Unbind all handlers
						if (!name) {
							for (bindingName in bindings) {
								bindings[name].length = 0;
							}

							return self;
						}

						if (handlers) {
							// Unbind all by name
							if (!callback) {
								handlers.length = 0;
							} else {
								// Unbind specific ones
								hi = handlers.length;
								while (hi--) {
									if (handlers[hi] === callback) {
										handlers.splice(hi, 1);
									}
								}
							}

							if (!handlers.length && self.unbindNative && nativeEvents[name]) {
								self.unbindNative(name);
								delete bindings[name];
							}
						}
					}
				} else {
					if (self.unbindNative) {
						for (name in bindings) {
							self.unbindNative(name);
						}
					}

					self[bindingsName] = [];
				}
			}

			return self;
		},

		hasEventListeners: function(name) {
			var bindings = this[bindingsName];

			name = name.toLowerCase();

			return !(!bindings || !bindings[name] || bindings[name].length === 0);
		}
	};
});

// Included from: js/tinymce/classes/Shortcuts.js

/**
 * Shortcuts.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains all logic for handling of keyboard shortcuts.
 */
define("tinymce/Shortcuts", [
	"tinymce/util/Tools",
	"tinymce/Env"
], function(Tools, Env) {
	var each = Tools.each, explode = Tools.explode;

	var keyCodeLookup = {
		"f9": 120,
		"f10": 121,
		"f11": 122
	};

	return function(editor) {
		var self = this, shortcuts = {};

		editor.on('keyup keypress keydown', function(e) {
			if (e.altKey || e.ctrlKey || e.metaKey) {
				each(shortcuts, function(shortcut) {
					var ctrlKey = Env.mac ? e.metaKey : e.ctrlKey;

					if (shortcut.ctrl != ctrlKey || shortcut.alt != e.altKey || shortcut.shift != e.shiftKey) {
						return;
					}

					if (e.keyCode == shortcut.keyCode || (e.charCode && e.charCode == shortcut.charCode)) {
						e.preventDefault();

						if (e.type == "keydown") {
							shortcut.func.call(shortcut.scope);
						}

						return true;
					}
				});
			}
		});

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		self.add = function(pattern, desc, cmdFunc, scope) {
			var cmd;

			cmd = cmdFunc;

			if (typeof(cmdFunc) === 'string') {
				cmdFunc = function() {
					editor.execCommand(cmd, false, null);
				};
			} else if (Tools.isArray(cmd)) {
				cmdFunc = function() {
					editor.execCommand(cmd[0], cmd[1], cmd[2]);
				};
			}

			each(explode(pattern.toLowerCase()), function(pattern) {
				var shortcut = {
					func: cmdFunc,
					scope: scope || editor,
					desc: editor.translate(desc),
					alt: false,
					ctrl: false,
					shift: false
				};

				each(explode(pattern, '+'), function(value) {
					switch (value) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							shortcut[value] = true;
							break;

						default:
							shortcut.charCode = value.charCodeAt(0);
							shortcut.keyCode = keyCodeLookup[value] || value.toUpperCase().charCodeAt(0);
					}
				});

				shortcuts[
					(shortcut.ctrl ? 'ctrl' : '') + ',' +
					(shortcut.alt ? 'alt' : '') + ',' +
					(shortcut.shift ? 'shift' : '') + ',' +
					shortcut.keyCode
				] = shortcut;
			});

			return true;
		};
	};
});

// Included from: js/tinymce/classes/Editor.js

/**
 * Editor.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * Include the base event class documentation.
 *
 * @include ../../../tools/docs/tinymce.Event.js
 */

/**
 * This class contains the core logic for a TinyMCE editor.
 *
 * @class tinymce.Editor
 * @mixes tinymce.util.Observable
 * @example
 * // Add a class to all paragraphs in the editor.
 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
 *
 * // Gets the current editors selection as text
 * tinymce.activeEditor.selection.getContent({format: 'text'});
 *
 * // Creates a new editor instance
 * var ed = new tinymce.Editor('textareaid', {
 *     some_setting: 1
 * }, tinymce.EditorManager);
 *
 * // Select each item the user clicks on
 * ed.on('click', function(e) {
 *     ed.selection.select(e.target);
 * });
 *
 * ed.render();
 */
define("tinymce/Editor", [
	"tinymce/dom/DOMUtils",
	"tinymce/AddOnManager",
	"tinymce/html/Node",
	"tinymce/dom/Serializer",
	"tinymce/html/Serializer",
	"tinymce/dom/Selection",
	"tinymce/Formatter",
	"tinymce/UndoManager",
	"tinymce/EnterKey",
	"tinymce/ForceBlocks",
	"tinymce/EditorCommands",
	"tinymce/util/URI",
	"tinymce/dom/ScriptLoader",
	"tinymce/dom/EventUtils",
	"tinymce/WindowManager",
	"tinymce/html/Schema",
	"tinymce/html/DomParser",
	"tinymce/util/Quirks",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/util/Observable",
	"tinymce/Shortcuts"
], function(
	DOMUtils, AddOnManager, Node, DomSerializer, Serializer,
	Selection, Formatter, UndoManager, EnterKey, ForceBlocks, EditorCommands,
	URI, ScriptLoader, EventUtils, WindowManager,
	Schema, DomParser, Quirks, Env, Tools, Observable, Shortcuts
) {
	// Shorten these names
	var DOM = DOMUtils.DOM, ThemeManager = AddOnManager.ThemeManager, PluginManager = AddOnManager.PluginManager;
	var extend = Tools.extend, each = Tools.each, explode = Tools.explode;
	var inArray = Tools.inArray, trim = Tools.trim, resolve = Tools.resolve;
	var Event = EventUtils.Event;
	var isGecko = Env.gecko, ie = Env.ie;

	function getEventTarget(editor, eventName) {
		if (eventName == 'selectionchange') {
			return editor.getDoc();
		}

		// Need to bind mousedown/mouseup etc to document not body in iframe mode
		// Since the user might click on the HTML element not the BODY
		if (!editor.inline && /^mouse|click|contextmenu|drop/.test(eventName)) {
			return editor.getDoc();
		}

		return editor.getBody();
	}

	/**
	 * Include documentation for all the events.
	 *
	 * @include ../../../tools/docs/tinymce.Editor.js
	 */

	/**
	 * Constructs a editor instance by id.
	 *
	 * @constructor
	 * @method Editor
	 * @param {String} id Unique id for the editor.
	 * @param {Object} settings Settings for the editor.
	 * @param {tinymce.EditorManager} editorManager EditorManager instance.
	 * @author Moxiecode
	 */
	function Editor(id, settings, editorManager) {
		var self = this, documentBaseUrl, baseUri;

		documentBaseUrl = self.documentBaseUrl = editorManager.documentBaseURL;
		baseUri = editorManager.baseURI;

		/**
		 * Name/value collection with editor settings.
		 *
		 * @property settings
		 * @type Object
		 * @example
		 * // Get the value of the theme setting
		 * tinymce.activeEditor.windowManager.alert("You are using the " + tinymce.activeEditor.settings.theme + " theme");
		 */
		self.settings = settings = extend({
			id: id,
			theme: 'modern',
			delta_width: 0,
			delta_height: 0,
			popup_css: '',
			plugins: '',
			document_base_url: documentBaseUrl,
			add_form_submit_trigger: true,
			submit_patch: true,
			add_unload_trigger: true,
			convert_urls: true,
			relative_urls: true,
			remove_script_host: true,
			object_resizing: true,
			doctype: '<!DOCTYPE html>',
			visual: true,
			font_size_style_values: 'xx-small,x-small,small,medium,large,x-large,xx-large',

			// See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
			font_size_legacy_values: 'xx-small,small,medium,large,x-large,xx-large,300%',
			forced_root_block: 'p',
			hidden_input: true,
			padd_empty_editor: true,
			render_ui: true,
			indentation: '30px',
			inline_styles: true,
			convert_fonts_to_spans: true,
			indent: 'simple',
			indent_before: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,' +
				'tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
			indent_after: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,' +
				'tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
			validate: true,
			entity_encoding: 'named',
			url_converter: self.convertURL,
			url_converter_scope: self,
			ie7_compat: true
		}, settings);

		AddOnManager.language = settings.language || 'en';
		AddOnManager.languageLoad = settings.language_load;

		AddOnManager.baseURL = editorManager.baseURL;

		/**
		 * Editor instance id, normally the same as the div/textarea that was replaced.
		 *
		 * @property id
		 * @type String
		 */
		self.id = settings.id = id;

		/**
		 * State to force the editor to return false on a isDirty call.
		 *
		 * @property isNotDirty
		 * @type Boolean
		 * @example
		 * function ajaxSave() {
		 *     var ed = tinymce.get('elm1');
		 *
		 *     // Save contents using some XHR call
		 *     alert(ed.getContent());
		 *
		 *     ed.isNotDirty = true; // Force not dirty state
		 * }
		 */
		self.isNotDirty = true;

		/**
		 * Name/Value object containting plugin instances.
		 *
		 * @property plugins
		 * @type Object
		 * @example
		 * // Execute a method inside a plugin directly
		 * tinymce.activeEditor.plugins.someplugin.someMethod();
		 */
		self.plugins = {};

		/**
		 * URI object to document configured for the TinyMCE instance.
		 *
		 * @property documentBaseURI
		 * @type tinymce.util.URI
		 * @example
		 * // Get relative URL from the location of document_base_url
		 * tinymce.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
		 *
		 * // Get absolute URL from the location of document_base_url
		 * tinymce.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
		 */
		self.documentBaseURI = new URI(settings.document_base_url || documentBaseUrl, {
			base_uri: baseUri
		});

		/**
		 * URI object to current document that holds the TinyMCE editor instance.
		 *
		 * @property baseURI
		 * @type tinymce.util.URI
		 * @example
		 * // Get relative URL from the location of the API
		 * tinymce.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
		 *
		 * // Get absolute URL from the location of the API
		 * tinymce.activeEditor.baseURI.toAbsolute('somefile.htm');
		 */
		self.baseURI = baseUri;

		/**
		 * Array with CSS files to load into the iframe.
		 *
		 * @property contentCSS
		 * @type Array
		 */
		self.contentCSS = [];

		/**
		 * Array of CSS styles to add to head of document when the editor loads.
		 *
		 * @property contentStyles
		 * @type Array
		 */
		self.contentStyles = [];

		// Creates all events like onClick, onSetContent etc see Editor.Events.js for the actual logic
		self.shortcuts = new Shortcuts(self);

		// Internal command handler objects
		self.execCommands = {};
		self.queryStateCommands = {};
		self.queryValueCommands = {};
		self.loadedCSS = {};

		self.suffix = editorManager.suffix;
		self.editorManager = editorManager;
		self.inline = settings.inline;

		// Call setup
		editorManager.fire('SetupEditor', self);
		self.execCallback('setup', self);
	}

	Editor.prototype = {
		/**
		 * Renderes the editor/adds it to the page.
		 *
		 * @method render
		 */
		render: function() {
			var self = this, settings = self.settings, id = self.id, suffix = self.suffix;

			function readyHandler() {
				DOM.unbind(window, 'ready', readyHandler);
				self.render();
			}

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				DOM.bind(window, 'ready', readyHandler);
				return;
			}

			// Element not found, then skip initialization
			if (!self.getElement()) {
				return;
			}

			// No editable support old iOS versions etc
			if (!Env.contentEditable) {
				return;
			}

			// Hide target element early to prevent content flashing
			if (!settings.inline) {
				self.orgVisibility = self.getElement().style.visibility;
				self.getElement().style.visibility = 'hidden';
			} else {
				self.inline = true;
			}

			var form = self.getElement().form || DOM.getParent(id, 'form');
			if (form) {
				self.formElement = form;

				// Add hidden input for non input elements inside form elements
				if (settings.hidden_input && !/TEXTAREA|INPUT/i.test(self.getElement().nodeName)) {
					DOM.insertAfter(DOM.create('input', {type: 'hidden', name: id}), id);
					self.hasHiddenInput = true;
				}

				// Pass submit/reset from form to editor instance
				self.formEventDelegate = function(e) {
					self.fire(e.type, e);
				};

				DOM.bind(form, 'submit reset', self.formEventDelegate);

				// Reset contents in editor when the form is reset
				self.on('reset', function() {
					self.setContent(self.startContent, {format: 'raw'});
				});

				// Check page uses id="submit" or name="submit" for it's submit button
				if (settings.submit_patch && !form.submit.nodeType && !form.submit.length && !form._mceOldSubmit) {
					form._mceOldSubmit = form.submit;
					form.submit = function() {
						self.editorManager.triggerSave();
						self.isNotDirty = true;

						return form._mceOldSubmit(form);
					};
				}
			}

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
			 * @example
			 * // Shows an alert message
			 * tinymce.activeEditor.windowManager.alert('Hello world!');
			 *
			 * // Opens a new dialog with the file.htm file and the size 320x240
			 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
			 * tinymce.activeEditor.windowManager.open({
			 *    url: 'file.htm',
			 *    width: 320,
			 *    height: 240
			 * }, {
			 *    custom_param: 1
			 * });
			 */
			self.windowManager = new WindowManager(self);

			if (settings.encoding == 'xml') {
				self.on('GetContent', function(e) {
					if (e.save) {
						e.content = DOM.encode(e.content);
					}
				});
			}

			if (settings.add_form_submit_trigger) {
				self.on('submit', function() {
					if (self.initialized) {
						self.save();
					}
				});
			}

			if (settings.add_unload_trigger) {
				self._beforeUnload = function() {
					if (self.initialized && !self.destroyed && !self.isHidden()) {
						self.save({format: 'raw', no_events: true, set_dirty: false});
					}
				};

				self.editorManager.on('BeforeUnload', self._beforeUnload);
			}

			// Load scripts
			function loadScripts() {
				var scriptLoader = ScriptLoader.ScriptLoader;

				if (settings.language && settings.language != 'en' && !settings.language_url) {
					settings.language_url = self.editorManager.baseURL + '/langs/' + settings.language + '.js';
				}

				if (settings.language_url) {
					scriptLoader.add(settings.language_url);
				}

				if (settings.theme && typeof settings.theme != "function" &&
					settings.theme.charAt(0) != '-' && !ThemeManager.urls[settings.theme]) {
					var themeUrl = settings.theme_url;

					if (themeUrl) {
						themeUrl = self.documentBaseURI.toAbsolute(themeUrl);
					} else {
						themeUrl = 'themes/' + settings.theme + '/theme' + suffix + '.js';
					}

					ThemeManager.load(settings.theme, themeUrl);
				}

				if (Tools.isArray(settings.plugins)) {
					settings.plugins = settings.plugins.join(' ');
				}

				each(settings.external_plugins, function(url, name) {
					PluginManager.load(name, url);
					settings.plugins += ' ' + name;
				});

				each(settings.plugins.split(/[ ,]/), function(plugin) {
					plugin = trim(plugin);

					if (plugin && !PluginManager.urls[plugin]) {
						if (plugin.charAt(0) == '-') {
							plugin = plugin.substr(1, plugin.length);

							var dependencies = PluginManager.dependencies(plugin);

							each(dependencies, function(dep) {
								var defaultSettings = {
									prefix:'plugins/',
									resource: dep,
									suffix:'/plugin' + suffix + '.js'
								};

								dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);
							});
						} else {
							PluginManager.load(plugin, {
								prefix: 'plugins/',
								resource: plugin,
								suffix: '/plugin' + suffix + '.js'
							});
						}
					}
				});

				scriptLoader.loadQueue(function() {
					if (!self.removed) {
						self.init();
					}
				});
			}

			loadScripts();
		},

		/**
		 * Initializes the editor this will be called automatically when
		 * all plugins/themes and language packs are loaded by the rendered method.
		 * This method will setup the iframe and create the theme and plugin instances.
		 *
		 * @method init
		 */
		init: function() {
			var self = this, settings = self.settings, elm = self.getElement();
			var w, h, minHeight, n, o, url, bodyId, bodyClass, re, i, initializedPlugins = [];

			self.rtl = this.editorManager.i18n.rtl;
			self.editorManager.add(self);

			settings.aria_label = settings.aria_label || DOM.getAttrib(elm, 'aria-label', self.getLang('aria.rich_text_area'));

			/**
			 * Reference to the theme instance that was used to generate the UI.
			 *
			 * @property theme
			 * @type tinymce.Theme
			 * @example
			 * // Executes a method on the theme directly
			 * tinymce.activeEditor.theme.someMethod();
			 */
			if (settings.theme) {
				if (typeof settings.theme != "function") {
					settings.theme = settings.theme.replace(/-/, '');
					o = ThemeManager.get(settings.theme);
					self.theme = new o(self, ThemeManager.urls[settings.theme]);

					if (self.theme.init) {
						self.theme.init(self, ThemeManager.urls[settings.theme] || self.documentBaseUrl.replace(/\/$/, ''));
					}
				} else {
					self.theme = settings.theme;
				}
			}

			function initPlugin(plugin) {
				var constr = PluginManager.get(plugin), url, pluginInstance;

				url = PluginManager.urls[plugin] || self.documentBaseUrl.replace(/\/$/, '');
				plugin = trim(plugin);
				if (constr && inArray(initializedPlugins, plugin) === -1) {
					each(PluginManager.dependencies(plugin), function(dep){
						initPlugin(dep);
					});

					pluginInstance = new constr(self, url);

					self.plugins[plugin] = pluginInstance;

					if (pluginInstance.init) {
						pluginInstance.init(self, url);
						initializedPlugins.push(plugin);
					}
				}
			}

			// Create all plugins
			each(settings.plugins.replace(/\-/g, '').split(/[ ,]/), initPlugin);

			// Measure box
			if (settings.render_ui && self.theme) {
				self.orgDisplay = elm.style.display;

				if (typeof settings.theme != "function") {
					w = settings.width || elm.style.width || elm.offsetWidth;
					h = settings.height || elm.style.height || elm.offsetHeight;
					minHeight = settings.min_height || 100;
					re = /^[0-9\.]+(|px)$/i;

					if (re.test('' + w)) {
						w = Math.max(parseInt(w, 10) + (o.deltaWidth || 0), 100);
					}

					if (re.test('' + h)) {
						h = Math.max(parseInt(h, 10) + (o.deltaHeight || 0), minHeight);
					}

					// Render UI
					o = self.theme.renderUI({
						targetNode: elm,
						width: w,
						height: h,
						deltaWidth: settings.delta_width,
						deltaHeight: settings.delta_height
					});

					// Resize editor
					if (!settings.content_editable) {
						DOM.setStyles(o.sizeContainer || o.editorContainer, {
							wi2dth: w,
							// TODO: Fix this
							h2eight: h
						});

						h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
						if (h < minHeight) {
							h = minHeight;
						}
					}
				} else {
					o = settings.theme(self, elm);

					// Convert element type to id:s
					if (o.editorContainer.nodeType) {
						o.editorContainer = o.editorContainer.id = o.editorContainer.id || self.id + "_parent";
					}

					// Convert element type to id:s
					if (o.iframeContainer.nodeType) {
						o.iframeContainer = o.iframeContainer.id = o.iframeContainer.id || self.id + "_iframecontainer";
					}

					// Use specified iframe height or the targets offsetHeight
					h = o.iframeHeight || elm.offsetHeight;
				}

				self.editorContainer = o.editorContainer;
			}

			// Load specified content CSS last
			if (settings.content_css) {
				each(explode(settings.content_css), function(u) {
					self.contentCSS.push(self.documentBaseURI.toAbsolute(u));
				});
			}

			// Load specified content CSS last
			if (settings.content_style) {
				self.contentStyles.push(settings.content_style);
			}

			// Content editable mode ends here
			if (settings.content_editable) {
				elm = n = o = null; // Fix IE leak
				return self.initContentBody();
			}

			self.iframeHTML = settings.doctype + '<html><head>';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (settings.document_base_url != self.documentBaseUrl) {
				self.iframeHTML += '<base href="' + self.documentBaseURI.getURI() + '" />';
			}

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (!Env.caretAfter && settings.ie7_compat) {
				self.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
			}

			self.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			for (i = 0; i < self.contentCSS.length; i++) {
				var cssUrl = self.contentCSS[i];
				self.iframeHTML += '<link type="text/css" rel="stylesheet" href="' + cssUrl + '" />';
				self.loadedCSS[cssUrl] = true;
			}

			bodyId = settings.body_id || 'tinymce';
			if (bodyId.indexOf('=') != -1) {
				bodyId = self.getParam('body_id', '', 'hash');
				bodyId = bodyId[self.id] || bodyId;
			}

			bodyClass = settings.body_class || '';
			if (bodyClass.indexOf('=') != -1) {
				bodyClass = self.getParam('body_class', '', 'hash');
				bodyClass = bodyClass[self.id] || '';
			}

			self.iframeHTML += '</head><body id="' + bodyId + '" class="mce-content-body ' + bodyClass + '" ' +
				'onload="window.parent.tinymce.get(\'' + self.id + '\').fire(\'load\');"><br></body></html>';

			var domainRelaxUrl = 'javascript:(function(){'+
				'document.open();document.domain="' + document.domain + '";' +
				'var ed = window.parent.tinymce.get("' + self.id + '");document.write(ed.iframeHTML);' +
				'document.close();ed.initContentBody(true);})()';

			// Domain relaxing is required since the user has messed around with document.domain
			if (document.domain != location.hostname) {
				url = domainRelaxUrl;
			}

			// Create iframe
			// TODO: ACC add the appropriate description on this.
			n = DOM.add(o.iframeContainer, 'iframe', {
				id: self.id + "_ifr",
				src: url || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder: '0',
				allowTransparency: "true",
				title: self.editorManager.translate(
					"Rich Text Area. Press ALT-F9 for menu. " +
					"Press ALT-F10 for toolbar. Press ALT-0 for help"
				),
				style: {
					width: '100%',
					height: h,
					display: 'block' // Important for Gecko to render the iframe correctly
				}
			});

			// Try accessing the document this will fail on IE when document.domain is set to the same as location.hostname
			// Then we have to force domain relaxing using the domainRelaxUrl approach very ugly!!
			if (ie) {
				try {
					self.getDoc();
				} catch (e) {
					n.src = url = domainRelaxUrl;
				}
			}

			self.contentAreaContainer = o.iframeContainer;

			if (o.editorContainer) {
				DOM.get(o.editorContainer).style.display = self.orgDisplay;
			}

			DOM.get(self.id).style.display = 'none';
			DOM.setAttrib(self.id, 'aria-hidden', true);

			if (!url) {
				self.initContentBody();
			}

			elm = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method ones the iframe is loaded.
		 * It will fill the iframe with contents, setups DOM and selection objects for the iframe.
		 *
		 * @method initContentBody
		 * @private
		 */
		initContentBody: function(skipWrite) {
			var self = this, settings = self.settings, targetElm = DOM.get(self.id), doc = self.getDoc(), body, contentCssText;

			// Restore visibility on target element
			if (!settings.inline) {
				self.getElement().style.visibility = self.orgVisibility;
			}

			// Setup iframe body
			if (!skipWrite && !settings.content_editable) {
				doc.open();
				doc.write(self.iframeHTML);
				doc.close();
			}

			if (settings.content_editable) {
				self.on('remove', function() {
					var body = this.getBody();

					DOM.removeClass(body, 'mce-content-body');
					DOM.removeClass(body, 'mce-edit-focus');
					DOM.setAttrib(body, 'tabIndex', null);
					DOM.setAttrib(body, 'contentEditable', null);
				});

				DOM.addClass(targetElm, 'mce-content-body');
				targetElm.tabIndex = -1;
				self.contentDocument = doc = settings.content_document || document;
				self.contentWindow = settings.content_window || window;
				self.bodyElement = targetElm;

				// Prevent leak in IE
				settings.content_document = settings.content_window = null;

				// TODO: Fix this
				settings.root_name = targetElm.nodeName.toLowerCase();
			}

			// It will not steal focus while setting contentEditable
			body = self.getBody();
			body.disabled = true;

			if (!settings.readonly) {
				if (self.inline && DOM.getStyle(body, 'position', true) == 'static') {
					body.style.position = 'relative';
				}

				body.contentEditable = self.getParam('content_editable_state', true);
			}

			body.disabled = false;

			/**
			 * Schema instance, enables you to validate elements and it's children.
			 *
			 * @property schema
			 * @type tinymce.html.Schema
			 */
			self.schema = new Schema(settings);

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 * @example
			 * // Adds a class to all paragraphs within the editor
			 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
			 */
			self.dom = new DOMUtils(doc, {
				keep_values: true,
				url_converter: self.convertURL,
				url_converter_scope: self,
				hex_colors: settings.force_hex_style_colors,
				class_filter: settings.class_filter,
				update_styles: true,
				root_element: settings.content_editable ? self.id : null,
				collect: settings.content_editable,
				schema: self.schema,
				onSetAttrib: function(e) {
					self.fire('SetAttrib', e);
				}
			});

			/**
			 * HTML parser will be used when contents is inserted into the editor.
			 *
			 * @property parser
			 * @type tinymce.html.DomParser
			 */
			self.parser = new DomParser(settings, self.schema);

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			self.parser.addAttributeFilter('src,href,style', function(nodes, name) {
				var i = nodes.length, node, dom = self.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {
						if (name === "style") {
							node.attr(internalName, dom.serializeStyle(dom.parseStyle(value), node.name));
						} else {
							node.attr(internalName, self.convertURL(value, name, node.name));
						}
					}
				}
			});

			// Keep scripts from executing
			self.parser.addNodeFilter('script', function(nodes) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.attr('type', 'mce-' + (node.attr('type') || 'text/javascript'));
				}
			});

			self.parser.addNodeFilter('#cdata', function(nodes) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			self.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes) {
				var i = nodes.length, node, nonEmptyElements = self.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(nonEmptyElements)) {
						node.empty().append(new Node('br', 1)).shortEnded = true;
					}
				}
			});

			/**
			 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 * @example
			 * // Serializes the first paragraph in the editor into a string
			 * tinymce.activeEditor.serializer.serialize(tinymce.activeEditor.dom.select('p')[0]);
			 */
			self.serializer = new DomSerializer(settings, self);

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 * @example
			 * // Sets some contents to the current selection in the editor
			 * tinymce.activeEditor.selection.setContent('Some contents');
			 *
			 * // Gets the current selection
			 * alert(tinymce.activeEditor.selection.getContent());
			 *
			 * // Selects the first paragraph found
			 * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
			 */
			self.selection = new Selection(self.dom, self.getWin(), self.serializer, self);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			self.formatter = new Formatter(self);

			/**
			 * Undo manager instance, responsible for handling undo levels.
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 * @example
			 * // Undoes the last modification to the editor
			 * tinymce.activeEditor.undoManager.undo();
			 */
			self.undoManager = new UndoManager(self);

			self.forceBlocks = new ForceBlocks(self);
			self.enterKey = new EnterKey(self);
			self.editorCommands = new EditorCommands(self);

			self.fire('PreInit');

			if (!settings.browser_spellcheck && !settings.gecko_spellcheck) {
				doc.body.spellcheck = false; // Gecko
				DOM.setAttrib(body, "spellcheck", "false");
			}

			self.fire('PostRender');

			self.quirks = Quirks(self);

			if (settings.directionality) {
				body.dir = settings.directionality;
			}

			if (settings.nowrap) {
				body.style.whiteSpace = "nowrap";
			}

			if (settings.protect) {
				self.on('BeforeSetContent', function(e) {
					each(settings.protect, function(pattern) {
						e.content = e.content.replace(pattern, function(str) {
							return '<!--mce:protected ' + escape(str) + '-->';
						});
					});
				});
			}

			self.on('SetContent', function() {
				self.addVisual(self.getBody());
			});

			// Remove empty contents
			if (settings.padd_empty_editor) {
				self.on('PostProcess', function(e) {
					e.content = e.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			self.load({initial: true, format: 'html'});
			self.startContent = self.getContent({format: 'raw'});

			/**
			 * Is set to true after the editor instance has been initialized
			 *
			 * @property initialized
			 * @type Boolean
			 * @example
			 * function isEditorInitialized(editor) {
			 *     return editor && editor.initialized;
			 * }
			 */
			self.initialized = true;

			each(self._pendingNativeEvents, function(name) {
				self.dom.bind(getEventTarget(self, name), name, function(e) {
					self.fire(e.type, e);
				});
			});

			self.fire('init');
			self.focus(true);
			self.nodeChanged({initial: true});
			self.execCallback('init_instance_callback', self);

			// Add editor specific CSS styles
			if (self.contentStyles.length > 0) {
				contentCssText = '';

				each(self.contentStyles, function(style) {
					contentCssText += style + "\r\n";
				});

				self.dom.addStyle(contentCssText);
			}

			// Load specified content CSS last
			each(self.contentCSS, function(cssUrl) {
				if (!self.loadedCSS[cssUrl]) {
					self.dom.loadCSS(cssUrl);
					self.loadedCSS[cssUrl] = true;
				}
			});

			// Handle auto focus
			if (settings.auto_focus) {
				setTimeout(function () {
					var ed = self.editorManager.get(settings.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getBody().focus();
					ed.getWin().focus();
				}, 100);
			}

			// Clean up references for IE
			targetElm = doc = body = null;
		},

		/**
		 * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
		 * it will also place DOM focus inside the editor.
		 *
		 * @method focus
		 * @param {Boolean} skip_focus Skip DOM focus. Just set is as the active editor.
		 */
		focus: function(skip_focus) {
			var oed, self = this, selection = self.selection, contentEditable = self.settings.content_editable, rng;
			var controlElm, doc = self.getDoc(), body;

			if (!skip_focus) {
				// Get selected control element
				rng = selection.getRng();
				if (rng.item) {
					controlElm = rng.item(0);
				}

				self._refreshContentEditable();

				// Focus the window iframe
				if (!contentEditable) {
					// WebKit needs this call to fire focusin event properly see #5948
					// But Opera pre Blink engine will produce an empty selection so skip Opera
					if (!Env.opera) {
						self.getBody().focus();
					}

					self.getWin().focus();
				}

				// Focus the body as well since it's contentEditable
				if (isGecko || contentEditable) {
					body = self.getBody();

					// Check for setActive since it doesn't scroll to the element
					if (body.setActive && Env.ie < 11) {
						body.setActive();
					} else {
						body.focus();
					}

					if (contentEditable) {
						selection.normalize();
					}
				}

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					rng = doc.body.createControlRange();
					rng.addElement(controlElm);
					rng.select();
				}
			}

			if (self.editorManager.activeEditor != self) {
				if ((oed = self.editorManager.activeEditor)) {
					oed.fire('deactivate', {relatedTarget: self});
				}

				self.fire('activate', {relatedTarget: oed});
			}

			self.editorManager.activeEditor = self;
		},

		/**
		 * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
		 * There new event model is a better way to add callback so this method might be removed in the future.
		 *
		 * @method execCallback
		 * @param {String} name Name of the callback to execute.
		 * @return {Object} Return value passed from callback function.
		 */
		execCallback: function(name) {
			var self = this, callback = self.settings[name], scope;

			if (!callback) {
				return;
			}

			// Look through lookup
			if (self.callbackLookup && (scope = self.callbackLookup[name])) {
				callback = scope.func;
				scope = scope.scope;
			}

			if (typeof(callback) === 'string') {
				scope = callback.replace(/\.\w+$/, '');
				scope = scope ? resolve(scope) : 0;
				callback = resolve(callback);
				self.callbackLookup = self.callbackLookup || {};
				self.callbackLookup[name] = {func: callback, scope: scope};
			}

			return callback.apply(scope || self, Array.prototype.slice.call(arguments, 1));
		},

		/**
		 * Translates the specified string by replacing variables with language pack items it will also check if there is
		 * a key mathcin the input.
		 *
		 * @method translate
		 * @param {String} text String to translate by the language pack data.
		 * @return {String} Translated string.
		 */
		translate: function(text) {
			var lang = this.settings.language || 'en', i18n = this.editorManager.i18n;

			if (!text) {
				return '';
			}

			return i18n.data[lang + '.' + text] || text.replace(/\{\#([^\}]+)\}/g, function(a, b) {
				return i18n.data[lang + '.' + b] || '{#' + b + '}';
			});
		},

		/**
		 * Returns a language pack item by name/key.
		 *
		 * @method getLang
		 * @param {String} name Name/key to get from the language pack.
		 * @param {String} defaultVal Optional default value to retrive.
		 */
		getLang: function(name, defaultVal) {
			return (
				this.editorManager.i18n.data[(this.settings.language || 'en') + '.' + name] ||
				(defaultVal !== undefined ? defaultVal : '{#' + name + '}')
			);
		},

		/**
		 * Returns a configuration parameter by name.
		 *
		 * @method getParam
		 * @param {String} name Configruation parameter to retrive.
		 * @param {String} defaultVal Optional default value to return.
		 * @param {String} type Optional type parameter.
		 * @return {String} Configuration parameter value or default value.
		 * @example
		 * // Returns a specific config value from the currently active editor
		 * var someval = tinymce.activeEditor.getParam('myvalue');
		 *
		 * // Returns a specific config value from a specific editor instance by id
		 * var someval2 = tinymce.get('my_editor').getParam('myvalue');
		 */
		getParam: function(name, defaultVal, type) {
			var value = name in this.settings ? this.settings[name] : defaultVal, output;

			if (type === 'hash') {
				output = {};

				if (typeof(value) === 'string') {
					each(value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(','), function(value) {
						value = value.split('=');

						if (value.length > 1) {
							output[trim(value[0])] = trim(value[1]);
						} else {
							output[trim(value[0])] = trim(value);
						}
					});
				} else {
					output = value;
				}

				return output;
			}

			return value;
		},

		/**
		 * Distpaches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 */
		nodeChanged: function() {
			var self = this, selection = self.selection, node, parents, root;

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (self.initialized && !self.settings.disable_nodechange) {
				// Get start node
				root = self.getBody();
				node = selection.getStart() || root;
				node = ie && node.ownerDocument != self.getDoc() ? self.getBody() : node; // Fix for IE initial state

				// Edge case for <p>|<img></p>
				if (node.nodeName == 'IMG' && selection.isCollapsed()) {
					node = node.parentNode;
				}

				// Get parents and add them to object
				parents = [];
				self.dom.getParent(node, function(node) {
					if (node === root) {
						return true;
					}

					parents.push(node);
				});

				self.fire('NodeChange', {element: node, parents: parents});
			}
		},

		/**
		 * Adds a button that later gets created by the ControlManager. This is a shorter and easier method
		 * of adding buttons without the need to deal with the ControlManager directly. But it's also less
		 * powerfull if you need more control use the ControlManagers factory methods instead.
		 *
		 * @method addButton
		 * @param {String} name Button name to add.
		 * @param {Object} settings Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom button to the editor that inserts contents when clicked
		 * tinymce.init({
		 *    ...
		 *
		 *    toolbar: 'example'
		 *
		 *    setup: function(ed) {
		 *       ed.addButton('example', {
		 *          title: 'My title',
		 *          image: '../js/tinymce/plugins/example/img/example.gif',
		 *          onclick: function() {
		 *             ed.insertContent('Hello world!!');
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addButton: function(name, settings) {
			var self = this;

			if (settings.cmd) {
				settings.onclick = function() {
					self.execCommand(settings.cmd);
				};
			}

			if (!settings.text && !settings.icon) {
				settings.icon = name;
			}

			self.buttons = self.buttons || {};
			settings.tooltip = settings.tooltip || settings.title;
			self.buttons[name] = settings;
		},

		/**
		 * Adds a menu item to be used in the menus of the modern theme.
		 *
		 * @method addMenuItem
		 * @param {String} name Menu item name to add.
		 * @param {Object} settings Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom menu item to the editor that inserts contents when clicked
		 * // The context option allows you to add the menu item to an existing default menu
		 * tinymce.init({
		 *    ...
		 *
		 *    setup: function(ed) {
		 *       ed.addMenuItem('example', {
		 *          title: 'My menu item',
		 *          context: 'tools',
		 *          onclick: function() {
		 *             ed.insertContent('Hello world!!');
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addMenuItem: function(name, settings) {
			var self = this;

			if (settings.cmd) {
				settings.onclick = function() {
					self.execCommand(settings.cmd);
				};
			}

			self.menuItems = self.menuItems || {};
			self.menuItems[name] = settings;
		},

		/**
		 * Adds a custom command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with execCommand.
		 *
		 * @method addCommand
		 * @param {String} name Command name to add/override.
		 * @param {addCommandCallback} callback Function to execute when the command occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 * @example
		 * // Adds a custom command that later can be executed using execCommand
		 * tinymce.init({
		 *    ...
		 *
		 *    setup: function(ed) {
		 *       // Register example command
		 *       ed.addCommand('mycommand', function(ui, v) {
		 *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format: 'text'}));
		 *       });
		 *    }
		 * });
		 */
		addCommand: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a command is executed.
			 *
			 * @callback addCommandCallback
			 * @param {Boolean} ui Display UI state true/false.
			 * @param {Object} value Optional value for command.
			 * @return {Boolean} True/false state if the command was handled or not.
			 */
			this.execCommands[name] = {func: callback, scope: scope || this};
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryStateHandler: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandState is executed.
			 *
			 * @callback addQueryStateHandlerCallback
			 * @return {Boolean} True/false state if the command is enabled or not like is it bold.
			 */
			this.queryStateCommands[name] = {func: callback, scope: scope || this};
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryValueHandler: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandValue is executed.
			 *
			 * @callback addQueryValueHandlerCallback
			 * @return {Object} Value of the command or undefined.
			 */
			this.queryValueCommands[name] = {func: callback, scope: scope || this};
		},

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		addShortcut: function(pattern, desc, cmdFunc, scope) {
			this.shortcuts.add(pattern, desc, cmdFunc, scope);
		},

		/**
		 * Executes a command on the current instance. These commands can be TinyMCE internal commands prefixed with "mce" or
		 * they can be build in browser commands such as "Bold". A compleate list of browser commands is available on MSDN or Mozilla.org.
		 * This function will dispatch the execCommand function on each plugin, theme or the execcommand_callback option if none of these
		 * return true it will handle the command as a internal browser command.
		 *
		 * @method execCommand
		 * @param {String} cmd Command name to execute, for example mceLink or Bold.
		 * @param {Boolean} ui True/false state if a UI (dialog) should be presented or not.
		 * @param {mixed} value Optional command value, this can be anything.
		 * @param {Object} a Optional arguments object.
		 */
		execCommand: function(cmd, ui, value, args) {
			var self = this, state = 0, cmdItem;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(cmd) && (!args || !args.skip_focus)) {
				self.focus();
			}

			args = extend({}, args);
			args = self.fire('BeforeExecCommand', {command: cmd, ui: ui, value: value});
			if (args.isDefaultPrevented()) {
				return false;
			}

			// Registred commands
			if ((cmdItem = self.execCommands[cmd])) {
				// Fall through on true
				if (cmdItem.func.call(cmdItem.scope, ui, value) !== true) {
					self.fire('ExecCommand', {command: cmd, ui: ui, value: value});
					return true;
				}
			}

			// Plugin commands
			each(self.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, value)) {
					self.fire('ExecCommand', {command: cmd, ui: ui, value: value});
					state = true;
					return false;
				}
			});

			if (state) {
				return state;
			}

			// Theme commands
			if (self.theme && self.theme.execCommand && self.theme.execCommand(cmd, ui, value)) {
				self.fire('ExecCommand', {command: cmd, ui: ui, value: value});
				return true;
			}

			// Editor commands
			if (self.editorCommands.execCommand(cmd, ui, value)) {
				self.fire('ExecCommand', {command: cmd, ui: ui, value: value});
				return true;
			}

			// Browser commands
			self.getDoc().execCommand(cmd, ui, value);
			self.fire('ExecCommand', {command: cmd, ui: ui, value: value});
		},

		/**
		 * Returns a command specific state, for example if bold is enabled or not.
		 *
		 * @method queryCommandState
		 * @param {string} cmd Command to query state from.
		 * @return {Boolean} Command specific state, for example if bold is enabled or not.
		 */
		queryCommandState: function(cmd) {
			var self = this, queryItem, returnVal;

			// Is hidden then return undefined
			if (self._isHidden()) {
				return;
			}

			// Registred commands
			if ((queryItem = self.queryStateCommands[cmd])) {
				returnVal = queryItem.func.call(queryItem.scope);

				// Fall though on true
				if (returnVal !== true) {
					return returnVal;
				}
			}

			// Editor commands
			returnVal = self.editorCommands.queryCommandState(cmd);
			if (returnVal !== -1) {
				return returnVal;
			}

			// Browser commands
			try {
				return self.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Returns a command specific value, for example the current font size.
		 *
		 * @method queryCommandValue
		 * @param {string} cmd Command to query value from.
		 * @return {Object} Command specific value, for example the current font size.
		 */
		queryCommandValue: function(cmd) {
			var self = this, queryItem, returnVal;

			// Is hidden then return undefined
			if (self._isHidden()) {
				return;
			}

			// Registred commands
			if ((queryItem = self.queryValueCommands[cmd])) {
				returnVal = queryItem.func.call(queryItem.scope);

				// Fall though on true
				if (returnVal !== true) {
					return returnVal;
				}
			}

			// Editor commands
			returnVal = self.editorCommands.queryCommandValue(cmd);
			if (returnVal !== undefined) {
				return returnVal;
			}

			// Browser commands
			try {
				return self.getDoc().queryCommandValue(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Shows the editor and hides any textarea/div that the editor is supposed to replace.
		 *
		 * @method show
		 */
		show: function() {
			var self = this;

			DOM.show(self.getContainer());
			DOM.hide(self.id);
			self.load();
			self.fire('show');
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide: function() {
			var self = this, doc = self.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (ie && doc && !self.inline) {
				doc.execCommand('SelectAll');
			}

			// We must save before we hide so Safari doesn't crash
			self.save();

			// defer the call to hide to prevent an IE9 crash #4921
			DOM.hide(self.getContainer());
			DOM.setStyle(self.id, 'display', self.orgDisplay);
			self.fire('hide');
		},

		/**
		 * Returns true/false if the editor is hidden or not.
		 *
		 * @method isHidden
		 * @return {Boolean} True/false if the editor is hidden or not.
		 */
		isHidden: function() {
			return !DOM.isHidden(this.id);
		},

		/**
		 * Sets the progress state, this will display a throbber/progess for the editor.
		 * This is ideal for asycronous operations like an AJAX save call.
		 *
		 * @method setProgressState
		 * @param {Boolean} state Boolean state if the progress should be shown or hidden.
		 * @param {Number} time Optional time to wait before the progress gets shown.
		 * @return {Boolean} Same as the input state.
		 * @example
		 * // Show progress for the active editor
		 * tinymce.activeEditor.setProgressState(true);
		 * 
		 * // Hide progress for the active editor
		 * tinymce.activeEditor.setProgressState(false);
		 * 
		 * // Show progress after 3 seconds
		 * tinymce.activeEditor.setProgressState(true, 3000);
		 */
		setProgressState: function(state, time) {
			this.fire('ProgressState', {state: state, time: time});
		},

		/**
		 * Loads contents from the textarea or div element that got converted into an editor instance.
		 * This method will move the contents from that textarea or div into the editor by using setContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method load
		 * @param {Object} args Optional content object, this gets passed around through the whole load process.
		 * @return {String} HTML string that got set into the editor.
		 */
		load: function(args) {
			var self = this, elm = self.getElement(), html;

			if (elm) {
				args = args || {};
				args.load = true;

				html = self.setContent(elm.value !== undefined ? elm.value : elm.innerHTML, args);
				args.element = elm;

				if (!args.no_events) {
					self.fire('LoadContent', args);
				}

				args.element = elm = null;

				return html;
			}
		},

		/**
		 * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
		 * This method will move the HTML contents from the editor into that textarea or div by getContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method save
		 * @param {Object} args Optional content object, this gets passed around through the whole save process.
		 * @return {String} HTML string that got set into the textarea/div.
		 */
		save: function(args) {
			var self = this, elm = self.getElement(), html, form;

			if (!elm || !self.initialized) {
				return;
			}

			args = args || {};
			args.save = true;

			args.element = elm;
			html = args.content = self.getContent(args);

			if (!args.no_events) {
				self.fire('SaveContent', args);
			}

			html = args.content;

			if (!/TEXTAREA|INPUT/i.test(elm.nodeName)) {
				elm.innerHTML = html;

				// Update hidden form element
				if ((form = DOM.getParent(self.id, 'form'))) {
					each(form.elements, function(elm) {
						if (elm.name == self.id) {
							elm.value = html;
							return false;
						}
					});
				}
			} else {
				elm.value = html;
			}

			args.element = elm = null;

			if (args.set_dirty !== false) {
				self.isNotDirty = true;
			}

			return html;
		},

		/**
		 * Sets the specified content to the editor instance, this will cleanup the content before it gets set using
		 * the different cleanup rules options.
		 *
		 * @method setContent
		 * @param {String} content Content to set to editor, normally HTML contents but can be other formats as well.
		 * @param {Object} args Optional content object, this gets passed around through the whole set process.
		 * @return {String} HTML string that got set into the editor.
		 * @example
		 * // Sets the HTML contents of the activeEditor editor
		 * tinymce.activeEditor.setContent('<span>some</span> html');
		 *
		 * // Sets the raw contents of the activeEditor editor
		 * tinymce.activeEditor.setContent('<span>some</span> html', {format: 'raw'});
		 *
		 * // Sets the content of a specific editor (my_editor in this example)
		 * tinymce.get('my_editor').setContent(data);
		 *
		 * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
		 * tinymce.activeEditor.setContent('[b]some[/b] html', {format: 'bbcode'});
		 */
		setContent: function(content, args) {
			var self = this, body = self.getBody(), forcedRootBlockName;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events) {
				self.fire('BeforeSetContent', args);
			}

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (content.length === 0 || /^\s+$/.test(content)) {
				forcedRootBlockName = self.settings.forced_root_block;

				// Check if forcedRootBlock is configured and that the block is a valid child of the body
				if (forcedRootBlockName && self.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
					// Padd with bogus BR elements on modern browsers and IE 7 and 8 since they don't render empty P tags properly
					content = ie && ie < 11 ? '' : '<br data-mce-bogus="1">';
					content = self.dom.createHTML(forcedRootBlockName, self.settings.forced_root_block_attrs, content);
				} else if (!ie || ie < 11) {
					// We need to add a BR when forced_root_block is disabled on non IE browsers to place the caret
					content = '<br data-mce-bogus="1">';
				}

				body.innerHTML = content;

				self.fire('SetContent', args);
			} else {
				// Parse and serialize the html
				if (args.format !== 'raw') {
					content = new Serializer({}, self.schema).serialize(
						self.parser.parse(content, {isRootContent: true})
					);
				}

				// Set the new cleaned contents to the editor
				args.content = trim(content);
				self.dom.setHTML(body, args.content);

				// Do post processing
				if (!args.no_events) {
					self.fire('SetContent', args);
				}

				// Don't normalize selection if the focused element isn't the body in
				// content editable mode since it will steal focus otherwise
				/*if (!self.settings.content_editable || document.activeElement === self.getBody()) {
					self.selection.normalize();
				}*/
			}

			return args.content;
		},

		/**
		 * Gets the content from the editor instance, this will cleanup the content before it gets returned using
		 * the different cleanup rules options.
		 *
		 * @method getContent
		 * @param {Object} args Optional content object, this gets passed around through the whole get process.
		 * @return {String} Cleaned content string, normally HTML contents.
		 * @example
		 * // Get the HTML contents of the currently active editor
		 * console.debug(tinymce.activeEditor.getContent());
		 *
		 * // Get the raw contents of the currently active editor
		 * tinymce.activeEditor.getContent({format: 'raw'});
		 *
		 * // Get content of a specific editor:
		 * tinymce.get('content id').getContent()
		 */
		getContent: function(args) {
			var self = this, content, body = self.getBody();

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;
			args.getInner = true;

			// Do preprocessing
			if (!args.no_events) {
				self.fire('BeforeGetContent', args);
			}

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw') {
				content = body.innerHTML;
			} else if (args.format == 'text') {
				content = body.innerText || body.textContent;
			} else {
				content = self.serializer.serialize(body, args);
			}

			// Trim whitespace in beginning/end of HTML
			if (args.format != 'text') {
				args.content = trim(content);
			} else {
				args.content = content;
			}

			// Do post processing
			if (!args.no_events) {
				self.fire('GetContent', args);
			}

			return args.content;
		},

		/**
		 * Inserts content at caret position.
		 *
		 * @method insertContent
		 * @param {String} content Content to insert.
		 */
		insertContent: function(content) {
			this.execCommand('mceInsertContent', false, content);
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 * @example
		 * if (tinymce.activeEditor.isDirty())
		 *     alert("You must save your contents.");
		 */
		isDirty: function() {
			return !this.isNotDirty;
		},

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer: function() {
			var self = this;

			if (!self.container) {
				self.container = DOM.get(self.editorContainer || self.id + '_parent');
			}

			return self.container;
		},

		/**
		 * Returns the editors content area container element. The this element is the one who
		 * holds the iframe or the editable element.
		 *
		 * @method getContentAreaContainer
		 * @return {Element} HTML DOM element for the editor area container.
		 */
		getContentAreaContainer: function() {
			return this.contentAreaContainer;
		},

		/**
		 * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
		 *
		 * @method getElement
		 * @return {Element} HTML DOM element for the replaced element.
		 */
		getElement: function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		/**
		 * Returns the iframes window object.
		 *
		 * @method getWin
		 * @return {Window} Iframe DOM window object.
		 */
		getWin: function() {
			var self = this, elm;

			if (!self.contentWindow) {
				elm = DOM.get(self.id + "_ifr");

				if (elm) {
					self.contentWindow = elm.contentWindow;
				}
			}

			return self.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc: function() {
			var self = this, win;

			if (!self.contentDocument) {
				win = self.getWin();

				if (win) {
					self.contentDocument = win.document;
				}
			}

			return self.contentDocument;
		},

		/**
		 * Returns the iframes body element.
		 *
		 * @method getBody
		 * @return {Element} Iframe body element.
		 */
		getBody: function() {
			return this.bodyElement || this.getDoc().body;
		},

		/**
		 * URL converter function this gets executed each time a user adds an img, a or
		 * any other element that has a URL in it. This will be called both by the DOM and HTML
		 * manipulation functions.
		 *
		 * @method convertURL
		 * @param {string} url URL to convert.
		 * @param {string} name Attribute name src, href etc.
		 * @param {string/HTMLElement} elm Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL: function(url, name, elm) {
			var self = this, settings = self.settings;

			// Use callback instead
			if (settings.urlconverter_callback) {
				return self.execCallback('urlconverter_callback', url, elm, true, name);
			}

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!settings.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0 || url.length === 0) {
				return url;
			}

			// Convert to relative
			if (settings.relative_urls) {
				return self.documentBaseURI.toRelative(url);
			}

			// Convert to absolute
			url = self.documentBaseURI.toAbsolute(url, settings.remove_script_host);

			return url;
		},

		/**
		 * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
		 *
		 * @method addVisual
		 * @param {Element} elm Optional root element to loop though to find tables etc that needs the visual aid.
		 */
		addVisual: function(elm) {
			var self = this, settings = self.settings, dom = self.dom, cls;

			elm = elm || self.getBody();

			if (self.hasVisual === undefined) {
				self.hasVisual = settings.visual;
			}

			each(dom.select('table,a', elm), function(elm) {
				var value;

				switch (elm.nodeName) {
					case 'TABLE':
						cls = settings.visual_table_class || 'mce-item-table';
						value = dom.getAttrib(elm, 'border');

						if (!value || value == '0') {
							if (self.hasVisual) {
								dom.addClass(elm, cls);
							} else {
								dom.removeClass(elm, cls);
							}
						}

						return;

					case 'A':
						if (!dom.getAttrib(elm, 'href', false)) {
							value = dom.getAttrib(elm, 'name') || elm.id;
							cls = settings.visual_anchor_class || 'mce-item-anchor';

							if (value) {
								if (self.hasVisual) {
									dom.addClass(elm, cls);
								} else {
									dom.removeClass(elm, cls);
								}
							}
						}

						return;
				}
			});

			self.fire('VisualAid', {element: elm, hasVisual: self.hasVisual});
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove: function() {
			var self = this;

			if (!self.removed) {
				self.removed = 1; // Cancels post remove event execution

				// Remove any hidden input
				if (self.hasHiddenInput) {
					DOM.remove(self.getElement().nextSibling);
				}

				// Fixed bug where IE has a blinking cursor left from the editor
				var doc = self.getDoc();
				if (ie && doc && !self.inline) {
					doc.execCommand('SelectAll');
				}

				// We must save before we hide so Safari doesn't crash
				self.save();

				DOM.setStyle(self.id, 'display', self.orgDisplay);

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!self.settings.content_editable) {
					Event.unbind(self.getWin());
					Event.unbind(self.getDoc());
				}

				var elm = self.getContainer();
				Event.unbind(self.getBody());
				Event.unbind(elm);

				self.fire('remove');

				self.editorManager.remove(self);
				DOM.remove(elm);
				self.destroy();
			}
		},

		bindNative: function(name) {
			var self = this;

			if (self.settings.readonly) {
				return;
			}

			if (self.initialized) {
				self.dom.bind(getEventTarget(self, name), name, function(e) {
					self.fire(name, e);
				});
			} else {
				if (!self._pendingNativeEvents) {
					self._pendingNativeEvents = [name];
				} else {
					self._pendingNativeEvents.push(name);
				}
			}
		},

		unbindNative: function(name) {
			var self = this;

			if (self.initialized) {
				self.dom.unbind(name);
			}
		},

		/**
		 * Destroys the editor instance by removing all events, element references or other resources
		 * that could leak memory. This method will be called automatically when the page is unloaded
		 * but you can also call it directly if you know what you are doing.
		 *
		 * @method destroy
		 * @param {Boolean} automatic Optional state if the destroy is an automatic destroy or user called one.
		 */
		destroy: function(automatic) {
			var self = this, form;

			// One time is enough
			if (self.destroyed) {
				return;
			}

			// If user manually calls destroy and not remove
			// Users seems to have logic that calls destroy instead of remove
			if (!automatic && !self.removed) {
				self.remove();
				return;
			}

			// We must unbind on Gecko since it would otherwise produce the pesky "attempt
			// to run compile-and-go script on a cleared scope" message
			if (automatic && isGecko) {
				Event.unbind(self.getDoc());
				Event.unbind(self.getWin());
				Event.unbind(self.getBody());
			}

			if (!automatic) {
				self.editorManager.off('beforeunload', self._beforeUnload);

				// Manual destroy
				if (self.theme && self.theme.destroy) {
					self.theme.destroy();
				}

				// Destroy controls, selection and dom
				self.selection.destroy();
				self.dom.destroy();
			}

			form = self.formElement;
			if (form) {
				if (form._mceOldSubmit) {
					form.submit = form._mceOldSubmit;
					form._mceOldSubmit = null;
				}

				DOM.unbind(form, 'submit reset', self.formEventDelegate);
			}

			self.contentAreaContainer = self.formElement = self.container = null;
			self.settings.content_element = self.bodyElement = self.contentDocument = self.contentWindow = null;

			if (self.selection) {
				self.selection = self.selection.win = self.selection.dom = self.selection.dom.doc = null;
			}

			self.destroyed = 1;
		},

		// Internal functions

		_refreshContentEditable: function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initalize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden: function() {
			var sel;

			if (!isGecko) {
				return 0;
			}

			// Weird, wheres that cursor selection?
			sel = this.selection.getSel();
			return (!sel || !sel.rangeCount || sel.rangeCount === 0);
		}
	};

	extend(Editor.prototype, Observable);

	return Editor;
});

// Included from: js/tinymce/classes/util/I18n.js

/**
 * I18n.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * I18n class that handles translation of TinyMCE UI.
 * Uses po style with csharp style parameters.
 *
 * @class tinymce.util.I18n
 */
define("tinymce/util/I18n", [], function() {
	"use strict";

	var data = {};

	return {
		/**
		 * Property gets set to true if a RTL language pack was loaded.
		 *
		 * @property rtl
		 * @type {Boolean}
		 */
		rtl: false,

		/**
		 * Adds translations for a specific language code.
		 *
		 * @method add
		 * @param {String} code Language code like sv_SE.
		 * @param {Array} items Name/value array with English en_US to sv_SE.
		 */
		add: function(code, items) {
			for (var name in items) {
				data[name] = items[name];
			}

			this.rtl = this.rtl || data._dir === 'rtl';
		},

		/**
		 * Translates the specified text.
		 *
		 * It has a few formats:
		 * I18n.translate("Text");
		 * I18n.translate(["Text {0}/{1}", 0, 1]);
		 * I18n.translate({raw: "Raw string"});
		 *
		 * @method translate
		 * @param {String/Object/Array} text Text to translate.
		 * @return {String} String that got translated.
		 */
		translate: function(text) {
			if (typeof(text) == "undefined") {
				return text;
			}

			if (typeof(text) != "string" && text.raw) {
				return text.raw;
			}

			if (text.push) {
				var values = text.slice(1);

				text = (data[text[0]] || text[0]).replace(/\{([^\}]+)\}/g, function(match1, match2) {
					return values[match2];
				});
			}

			return data[text] || text;
		},

		data: data
	};
});

// Included from: js/tinymce/classes/FocusManager.js

/**
 * FocusManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
 */
define("tinymce/FocusManager", [
	"tinymce/dom/DOMUtils",
	"tinymce/Env"
], function(DOMUtils, Env) {
	/**
	 * Constructs a new focus manager instance.
	 *
	 * @constructor FocusManager
	 * @param {tinymce.EditorManager} editorManager Editor manager instance to handle focus for.
	 */
	function FocusManager(editorManager) {
		function getActiveElement() {
			try {
				return document.activeElement;
			} catch (ex) {
				// IE sometimes fails to get the activeElement when resizing table
				// TODO: Investigate this
				return document.body;
			}
		}

		// We can't store a real range on IE 11 since it gets mutated so we need to use a bookmark object
		// TODO: Move this to a separate range utils class since it's it's logic is present in Selection as well.
		function createBookmark(rng) {
			if (rng && rng.startContainer) {
				return {
					startContainer: rng.startContainer,
					startOffset: rng.startOffset,
					endContainer: rng.endContainer,
					endOffset: rng.endOffset
				};
			}

			return rng;
		}

		function bookmarkToRng(editor, bookmark) {
			var rng;

			if (bookmark.startContainer) {
				rng = editor.getDoc().createRange();
				rng.setStart(bookmark.startContainer, bookmark.startOffset);
				rng.setEnd(bookmark.endContainer, bookmark.endOffset);
			} else {
				rng = bookmark;
			}

			return rng;
		}

		function isUIElement(elm) {
			return !!DOMUtils.DOM.getParent(elm, FocusManager.isEditorUIElement);
		}

		function isNodeInBodyOfEditor(node, editor) {
			var body = editor.getBody();

			while (node) {
				if (node == body) {
					return true;
				}

				node = node.parentNode;
			}
		}

		function registerEvents(e) {
			var editor = e.editor, selectionChangeHandler;

			editor.on('init', function() {
				// On IE take selection snapshot onbeforedeactivate
				if ("onbeforedeactivate" in document && Env.ie < 11) {
					editor.dom.bind(editor.getBody(), 'beforedeactivate', function() {
						try {
							editor.lastRng = editor.selection.getRng();
						} catch (ex) {
							// IE throws "Unexcpected call to method or property access" some times so lets ignore it
						}

						editor.selection.lastFocusBookmark = createBookmark(editor.lastRng);
					});
				} else if (editor.inline || Env.ie > 10) {
					// On other browsers take snapshot on nodechange in inline mode since they have Ghost selections for iframes
					editor.on('nodechange keyup', function() {
						var node = document.activeElement;

						// IE 11 reports active element as iframe not body of iframe
						if (node && node.id == editor.id + '_ifr') {
							node = editor.getBody();
						}

						if (isNodeInBodyOfEditor(node, editor)) {
							editor.lastRng = editor.selection.getRng();
						}
					});

					// Handles the issue with WebKit not retaining selection within inline document
					// If the user releases the mouse out side the body while selecting a nodeChange won't
					// fire and there for the selection snapshot won't be stored
					// TODO: Optimize this since we only need to bind these on the active editor
					if (Env.webkit) {
						selectionChangeHandler = function() {
							var rng = editor.selection.getRng();

							// Store when it's non collapsed
							if (!rng.collapsed) {
								editor.lastRng = rng;
							}
						};

						// Bind selection handler
						DOMUtils.DOM.bind(document, 'selectionchange', selectionChangeHandler);

						editor.on('remove', function() {
							DOMUtils.DOM.unbind(document, 'selectionchange', selectionChangeHandler);
						});
					}
				}
			});

			editor.on('setcontent', function() {
				editor.lastRng = null;
			});

			// Remove last selection bookmark on mousedown see #6305
			editor.on('mousedown', function() {
				editor.selection.lastFocusBookmark = null;
			});

			editor.on('focusin', function() {
				var focusedEditor = editorManager.focusedEditor;

				if (editor.selection.lastFocusBookmark) {
					editor.selection.setRng(bookmarkToRng(editor, editor.selection.lastFocusBookmark));
					editor.selection.lastFocusBookmark = null;
				}

				if (focusedEditor != editor) {
					if (focusedEditor) {
						focusedEditor.fire('blur', {focusedEditor: editor});
					}

					editorManager.activeEditor = editor;
					editorManager.focusedEditor = editor;
					editor.fire('focus', {blurredEditor: focusedEditor});
					editor.focus(true);
				}

				editor.lastRng = null;
			});

			editor.on('focusout', function() {
				window.setTimeout(function() {
					var focusedEditor = editorManager.focusedEditor;

					// Still the same editor the the blur was outside any editor UI
					if (!isUIElement(getActiveElement()) && focusedEditor == editor) {
						editor.fire('blur', {focusedEditor: null});
						editorManager.focusedEditor = null;

						// Make sure selection is valid could be invalid if the editor is blured and removed before the timeout occurs
						if (editor.selection) {
							editor.selection.lastFocusBookmark = null;
						}
					}
				}, 0);
			});
		}

		// Check if focus is moved to an element outside the active editor by checking if the target node
		// isn't within the body of the activeEditor nor a UI element such as a dialog child control
		DOMUtils.DOM.bind(document, 'focusin', function(e) {
			var activeEditor = editorManager.activeEditor;

			if (activeEditor && e.target.ownerDocument == document) {

				// Check to make sure we have a valid selection
				if (activeEditor.selection) {
					activeEditor.selection.lastFocusBookmark = createBookmark(activeEditor.lastRng);
				}

				// Fire a blur event if the element isn't a UI element
				if (!isUIElement(e.target) && editorManager.focusedEditor == activeEditor) {
					activeEditor.fire('blur', {focusedEditor: null});
					editorManager.focusedEditor = null;
				}
			}
		});

		editorManager.on('AddEditor', registerEvents);
	}

	/**
	 * Returns true if the specified element is part of the UI for example an button or text input.
	 *
	 * @method isEditorUIElement
	 * @param  {Element} elm Element to check if it's part of the UI or not.
	 * @return {Boolean} True/false state if the element is part of the UI or not.
	 */
	FocusManager.isEditorUIElement = function(elm) {
		return elm.className.indexOf('mce-') !== -1;
	};

	return FocusManager;
});

// Included from: js/tinymce/classes/EditorManager.js

/**
 * EditorManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class used as a factory for manager for tinymce.Editor instances.
 *
 * @example
 * tinymce.EditorManager.init({});
 *
 * @class tinymce.EditorManager
 * @mixes tinymce.util.Observable
 * @static
 */
define("tinymce/EditorManager", [
	"tinymce/Editor",
	"tinymce/dom/DOMUtils",
	"tinymce/util/URI",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/util/Observable",
	"tinymce/util/I18n",
	"tinymce/FocusManager"
], function(Editor, DOMUtils, URI, Env, Tools, Observable, I18n, FocusManager) {
	var DOM = DOMUtils.DOM;
	var explode = Tools.explode, each = Tools.each, extend = Tools.extend;
	var instanceCounter = 0, beforeUnloadDelegate;

	var EditorManager = {
		/**
		 * Major version of TinyMCE build.
		 *
		 * @property majorVersion
		 * @type String
		 */
		majorVersion : '4',

		/**
		 * Minor version of TinyMCE build.
		 *
		 * @property minorVersion
		 * @type String
		 */
		minorVersion : '0.17',

		/**
		 * Release date of TinyMCE build.
		 *
		 * @property releaseDate
		 * @type String
		 */
		releaseDate: '2014-02-xx',

		/**
		 * Collection of editor instances.
		 *
		 * @property editors
		 * @type Object
		 * @example
		 * for (edId in tinymce.editors)
		 *     tinymce.editors[edId].save();
		 */
		editors: [],

		/**
		 * Collection of language pack data.
		 *
		 * @property i18n
		 * @type Object
		 */
		i18n: I18n,

		/**
		 * Currently active editor instance.
		 *
		 * @property activeEditor
		 * @type tinymce.Editor
		 * @example
		 * tinyMCE.activeEditor.selection.getContent();
		 * tinymce.EditorManager.activeEditor.selection.getContent();
		 */
		activeEditor: null,

		setup: function() {
			var self = this, baseURL, documentBaseURL, suffix = "", preInit;

			// Get base URL for the current document
			documentBaseURL = document.location.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
			if (!/[\/\\]$/.test(documentBaseURL)) {
				documentBaseURL += '/';
			}

			// If tinymce is defined and has a base use that or use the old tinyMCEPreInit
			preInit = window.tinymce || window.tinyMCEPreInit;
			if (preInit) {
				baseURL = preInit.base || preInit.baseURL;
				suffix = preInit.suffix;
			} else {
				// Get base where the tinymce script is located
				var scripts = document.getElementsByTagName('script');
				for (var i = 0; i < scripts.length; i++) {
					var src = scripts[i].src;

					// Script types supported:
					// tinymce.js tinymce.min.js tinymce.dev.js
					// tinymce.jquery.js tinymce.jquery.min.js tinymce.jquery.dev.js
					// tinymce.full.js tinymce.full.min.js tinymce.full.dev.js
					if (/tinymce(\.full|\.jquery|)(\.min|\.dev|)\.js/.test(src)) {
						if (src.indexOf('.min') != -1) {
							suffix = '.min';
						}

						baseURL = src.substring(0, src.lastIndexOf('/'));
						break;
					}
				}
			}

			/**
			 * Base URL where the root directory if TinyMCE is located.
			 *
			 * @property baseURL
			 * @type String
			 */
			self.baseURL = new URI(documentBaseURL).toAbsolute(baseURL);

			/**
			 * Document base URL where the current document is located.
			 *
			 * @property documentBaseURL
			 * @type String
			 */
			self.documentBaseURL = documentBaseURL;

			/**
			 * Absolute baseURI for the installation path of TinyMCE.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 */
			self.baseURI = new URI(self.baseURL);

			/**
			 * Current suffix to add to each plugin/theme that gets loaded for example ".min".
			 *
			 * @property suffix
			 * @type String
			 */
			self.suffix = suffix;

			self.focusManager = new FocusManager(self);
		},

		/**
		 * Initializes a set of editors. This method will create editors based on various settings.
		 *
		 * @method init
		 * @param {Object} settings Settings object to be passed to each editor instance.
		 * @example
		 * // Initializes a editor using the longer method
		 * tinymce.EditorManager.init({
		 *    some_settings : 'some value'
		 * });
		 *
		 * // Initializes a editor instance using the shorter version
		 * tinyMCE.init({
		 *    some_settings : 'some value'
		 * });
		 */
		init: function(settings) {
			var self = this, editors = [], editor;

			function createId(elm) {
				var id = elm.id;

				// Use element id, or unique name or generate a unique id
				if (!id) {
					id = elm.name;

					if (id && !DOM.get(id)) {
						id = elm.name;
					} else {
						// Generate unique name
						id = DOM.uniqueId();
					}

					elm.setAttribute('id', id);
				}

				return id;
			}

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f) {
					return;
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			}

			function hasClass(n, c) {
				return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
			}

			function readyHandler() {
				var l, co;

				DOM.unbind(window, 'ready', readyHandler);

				execCallback(settings, 'onpageload');

				if (settings.types) {
					// Process type specific selector
					each(settings.types, function(type) {
						each(DOM.select(type.selector), function(elm) {
							var editor = new Editor(createId(elm), extend({}, settings, type), self);
							editors.push(editor);
							editor.render(1);
						});
					});

					return;
				} else if (settings.selector) {
					// Process global selector
					each(DOM.select(settings.selector), function(elm) {
						var editor = new Editor(createId(elm), settings, self);
						editors.push(editor);
						editor.render(1);
					});

					return;
				}

				// Fallback to old setting
				switch (settings.mode) {
					case "exact":
						l = settings.elements || '';

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									editor = new Editor(v, settings, self);
									editors.push(editor);
									editor.render(true);
								} else {
									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + instanceCounter++;
												DOM.setAttrib(e, 'id', v);

												editor = new Editor(v, settings, self);
												editors.push(editor);
												editor.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						each(DOM.select('textarea'), function(elm) {
							if (settings.editor_deselector && hasClass(elm, settings.editor_deselector)) {
								return;
							}

							if (!settings.editor_selector || hasClass(elm, settings.editor_selector)) {
								editor = new Editor(createId(elm), settings, self);
								editors.push(editor);
								editor.render(true);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (settings.oninit) {
					l = co = 0;

					each(editors, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.on('init', function() {
								l++;

								// All done
								if (l == co) {
									execCallback(settings, 'oninit');
								}
							});
						} else {
							l++;
						}

						// All done
						if (l == co) {
							execCallback(settings, 'oninit');
						}
					});
				}
			}

			self.settings = settings;

			DOM.bind(window, 'ready', readyHandler);
		},

		/**
		 * Returns a editor instance by id.
		 *
		 * @method get
		 * @param {String/Number} id Editor instance id or index to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 * @example
		 * // Adds an onclick event to an editor by id (shorter version)
		 * tinymce.get('mytextbox').on('click', function(e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 *
		 * // Adds an onclick event to an editor by id (longer version)
		 * tinymce.EditorManager.get('mytextbox').on('click', function(e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 */
		get: function(id) {
			if (id === undefined) {
				return this.editors;
			}

			return this.editors[id];
		},

		/**
		 * Adds an editor instance to the editor collection. This will also set it as the active editor.
		 *
		 * @method add
		 * @param {tinymce.Editor} editor Editor instance to add to the collection.
		 * @return {tinymce.Editor} The same instance that got passed in.
		 */
		add: function(editor) {
			var self = this, editors = self.editors;

			// Add named and index editor instance
			editors[editor.id] = editor;
			editors.push(editor);

			self.activeEditor = editor;

			/**
			 * Fires when an editor is added to the EditorManager collection.
			 *
			 * @event AddEditor
			 * @param {Object} e Event arguments.
			 */
			self.fire('AddEditor', {editor: editor});

			if (!beforeUnloadDelegate) {
				beforeUnloadDelegate = function() {
					self.fire('BeforeUnload');
				};

				DOM.bind(window, 'beforeunload', beforeUnloadDelegate);
			}

			return editor;
		},

		/**
		 * Creates an editor instance and adds it to the EditorManager collection.
		 *
		 * @method createEditor
		 * @param {String} id Instance id to use for editor.
		 * @param {Object} settings Editor instance settings.
		 * @return {tinymce.Editor} Editor instance that got created.
		 */
		createEditor: function(id, settings) {
			return this.add(new Editor(id, settings, this));
		},

		/**
		 * Removes a editor or editors form page.
		 *
		 * @example
		 * // Remove all editors bound to divs
		 * tinymce.remove('div');
		 *
		 * // Remove all editors bound to textareas
		 * tinymce.remove('textarea');
		 *
		 * // Remove all editors
		 * tinymce.remove();
		 *
		 * // Remove specific instance by id
		 * tinymce.remove('#id');
		 *
		 * @method remove
		 * @param {tinymce.Editor/String/Object} [selector] CSS selector or editor instance to remove.
		 * @return {tinymce.Editor} The editor that got passed in will be return if it was found otherwise null.
		 */
		remove: function(selector) {
			var self = this, i, editors = self.editors, editor, removedFromList;

			// Remove all editors
			if (!selector) {
				for (i = editors.length - 1; i >= 0; i--) {
					self.remove(editors[i]);
				}

				return;
			}

			// Remove editors by selector
			if (typeof(selector) == "string") {
				selector = selector.selector || selector;

				each(DOM.select(selector), function(elm) {
					self.remove(editors[elm.id]);
				});

				return;
			}

			// Remove specific editor
			editor = selector;

			// Not in the collection
			if (!editors[editor.id]) {
				return null;
			}

			delete editors[editor.id];

			for (i = 0; i < editors.length; i++) {
				if (editors[i] == editor) {
					editors.splice(i, 1);
					removedFromList = true;
					break;
				}
			}

			// Select another editor since the active one was removed
			if (self.activeEditor == editor) {
				self.activeEditor = editors[0];
			}

			/**
			 * Fires when an editor is removed from EditorManager collection.
			 *
			 * @event RemoveEditor
			 * @param {Object} e Event arguments.
			 */
			if (removedFromList) {
				self.fire('RemoveEditor', {editor: editor});
			}

			if (!editors.length) {
				DOM.unbind(window, 'beforeunload', beforeUnloadDelegate);
			}

			editor.remove();

			return editor;
		},

		/**
		 * Executes a specific command on the currently active editor.
		 *
		 * @method execCommand
		 * @param {String} c Command to perform for example Bold.
		 * @param {Boolean} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {Boolean} true/false if the command was executed or not.
		 */
		execCommand: function(cmd, ui, value) {
			var self = this, editor = self.get(value);

			// Manager commands
			switch (cmd) {
				case "mceAddEditor":
					if (!self.get(value)) {
						new Editor(value, self.settings, self).render();
					}

					return true;

				case "mceRemoveEditor":
					if (editor) {
						editor.remove();
					}

					return true;

				case 'mceToggleEditor':
					if (!editor) {
						self.execCommand('mceAddEditor', 0, value);
						return true;
					}

					if (editor.isHidden()) {
						editor.show();
					} else {
						editor.hide();
					}

					return true;
			}

			// Run command on active editor
			if (self.activeEditor) {
				return self.activeEditor.execCommand(cmd, ui, value);
			}

			return false;
		},

		/**
		 * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
		 *
		 * @method triggerSave
		 * @example
		 * // Saves all contents
		 * tinyMCE.triggerSave();
		 */
		triggerSave: function() {
			each(this.editors, function(editor) {
				editor.save();
			});
		},

		/**
		 * Adds a language pack, this gets called by the loaded language files like en.js.
		 *
		 * @method addI18n
		 * @param {String} code Optional language code.
		 * @param {Object} items Name/value object with translations.
		 */
		addI18n: function(code, items) {
			I18n.add(code, items);
		},

		/**
		 * Translates the specified string using the language pack items.
		 *
		 * @method translate
		 * @param {String/Array/Object} text String to translate
		 * @return {String} Translated string.
		 */
		translate: function(text) {
			return I18n.translate(text);
		}
	};

	extend(EditorManager, Observable);

	EditorManager.setup();

	// Export EditorManager as tinymce/tinymce in global namespace
	window.tinymce = window.tinyMCE = EditorManager;

	return EditorManager;
});

// Included from: js/tinymce/classes/LegacyInput.js

/**
 * LegacyInput.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/LegacyInput", [
	"tinymce/EditorManager",
	"tinymce/util/Tools"
], function(EditorManager, Tools) {
	var each = Tools.each, explode = Tools.explode;

	EditorManager.on('AddEditor', function(e) {
		var editor = e.editor;

		editor.on('preInit', function() {
			var filters, fontSizes, dom, settings = editor.settings;

			function replaceWithSpan(node, styles) {
				each(styles, function(value, name) {
					if (value) {
						dom.setStyle(node, name, value);
					}
				});

				dom.rename(node, 'span');
			}

			function convert(e) {
				dom = editor.dom;

				if (settings.convert_fonts_to_spans) {
					each(dom.select('font,u,strike', e.node), function(node) {
						filters[node.nodeName.toLowerCase()](dom, node);
					});
				}
			}

			if (settings.inline_styles) {
				fontSizes = explode(settings.font_size_legacy_values);

				filters = {
					font: function(dom, node) {
						replaceWithSpan(node, {
							backgroundColor: node.style.backgroundColor,
							color: node.color,
							fontFamily: node.face,
							fontSize: fontSizes[parseInt(node.size, 10) - 1]
						});
					},

					u: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'underline'
						});
					},

					strike: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'line-through'
						});
					}
				};

				editor.on('PreProcess SetContent', convert);
			}
		});
	});
});

// Included from: js/tinymce/classes/util/XHR.js

/**
 * XHR.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to send XMLHTTPRequests cross browser.
 * @class tinymce.util.XHR
 * @static
 * @example
 * // Sends a low level Ajax request
 * tinymce.util.XHR.send({
 *    url: 'someurl',
 *    success: function(text) {
 *       console.debug(text);
 *    }
 * });
 */
define("tinymce/util/XHR", [], function() {
	return {
		/**
		 * Sends a XMLHTTPRequest.
		 * Consult the Wiki for details on what settings this method takes.
		 *
		 * @method send
		 * @param {Object} settings Object will target URL, callbacks and other info needed to make the request.
		 */
		send: function(settings) {
			var xhr, count = 0;

			function ready() {
				if (!settings.async || xhr.readyState == 4 || count++ > 10000) {
					if (settings.success && count < 10000 && xhr.status == 200) {
						settings.success.call(settings.success_scope, '' + xhr.responseText, xhr, settings);
					} else if (settings.error) {
						settings.error.call(settings.error_scope, count > 10000 ? 'TIMED_OUT' : 'GENERAL', xhr, settings);
					}

					xhr = null;
				} else {
					setTimeout(ready, 10);
				}
			}

			// Default settings
			settings.scope = settings.scope || this;
			settings.success_scope = settings.success_scope || settings.scope;
			settings.error_scope = settings.error_scope || settings.scope;
			settings.async = settings.async === false ? false : true;
			settings.data = settings.data || '';

			xhr = new XMLHttpRequest();

			if (xhr) {
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType(settings.content_type);
				}

				xhr.open(settings.type || (settings.data ? 'POST' : 'GET'), settings.url, settings.async);

				if (settings.content_type) {
					xhr.setRequestHeader('Content-Type', settings.content_type);
				}

				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

				xhr.send(settings.data);

				// Syncronous request
				if (!settings.async) {
					return ready();
				}

				// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
				setTimeout(ready, 10);
			}
		}
	};
});

// Included from: js/tinymce/classes/util/JSON.js

/**
 * JSON.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * JSON parser and serializer class.
 *
 * @class tinymce.util.JSON
 * @static
 * @example
 * // JSON parse a string into an object
 * var obj = tinymce.util.JSON.parse(somestring);
 *
 * // JSON serialize a object into an string
 * var str = tinymce.util.JSON.serialize(obj);
 */
define("tinymce/util/JSON", [], function() {
	function serialize(o, quote) {
		var i, v, t, name;

		quote = quote || '"';

		if (o === null) {
			return 'null';
		}

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return quote + o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g, function(a, b) {
				// Make sure single quotes never get encoded inside double quotes for JSON compatibility
				if (quote === '"' && a === "'") {
					return a;
				}

				i = v.indexOf(b);

				if (i + 1) {
					return '\\' + v.charAt(i + 1);
				}

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + quote;
		}

		if (t == 'object') {
			if (o.hasOwnProperty && Object.prototype.toString.call(o) === '[object Array]') {
					for (i=0, v = '['; i<o.length; i++) {
						v += (i > 0 ? ',' : '') + serialize(o[i], quote);
					}

					return v + ']';
				}

				v = '{';

				for (name in o) {
					if (o.hasOwnProperty(name)) {
						v += typeof o[name] != 'function' ? (v.length > 1 ? ',' + quote : quote) + name +
							quote +':' + serialize(o[name], quote) : '';
					}
				}

				return v + '}';
		}

		return '' + o;
	}

	return {
		/**
		 * Serializes the specified object as a JSON string.
		 *
		 * @method serialize
		 * @param {Object} obj Object to serialize as a JSON string.
		 * @param {String} quote Optional quote string defaults to ".
		 * @return {string} JSON string serialized from input.
		 */
		serialize: serialize,

		/**
		 * Unserializes/parses the specified JSON string into a object.
		 *
		 * @method parse
		 * @param {string} s JSON String to parse into a JavaScript object.
		 * @return {Object} Object from input JSON string or undefined if it failed.
		 */
		parse: function(text) {
			try {
				// Trick uglify JS
				return window[String.fromCharCode(101) + 'val']('(' + text + ')');
			} catch (ex) {
				// Ignore
			}
		}

		/**#@-*/
	};
});

// Included from: js/tinymce/classes/util/JSONRequest.js

/**
 * JSONRequest.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to use JSON-RPC to call backend methods.
 *
 * @class tinymce.util.JSONRequest
 * @example
 * var json = new tinymce.util.JSONRequest({
 *     url: 'somebackend.php'
 * });
 *
 * // Send RPC call 1
 * json.send({
 *     method: 'someMethod1',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 *
 * // Send RPC call 2
 * json.send({
 *     method: 'someMethod2',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 */
define("tinymce/util/JSONRequest", [
	"tinymce/util/JSON",
	"tinymce/util/XHR",
	"tinymce/util/Tools"
], function(JSON, XHR, Tools) {
	var extend = Tools.extend;

	function JSONRequest(settings) {
		this.settings = extend({}, settings);
		this.count = 0;
	}

	/**
	 * Simple helper function to send a JSON-RPC request without the need to initialize an object.
	 * Consult the Wiki API documentation for more details on what you can pass to this function.
	 *
	 * @method sendRPC
	 * @static
	 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
	 */
	JSONRequest.sendRPC = function(o) {
		return new JSONRequest().send(o);
	};

	JSONRequest.prototype = {
		/**
		 * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
		 *
		 * @method send
		 * @param {Object} args Call object where there are three field id, method and params this object should also contain callbacks etc.
		 */
		send: function(args) {
			var ecb = args.error, scb = args.success;

			args = extend(this.settings, args);

			args.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error) {
					ecb.call(args.error_scope || args.scope, c.error, x);
				} else {
					scb.call(args.success_scope || args.scope, c.result);
				}
			};

			args.error = function(ty, x) {
				if (ecb) {
					ecb.call(args.error_scope || args.scope, ty, x);
				}
			};

			args.data = JSON.serialize({
				id: args.id || 'c' + (this.count++),
				method: args.method,
				params: args.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			args.content_type = 'application/json';

			XHR.send(args);
		}
	};

	return JSONRequest;
});

// Included from: js/tinymce/classes/util/JSONP.js

/**
 * JSONP.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/util/JSONP", [
	"tinymce/dom/DOMUtils"
], function(DOMUtils) {
	return {
		callbacks: {},
		count: 0,

		send: function(settings) {
			var self = this, dom = DOMUtils.DOM, count = settings.count !== undefined ? settings.count : self.count;
			var id = 'tinymce_jsonp_' + count;

			self.callbacks[count] = function(json) {
				dom.remove(id);
				delete self.callbacks[count];

				settings.callback(json);
			};

			dom.add(dom.doc.body, 'script', {
				id: id,
				src: settings.url,
				type: 'text/javascript'
			});

			self.count++;
		}
	};
});

// Included from: js/tinymce/classes/util/LocalStorage.js

/**
 * LocalStorage.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class will simulate LocalStorage on IE 7 and return the native version on modern browsers.
 * Storage is done using userData on IE 7 and a special serialization format. The format is designed
 * to be as small as possible by making sure that the keys and values doesn't need to be encoded. This
 * makes it possible to store for example HTML data.
 *
 * Storage format for userData:
 * <base 32 key length>,<key string>,<base 32 value length>,<value>,...
 *
 * For example this data key1=value1,key2=value2 would be:
 * 4,key1,6,value1,4,key2,6,value2
 *
 * @class tinymce.util.LocalStorage
 * @static
 * @version 4.0
 * @example
 * tinymce.util.LocalStorage.setItem('key', 'value');
 * var value = tinymce.util.LocalStorage.getItem('key');
 */
define("tinymce/util/LocalStorage", [], function() {
	var LocalStorage, storageElm, items, keys, userDataKey, hasOldIEDataSupport;

	// Check for native support
	try {
		if (window.localStorage) {
			return localStorage;
		}
	} catch (ex) {
		// Ignore
	}

	userDataKey = "tinymce";
	storageElm = document.documentElement;
	hasOldIEDataSupport = !!storageElm.addBehavior;

	if (hasOldIEDataSupport) {
		storageElm.addBehavior('#default#userData');
	}

	/**
	 * Gets the keys names and updates LocalStorage.length property. Since IE7 doesn't have any getters/setters.
	 */
	function updateKeys() {
		keys = [];

		for (var key in items) {
			keys.push(key);
		}

		LocalStorage.length = keys.length;
	}

	/**
	 * Loads the userData string and parses it into the items structure.
	 */
	function load() {
		var key, data, value, pos = 0;

		items = {};

		// localStorage can be disabled on WebKit/Gecko so make a dummy storage
		if (!hasOldIEDataSupport) {
			return;
		}

		function next(end) {
			var value, nextPos;

			nextPos = end !== undefined ? pos + end : data.indexOf(',', pos);
			if (nextPos === -1 || nextPos > data.length) {
				return null;
			}

			value = data.substring(pos, nextPos);
			pos = nextPos + 1;

			return value;
		}

		storageElm.load(userDataKey);
		data = storageElm.getAttribute(userDataKey) || '';

		do {
			var offset = next();
			if (offset === null) {
				break;
			}

			key = next(parseInt(offset, 32) || 0);
			if (key !== null) {
				offset = next();
				if (offset === null) {
					break;
				}

				value = next(parseInt(offset, 32) || 0);

				if (key) {
					items[key] = value;
				}
			}
		} while (key !== null);

		updateKeys();
	}

	/**
	 * Saves the items structure into a the userData format.
	 */
	function save() {
		var value, data = '';

		// localStorage can be disabled on WebKit/Gecko so make a dummy storage
		if (!hasOldIEDataSupport) {
			return;
		}

		for (var key in items) {
			value = items[key];
			data += (data ? ',' : '') + key.length.toString(32) + ',' + key + ',' + value.length.toString(32) + ',' + value;
		}

		storageElm.setAttribute(userDataKey, data);

		try {
			storageElm.save(userDataKey);
		} catch (ex) {
			// Ignore disk full
		}

		updateKeys();
	}

	LocalStorage = {
		/**
		 * Length of the number of items in storage.
		 *
		 * @property length
		 * @type Number
		 * @return {Number} Number of items in storage.
		 */
		//length:0,

		/**
		 * Returns the key name by index.
		 *
		 * @method key
		 * @param {Number} index Index of key to return.
		 * @return {String} Key value or null if it wasn't found.
		 */
		key: function(index) {
			return keys[index];
		},

		/**
		 * Returns the value if the specified key or null if it wasn't found.
		 *
		 * @method getItem
		 * @param {String} key Key of item to retrive.
		 * @return {String} Value of the specified item or null if it wasn't found.
		 */
		getItem: function(key) {
			return key in items ? items[key] : null;
		},

		/**
		 * Sets the value of the specified item by it's key.
		 *
		 * @method setItem
		 * @param {String} key Key of the item to set.
		 * @param {String} value Value of the item to set.
		 */
		setItem: function(key, value) {
			items[key] = "" + value;
			save();
		},

		/**
		 * Removes the specified item by key.
		 *
		 * @method removeItem
		 * @param {String} key Key of item to remove.
		 */
		removeItem: function(key) {
			delete items[key];
			save();
		},

		/**
		 * Removes all items.
		 *
		 * @method clear
		 */
		clear: function() {
			items = {};
			save();
		}
	};

	load();

	return LocalStorage;
});

// Included from: js/tinymce/classes/Compat.js

/**
 * Compat.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TinyMCE core class.
 *
 * @static
 * @class tinymce
 * @borrow-members tinymce.EditorManager
 * @borrow-members tinymce.util.Tools
 */
define("tinymce/Compat", [
	"tinymce/dom/DOMUtils",
	"tinymce/dom/EventUtils",
	"tinymce/dom/ScriptLoader",
	"tinymce/AddOnManager",
	"tinymce/util/Tools",
	"tinymce/Env"
], function(DOMUtils, EventUtils, ScriptLoader, AddOnManager, Tools, Env) {
	var tinymce = window.tinymce;

	/**
	 * @property {tinymce.dom.DOMUtils} DOM Global DOM instance.
	 * @property {tinymce.dom.ScriptLoader} ScriptLoader Global ScriptLoader instance.
	 * @property {tinymce.AddOnManager} PluginManager Global PluginManager instance.
	 * @property {tinymce.AddOnManager} ThemeManager Global ThemeManager instance.
	 */
	tinymce.DOM = DOMUtils.DOM;
	tinymce.ScriptLoader = ScriptLoader.ScriptLoader;
	tinymce.PluginManager = AddOnManager.PluginManager;
	tinymce.ThemeManager = AddOnManager.ThemeManager;

	tinymce.dom = tinymce.dom || {};
	tinymce.dom.Event = EventUtils.Event;

	Tools.each(Tools, function(func, key) {
		tinymce[key] = func;
	});

	Tools.each('isOpera isWebKit isIE isGecko isMac'.split(' '), function(name) {
		tinymce[name] = Env[name.substr(2).toLowerCase()];
	});

	return {};
});

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

// Included from: js/tinymce/classes/ui/Layout.js

/**
 * Layout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Base layout manager class.
 *
 * @class tinymce.ui.Layout
 */
define("tinymce/ui/Layout", [
	"tinymce/util/Class",
	"tinymce/util/Tools"
], function(Class, Tools) {
	"use strict";

	return Class.extend({
		Defaults: {
			firstControlClass: 'first',
			lastControlClass: 'last'
		},

		/**
		 * Constructs a layout instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this.settings = Tools.extend({}, this.Defaults, settings);
		},

		/**
		 * This method gets invoked before the layout renders the controls.
		 *
		 * @method preRender
		 * @param {tinymce.ui.Container} container Container instance to preRender.
		 */
		preRender: function(container) {
			container.addClass(this.settings.containerClass, 'body');
		},

		/**
		 * Applies layout classes to the container.
		 *
		 * @private
		 */
		applyClasses: function(container) {
			var self = this, settings = self.settings, items, firstClass, lastClass;

			items = container.items().filter(':visible');
			firstClass = settings.firstControlClass;
			lastClass = settings.lastControlClass;

			items.each(function(item) {
				item.removeClass(firstClass).removeClass(lastClass);

				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}
			});

			items.eq(0).addClass(firstClass);
			items.eq(-1).addClass(lastClass);
		},

		/**
		 * Renders the specified container and any layout specific HTML.
		 *
		 * @method renderHtml
		 * @param {tinymce.ui.Container} container Container to render HTML for.
		 */
		renderHtml: function(container) {
			var self = this, settings = self.settings, items, html = '';

			items = container.items();
			items.eq(0).addClass(settings.firstControlClass);
			items.eq(-1).addClass(settings.lastControlClass);

			items.each(function(item) {
				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}

				html += item.renderHtml();
			});

			return html;
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function() {
		},

		/**
		 * This method gets invoked after the layout renders the controls.
		 *
		 * @method postRender
		 * @param {tinymce.ui.Container} container Container instance to postRender.
		 */
		postRender: function() {
		}
	});
});

// Included from: js/tinymce/classes/ui/AbsoluteLayout.js

/**
 * AbsoluteLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * LayoutManager for absolute positioning. This layout manager is more of
 * a base class for other layouts but can be created and used directly.
 *
 * @-x-less AbsoluteLayout.less
 * @class tinymce.ui.AbsoluteLayout
 * @extends tinymce.ui.Layout
 */
define("tinymce/ui/AbsoluteLayout", [
	"tinymce/ui/Layout"
], function(Layout) {
	"use strict";

	return Layout.extend({
		Defaults: {
			containerClass: 'abs-layout',
			controlClass: 'abs-layout-item'
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			container.items().filter(':visible').each(function(ctrl) {
				var settings = ctrl.settings;

				ctrl.layoutRect({
					x: settings.x,
					y: settings.y,
					w: settings.w,
					h: settings.h
				});

				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		},

		/**
		 * Renders the specified container and any layout specific HTML.
		 *
		 * @method renderHtml
		 * @param {tinymce.ui.Container} container Container to render HTML for.
		 */
		renderHtml: function(container) {
			return '<div id="' + container._id + '-absend" class="' + container.classPrefix + 'abs-end"></div>' + this._super(container);
		}
	});
});

// Included from: js/tinymce/classes/ui/Tooltip.js

/**
 * Tooltip.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a tooltip instance.
 *
 * @-x-less ToolTip.less
 * @class tinymce.ui.ToolTip
 * @extends tinymce.ui.Control
 * @mixes tinymce.ui.Movable
 */
define("tinymce/ui/Tooltip", [
	"tinymce/ui/Control",
	"tinymce/ui/Movable"
], function(Control, Movable) {
	return Control.extend({
		Mixins: [Movable],

		Defaults: {
			classes: 'widget tooltip tooltip-n'
		},

		/**
		 * Sets/gets the current label text.
		 *
		 * @method text
		 * @param {String} [text] New label text.
		 * @return {String|tinymce.ui.Tooltip} Current text or current label instance.
		 */
		text: function(value) {
			var self = this;

			if (typeof(value) != "undefined") {
				self._value = value;

				if (self._rendered) {
					self.getEl().lastChild.innerHTML = self.encode(value);
				}

				return self;
			}

			return self._value;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, prefix = self.classPrefix;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" role="presentation">' +
					'<div class="' + prefix + 'tooltip-arrow"></div>' +
					'<div class="' + prefix + 'tooltip-inner">' + self.encode(self._text) + '</div>' +
				'</div>'
			);
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, style, rect;

			style = self.getEl().style;
			rect = self._layoutRect;

			style.left = rect.x + 'px';
			style.top = rect.y + 'px';
			style.zIndex = 0xFFFF + 0xFFFF;
		}
	});
});

// Included from: js/tinymce/classes/ui/Widget.js

/**
 * Widget.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Widget base class a widget is a control that has a tooltip and some basic states.
 *
 * @class tinymce.ui.Widget
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Widget", [
	"tinymce/ui/Control",
	"tinymce/ui/Tooltip"
], function(Control, Tooltip) {
	"use strict";

	var tooltip;

	var Widget = Control.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} tooltip Tooltip text to display when hovering.
		 * @setting {Boolean} autofocus True if the control should be focused when rendered.
		 * @setting {String} text Text to display inside widget.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.canFocus = true;

			if (settings.tooltip && Widget.tooltips !== false) {
				self.on('mouseenter', function(e) {
					var tooltip = self.tooltip().moveTo(-0xFFFF);

					if (e.control == self) {
						var rel = tooltip.text(settings.tooltip).show().testMoveRel(self.getEl(), ['bc-tc', 'bc-tl', 'bc-tr']);

						tooltip.toggleClass('tooltip-n', rel == 'bc-tc');
						tooltip.toggleClass('tooltip-nw', rel == 'bc-tl');
						tooltip.toggleClass('tooltip-ne', rel == 'bc-tr');

						tooltip.moveRel(self.getEl(), rel);
					} else {
						tooltip.hide();
					}
				});

				self.on('mouseleave mousedown click', function() {
					self.tooltip().hide();
				});

			}

			self.aria('label', settings.tooltip);
		},

		/**
		 * Returns the current tooltip instance.
		 *
		 * @method tooltip
		 * @return {tinymce.ui.Tooltip} Tooltip instance.
		 */
		tooltip: function() {
			var self = this;

			if (!tooltip) {
				tooltip = new Tooltip({type: 'tooltip'});
				tooltip.renderTo(self.getContainerElm());
			}

			return tooltip;
		},

		/**
		 * Sets/gets the active state of the widget.
		 *
		 * @method active
		 * @param {Boolean} [state] State if the control is active.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		active: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('pressed', state);
				self.toggleClass('active', state);
			}

			return self._super(state);
		},

		/**
		 * Sets/gets the disabled state of the widget.
		 *
		 * @method disabled
		 * @param {Boolean} [state] State if the control is disabled.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		disabled: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('disabled', state);
				self.toggleClass('disabled', state);
			}

			return self._super(state);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, settings = self.settings;

			self._rendered = true;

			self._super();

			if (!self.parent() && (settings.width || settings.height)) {
				self.initLayoutRect();
				self.repaint();
			}

			if (settings.autofocus) {
				setTimeout(function() {
					self.focus();
				}, 0);
			}
		},

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			this._super();

			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		}
	});

	return Widget;
});

// Included from: js/tinymce/classes/ui/Button.js

/**
 * Button.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to create buttons. You can create them directly or through the Factory.
 *
 * @example
 * // Create and render a button to the body element
 * tinymce.ui.Factory.create({
 *     type: 'button',
 *     text: 'My button'
 * }).renderTo(document.body);
 *
 * @-x-less Button.less
 * @class tinymce.ui.Button
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Button", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "widget btn",
			role: "button"
		},

		/**
		 * Constructs a new button instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} size Size of the button small|medium|large.
		 * @setting {String} image Image to use for icon.
		 * @setting {String} icon Icon to use for button.
		 */
		init: function(settings) {
			var self = this, size;

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self._super(settings);
			size = settings.size;

			if (settings.subtype) {
				self.addClass(settings.subtype);
			}

			if (size) {
				self.addClass('btn-' + size);
			}
		},

		/**
		 * Sets/gets the current button icon.
		 *
		 * @method icon
		 * @param {String} [icon] New icon identifier.
		 * @return {String|tinymce.ui.MenuButton} Current icon or current MenuButton instance.
		 */
		icon: function(icon) {
			var self = this, prefix = self.classPrefix;

			if (typeof(icon) == 'undefined') {
				return self.settings.icon;
			}

			self.settings.icon = icon;
			icon = icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			if (self._rendered) {
				var btnElm = self.getEl().firstChild, iconElm = btnElm.getElementsByTagName('i')[0];

				if (icon) {
					if (!iconElm || iconElm != btnElm.firstChild) {
						iconElm = document.createElement('i');
						btnElm.insertBefore(iconElm, btnElm.firstChild);
					}

					iconElm.className = icon;
				} else if (iconElm) {
					btnElm.removeChild(iconElm);
				}

				self.text(self._text); // Set text again to fix whitespace between icon + text
			}

			return self;
		},

		/**
		 * Repaints the button for example after it's been resizes by a layout engine.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var btnStyle = this.getEl().firstChild.style;

			btnStyle.width = btnStyle.height = "100%";

			this._super();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon, image = '';

			if (self.settings.image) {
				icon = 'none';
				image = ' style="background-image: url(\'' + self.settings.image + '\')"';
			}

			icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button role="presentation" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						(self._text ? (icon ? '\u00a0' : '') + self.encode(self._text) : '') +
					'</button>' +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/ButtonGroup.js

/**
 * ButtonGroup.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control enables you to put multiple buttons into a group. This is
 * useful when you want to combine similar toolbar buttons into a group.
 *
 * @example
 * // Create and render a buttongroup with two buttons to the body element
 * tinymce.ui.Factory.create({
 *     type: 'buttongroup',
 *     items: [
 *         {text: 'Button A'},
 *         {text: 'Button B'}
 *     ]
 * }).renderTo(document.body);
 *
 * @-x-less ButtonGroup.less
 * @class tinymce.ui.ButtonGroup
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/ButtonGroup", [
	"tinymce/ui/Container"
], function(Container) {
	"use strict";

	return Container.extend({
		Defaults: {
			defaultType: 'button',
			role: 'toolbar'
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout;

			self.addClass('btn-group');
			self.preRender();
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">'+
					'<div id="' + self._id + '-body">'+
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/Checkbox.js

/**
 * Checkbox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates a custom checkbox.
 *
 * @example
 * // Create and render a checkbox to the body element
 * tinymce.ui.Factory.create({
 *     type: 'checkbox',
 *     checked: true,
 *     text: 'My checkbox'
 * }).renderTo(document.body);
 *
 * @-x-less Checkbox.less
 * @class tinymce.ui.Checkbox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Checkbox", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "checkbox",
			role: "checkbox",
			checked: false
		},

		/**
		 * Constructs a new Checkbox instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} checked True if the checkbox should be checked by default.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self.on('click', function(e) {
				e.preventDefault();

				if (!self.disabled()) {
					self.checked(!self.checked());
				}
			});

			self.checked(self.settings.checked);
		},

		/**
		 * Getter/setter function for the checked state.
		 *
		 * @method checked
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		checked: function(state) {
			var self = this;

			if (typeof state != "undefined") {
				if (state) {
					self.addClass('checked');
				} else {
					self.removeClass('checked');
				}

				self._checked = state;
				self.aria('checked', state);

				return self;
			}

			return self._checked;
		},

		/**
		 * Getter/setter function for the value state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		value: function(state) {
			return this.checked(state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes() + '" unselectable="on" aria-labelledby="' + id + '-al" tabindex="-1">' +
					'<i class="' + prefix + 'ico ' + prefix + 'i-checkbox"></i>' +
					'<span id="' + id +'-al" class="' + prefix + 'label">' + self.encode(self._text) + '</span>' +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/PanelButton.js

/**
 * PanelButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new panel button.
 *
 * @class tinymce.ui.PanelButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/PanelButton", [
	"tinymce/ui/Button",
	"tinymce/ui/FloatPanel"
], function(Button, FloatPanel) {
	"use strict";

	return Button.extend({
		/**
		 * Shows the panel for the button.
		 *
		 * @method showPanel
		 */
		showPanel: function() {
			var self = this, settings = self.settings;

			self.active(true);

			if (!self.panel) {
				var panelSettings = settings.panel;

				// Wrap panel in grid layout if type if specified
				// This makes it possible to add forms or other containers directly in the panel option
				if (panelSettings.type) {
					panelSettings = {
						layout: 'grid',
						items: panelSettings
					};
				}

				panelSettings.popover = true;
				panelSettings.autohide = true;

				self.panel = new FloatPanel(panelSettings).on('hide', function() {
					self.active(false);
				}).parent(self).renderTo(self.getContainerElm());
				self.panel.fire('show');
				self.panel.reflow();
			} else {
				self.panel.show();
			}

			self.panel.moveRel(self.getEl(), settings.popoverAlign || (self.isRtl() ? ['bc-tr', 'bc-tc'] : ['bc-tl', 'bc-tc']));
		},

		/**
		 * Hides the panel for the button.
		 *
		 * @method hidePanel
		 */
		hidePanel: function() {
			var self = this;

			if (self.panel) {
				self.panel.hide();
			}
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self.on('click', function(e) {
				if (e.control === self) {
					if (self.panel && self.panel.visible()) {
						self.hidePanel();
					} else {
						self.showPanel();
					}
				}
			});

			return self._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/ColorButton.js

/**
 * ColorButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a color button control. This is a split button in which the main
 * button has a visual representation of the currently selected color. When clicked 
 * the caret button displays a color picker, allowing the user to select a new color.
 *
 * @-x-less ColorButton.less
 * @class tinymce.ui.ColorButton
 * @extends tinymce.ui.PanelButton
 */
define("tinymce/ui/ColorButton", [
	"tinymce/ui/PanelButton",
	"tinymce/dom/DOMUtils"
], function(PanelButton, DomUtils) {
	"use strict";
	
	var DOM = DomUtils.DOM;

	return PanelButton.extend({
		/**
		 * Constructs a new ColorButton instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this._super(settings);
			this.addClass('colorbutton');
		},

		/**
		 * Getter/setter for the current color.
		 *
		 * @method color
		 * @param {String} [color] Color to set.
		 * @return {String|tinymce.ui.ColorButton} Current color or current instance.
		 */
		color: function(color) {
			if (color) {
				this._color = color;
				this.getEl('preview').style.backgroundColor = color;
				return this;
			}

			return this._color;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
			var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '">' +
					'<button role="presentation" hidefocus type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						'<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
						(self._text ? (icon ? ' ' : '') + (self._text) : '') +
					'</button>' +
					'<button type="button" class="' + prefix + 'open" hidefocus tabindex="-1">' +
						' <i class="' + prefix + 'caret"></i>' +
					'</button>' +
				'</div>'
			);
		},
		
		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, onClickHandler = self.settings.onclick;

			self.on('click', function(e) {
				if (e.control == self && !DOM.getParent(e.target, '.' + self.classPrefix + 'open')) {
					e.stopImmediatePropagation();
					onClickHandler.call(self, e);
				}
			});

			delete self.settings.onclick;

			return self._super();
		}
		
	});
});

// Included from: js/tinymce/classes/ui/ComboBox.js

/**
 * ComboBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a combobox control. Select box that you select a value from or
 * type a value into.
 *
 * @-x-less ComboBox.less
 * @class tinymce.ui.ComboBox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/ComboBox", [
	"tinymce/ui/Widget",
	"tinymce/ui/Factory",
	"tinymce/ui/DomUtils"
], function(Widget, Factory, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} placeholder Placeholder text to display.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('combobox');
			self.subinput = true;

			settings = self.settings;
			settings.menu = settings.menu || settings.values;

			if (settings.menu) {
				settings.icon = 'caret';
			}

			self.on('click', function(e) {
				var elm = e.target;

				while (elm) {
					if (elm.id && elm.id.indexOf('-open') != -1) {
						self.fire('action');

						if (settings.menu) {
							self.showMenu();

							if (e.keyboard) {
								self.menu.items()[0].focus();
							}
						}
					}

					elm = elm.parentNode;
				}
			});

			// TODO: Rework this
			self.on('keydown', function(e) {
				if (e.target.nodeName == "INPUT" && e.keyCode == 13) {
					self.parents().reverse().each(function(ctrl) {
						e.preventDefault();
						self.fire('change');

						if (ctrl.hasEventListeners('submit') && ctrl.toJSON) {
							ctrl.fire('submit', {data: ctrl.toJSON()});
							return false;
						}
					});
				}
			});

			if (settings.placeholder) {
				self.addClass('placeholder');

				self.on('focusin', function() {
					if (!self._hasOnChange) {
						DomUtils.on(self.getEl('inp'), 'change', function() {
							self.fire('change');
						});

						self._hasOnChange = true;
					}

					if (self.hasClass('placeholder')) {
						self.getEl('inp').value = '';
						self.removeClass('placeholder');
					}
				});

				self.on('focusout', function() {
					if (self.value().length === 0) {
						self.getEl('inp').value = settings.placeholder;
						self.addClass('placeholder');
					}
				});
			}
		},

		showMenu: function() {
			var self = this, settings = self.settings, menu;

			if (!self.menu) {
				menu = settings.menu || [];

				// Is menu array then auto constuct menu control
				if (menu.length) {
					menu = {
						type: 'menu',
						items: menu
					};
				} else {
					menu.type = menu.type || 'menu';
				}

				self.menu = Factory.create(menu).parent(self).renderTo(self.getContainerElm());
				self.fire('createmenu');
				self.menu.reflow();
				self.menu.on('cancel', function(e) {
					if (e.control === self.menu) {
						self.focus();
					}
				});

				self.menu.on('show hide', function(e) {
					e.control.items().each(function(ctrl) {
						ctrl.active(ctrl.value() == self.value());
					});
				}).fire('show');

				self.menu.on('select', function(e) {
					self.value(e.control.value());
				});

				self.on('focusin', function(e) {
					if (e.target.tagName == 'INPUT') {
						self.menu.hide();
					}
				});

				self.aria('expanded', true);
			}

			self.menu.show();
			self.menu.layoutRect({w: self.layoutRect().w});
			self.menu.moveRel(self.getEl(), self.isRtl() ? ['br-tr', 'tr-br'] : ['bl-tl', 'tl-bl']);
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {String|tinymce.ui.ComboBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this;

			if (typeof(value) != "undefined") {
				self._value = value;
				self.removeClass('placeholder');

				if (self._rendered) {
					self.getEl('inp').value = value;
				}

				return self;
			}

			if (self._rendered) {
				value = self.getEl('inp').value;

				if (value != self.settings.placeholder) {
					return value;
				}

				return '';
			}

			return self._value;
		},

		/**
		 * Getter/setter function for the disabled state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.ComboBox} True/false or self if it's a set operation.
		 */
		disabled: function(state) {
			var self = this;

			if (self._rendered && typeof(state) != 'undefined') {
				self.getEl('inp').disabled = state;
			}

			return self._super(state);
		},

		/**
		 * Focuses the input area of the control.
		 *
		 * @method focus
		 */
		focus: function() {
			this.getEl('inp').focus();
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, elm = self.getEl(), openElm = self.getEl('open'), rect = self.layoutRect();
			var width, lineHeight;

			if (openElm) {
				width = rect.w - DomUtils.getSize(openElm).width - 10;
			} else {
				width = rect.w - 10;
			}

			// Detect old IE 7+8 add lineHeight to align caret vertically in the middle
			var doc = document;
			if (doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
				lineHeight = (self.layoutRect().h - 2) + 'px';
			}

			DomUtils.css(elm.firstChild, {
				width: width,
				lineHeight: lineHeight
			});

			self._super();

			return self;
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ComboBox} Current combobox instance.
		 */
		postRender: function() {
			var self = this;

			DomUtils.on(this.getEl('inp'), 'change', function() {
				self.fire('change');
			});

			return self._super();
		},

		remove: function() {
			DomUtils.off(this.getEl('inp'));
			this._super();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix;
			var value = settings.value || settings.placeholder || '';
			var icon, text, openBtnHtml = '', extraAttrs = '';

			if ("spellcheck" in settings) {
				extraAttrs += ' spellcheck="' + settings.spellcheck + '"';
			}

			if (settings.maxLength) {
				extraAttrs += ' maxlength="' + settings.maxLength + '"';
			}

			if (settings.size) {
				extraAttrs += ' size="' + settings.size + '"';
			}

			if (settings.subtype) {
				extraAttrs += ' type="' + settings.subtype + '"';
			}

			if (self.disabled()) {
				extraAttrs += ' disabled="disabled"';
			}

			icon = settings.icon;
			if (icon && icon != 'caret') {
				icon = prefix + 'ico ' + prefix + 'i-' + settings.icon;
			}

			text = self._text;

			if (icon || text) {
				openBtnHtml = (
					'<div id="' + id + '-open" class="' + prefix + 'btn ' + prefix + 'open" tabIndex="-1">' +
						'<button id="' + id + '-action" type="button" hidefocus tabindex="-1">' +
							(icon != 'caret' ? '<i class="' + icon + '"></i>' : '<i class="' + prefix + 'caret"></i>') +
							(text ? (icon ? ' ' : '') + text : '') +
						'</button>' +
					'</div>'
				);

				self.addClass('has-open');
			}

			return (
				'<div id="' + id + '" class="' + self.classes() + '">' +
					'<input id="' + id + '-inp" class="' + prefix + 'textbox ' + prefix + 'placeholder" value="' +
					value + '" hidefocus="true"' + extraAttrs + '>' +
					openBtnHtml +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/Path.js

/**
 * Path.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new path control.
 *
 * @-x-less Path.less
 * @class tinymce.ui.Path
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Path", [
	"tinymce/ui/Widget",
	"tinymce/ui/KeyboardNavigation"
], function(Widget, KeyboardNavigation) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} delimiter Delimiter to display between items in path.
		 */
		init: function(settings) {
			var self = this;

			if (!settings.delimiter) {
				settings.delimiter = '\u00BB';
			}

			self._super(settings);
			self.addClass('path');
			self.canFocus = true;

			self.on('click', function(e) {
				var index, target = e.target;

				if ((index = target.getAttribute('data-index'))) {
					self.fire('select', {value: self.data()[index], index: index});
				}
			});
		},

		/**
		 * Focuses the current control.
		 *
		 * @method focus
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		focus: function() {
			var self = this;

			self.keyNav = new KeyboardNavigation({
				root: self,
				enableLeftRight: true
			});

			self.keyNav.focusFirst();

			return self;
		},

		/**
		 * Sets/gets the data to be used for the path.
		 *
		 * @method data
		 * @param {Array} data Array with items name is rendered to path.
		 */
		data: function(data) {
			var self = this;

			if (typeof(data) !== "undefined") {
				self._data = data;
				self.update();

				return self;
			}

			return self._data;
		},

		/**
		 * Updated the path.
		 *
		 * @private
		 */
		update: function() {
			this.innerHtml(this._getPathHtml());
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.data(self.settings.data);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">' +
					self._getPathHtml() +
				'</div>'
			);
		},

		_getPathHtml: function() {
			var self = this, parts = self._data || [], i, l, html = '', prefix = self.classPrefix;

			for (i = 0, l = parts.length; i < l; i++) {
				html += (
					(i > 0 ? '<div class="'+ prefix + 'divider" aria-hidden="true"> ' + self.settings.delimiter + ' </div>' : '') +
					'<div role="button" class="' + prefix + 'path-item' + (i == l - 1 ? ' ' + prefix + 'last' : '') + '" data-index="' +
					i + '" tabindex="-1" id="' + self._id + '-' + i +'">' + parts[i].name + '</div>'
				);
			}

			if (!html) {
				html = '<div class="' + prefix + 'path-item">&nbsp;</div>';
			}

			return html;
		}
	});
});

// Included from: js/tinymce/classes/ui/ElementPath.js

/**
 * ElementPath.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates an path for the current selections parent elements in TinyMCE.
 *
 * @class tinymce.ui.ElementPath
 * @extends tinymce.ui.Path
 */
define("tinymce/ui/ElementPath", [
	"tinymce/ui/Path",
	"tinymce/EditorManager"
], function(Path, EditorManager) {
	return Path.extend({
		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ElementPath} Current combobox instance.
		 */
		postRender: function() {
			var self = this, editor = EditorManager.activeEditor;

			function isHidden(elm) {
				if (elm.nodeType === 1) {
					if (elm.nodeName == "BR" || !!elm.getAttribute('data-mce-bogus')) {
						return true;
					}

					if (elm.getAttribute('data-mce-type') === 'bookmark') {
						return true;
					}
				}

				return false;
			}

			self.on('select', function(e) {
				var parents = [], node, body = editor.getBody();

				editor.focus();

				node = editor.selection.getStart();
				while (node && node != body) {
					if (!isHidden(node)) {
						parents.push(node);
					}

					node = node.parentNode;
				}

				editor.selection.select(parents[parents.length - 1 - e.index]);
				editor.nodeChanged();
			});

			editor.on('nodeChange', function(e) {
				var parents = [], selectionParents = e.parents, i = selectionParents.length;

				while (i--) {
					if (selectionParents[i].nodeType == 1 && !isHidden(selectionParents[i])) {
						var args = editor.fire('ResolveName', {
							name: selectionParents[i].nodeName.toLowerCase(),
							target: selectionParents[i]
						});

						parents.push({name: args.name});
					}
				}

				self.data(parents);
			});

			return self._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/FormItem.js

/**
 * FormItem.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is a container created by the form element with
 * a label and control item.
 *
 * @class tinymce.ui.FormItem
 * @extends tinymce.ui.Container
 * @setting {String} label Label to display for the form item.
 */
define("tinymce/ui/FormItem", [
	"tinymce/ui/Container"
], function(Container) {
	"use strict";

	return Container.extend({
		Defaults: {
			layout: 'flex',
			align: 'center',
			defaults: {
				flex: 1
			}
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, prefix = self.classPrefix;

			self.addClass('formitem');
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self.settings.title ? ('<div id="' + self._id + '-title" class="' + prefix + 'title">' +
						self.settings.title + '</div>') : '') +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/Form.js

/**
 * Form.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a form container. A form container has the ability
 * to automatically wrap items in tinymce.ui.FormItem instances.
 *
 * Each FormItem instance is a container for the label and the item.
 *
 * @example
 * tinymce.ui.Factory.create({
 *     type: 'form',
 *     items: [
 *         {type: 'textbox', label: 'My text box'}
 *     ]
 * }).renderTo(document.body);
 *
 * @class tinymce.ui.Form
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/Form", [
	"tinymce/ui/Container",
	"tinymce/ui/FormItem"
], function(Container, FormItem) {
	"use strict";

	return Container.extend({
		Defaults: {
			containerCls: 'form',
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			flex: 1,
			padding: 20,
			labelGap: 30,
			spacing: 10,
			callbacks: {
				submit: function() {
					this.submit();
				}
			}
		},

		/**
		 * This method gets invoked before the control is rendered.
		 *
		 * @method preRender
		 */
		preRender: function() {
			var self = this, items = self.items();

			// Wrap any labeled items in FormItems
			items.each(function(ctrl) {
				var formItem, label = ctrl.settings.label;

				if (label) {
					formItem = new FormItem({
						layout: 'flex',
						autoResize: "overflow",
						defaults: {flex: 1},
						items: [
							{type: 'label', text: label, flex: 0, forId: ctrl._id, disabled: ctrl.disabled()}
						]
					});

					formItem.type = 'formitem';

					if (typeof(ctrl.settings.flex) == "undefined") {
						ctrl.settings.flex = 1;
					}

					self.replace(ctrl, formItem);
					formItem.add(ctrl);
				}
			});
		},

		/**
		 * Recalcs label widths.
		 *
		 * @private
		 */
		recalcLabels: function() {
			var self = this, maxLabelWidth = 0, labels = [], i, labelGap;

			if (self.settings.labelGapCalc === false) {
				return;
			}

			self.items().filter('formitem').each(function(item) {
				var labelCtrl = item.items()[0], labelWidth = labelCtrl.getEl().clientWidth;

				maxLabelWidth = labelWidth > maxLabelWidth ? labelWidth : maxLabelWidth;
				labels.push(labelCtrl);
			});

			labelGap = self.settings.labelGap || 0;

			i = labels.length;
			while (i--) {
				labels[i].settings.minWidth = maxLabelWidth + labelGap;
			}
		},

		/**
		 * Getter/setter for the visibility state.
		 *
		 * @method visible
		 * @param {Boolean} [state] True/false state to show/hide.
		 * @return {tinymce.ui.Form|Boolean} True/false state or current control.
		 */
		visible: function(state) {
			var val = this._super(state);

			if (state === true && this._rendered) {
				this.recalcLabels();
			}

			return val;
		},

		/**
		 * Fires a submit event with the serialized form.
		 *
		 * @method submit
		 * @return {Object} Event arguments object.
		 */
		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ComboBox} Current combobox instance.
		 */
		postRender: function() {
			var self = this;

			self._super();
			self.recalcLabels();
			self.fromJSON(self.settings.data);
		}
	});
});

// Included from: js/tinymce/classes/ui/FieldSet.js

/**
 * FieldSet.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates fieldset containers.
 *
 * @-x-less FieldSet.less
 * @class tinymce.ui.FieldSet
 * @extends tinymce.ui.Form
 */
define("tinymce/ui/FieldSet", [
	"tinymce/ui/Form"
], function(Form) {
	"use strict";

	return Form.extend({
		Defaults: {
			containerCls: 'fieldset',
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			flex: 1,
			padding: "25 15 5 15",
			labelGap: 30,
			spacing: 10,
			border: 1
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, prefix = self.classPrefix;

			self.preRender();
			layout.preRender(self);

			return (
				'<fieldset id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self.settings.title ? ('<legend id="' + self._id + '-title" class="' + prefix + 'fieldset-title">' +
						self.settings.title + '</legend>') : '') +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</fieldset>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/FilePicker.js

/**
 * FilePicker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class creates a file picker control.
 *
 * @class tinymce.ui.FilePicker
 * @extends tinymce.ui.ComboBox
 */
define("tinymce/ui/FilePicker", [
	"tinymce/ui/ComboBox"
], function(ComboBox) {
	"use strict";

	return ComboBox.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this, editor = tinymce.activeEditor, fileBrowserCallback;

			settings.spellcheck = false;

			fileBrowserCallback = editor.settings.file_browser_callback;
			if (fileBrowserCallback) {
				settings.icon = 'browse';

				settings.onaction = function() {
					fileBrowserCallback(
						self.getEl('inp').id,
						self.getEl('inp').value,
						settings.filetype,
						window
					);
				};
			}

			self._super(settings);
		}
	});
});

// Included from: js/tinymce/classes/ui/FitLayout.js

/**
 * FitLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager will resize the control to be the size of it's parent container.
 * In other words width: 100% and height: 100%.
 *
 * @-x-less FitLayout.less
 * @class tinymce.ui.FitLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/FitLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			var contLayoutRect = container.layoutRect(), paddingBox = container.paddingBox();

			container.items().filter(':visible').each(function(ctrl) {
				ctrl.layoutRect({
					x: paddingBox.left,
					y: paddingBox.top,
					w: contLayoutRect.innerW - paddingBox.right - paddingBox.left,
					h: contLayoutRect.innerH - paddingBox.top - paddingBox.bottom
				});

				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		}
	});
});

// Included from: js/tinymce/classes/ui/FlexLayout.js

/**
 * FlexLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager works similar to the CSS flex box.
 *
 * @setting {String} direction row|row-reverse|column|column-reverse
 * @setting {Number} flex A positive-number to flex by.
 * @setting {String} align start|end|center|stretch
 * @setting {String} pack start|end|justify
 *
 * @class tinymce.ui.FlexLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/FlexLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			// A ton of variables, needs to be in the same scope for performance
			var i, l, items, contLayoutRect, contPaddingBox, contSettings, align, pack, spacing, totalFlex, availableSpace, direction;
			var ctrl, ctrlLayoutRect, ctrlSettings, flex, maxSizeItems = [], size, maxSize, ratio, rect, pos, maxAlignEndPos;
			var sizeName, minSizeName, posName, maxSizeName, beforeName, innerSizeName, afterName, deltaSizeName, contentSizeName;
			var alignAxisName, alignInnerSizeName, alignSizeName, alignMinSizeName, alignMaxSizeName, alignBeforeName, alignAfterName;
			var alignDeltaSizeName, alignContentSizeName;
			var max = Math.max, min = Math.min;

			// Get container items, properties and settings
			items = container.items().filter(':visible');
			contLayoutRect = container.layoutRect();
			contPaddingBox = container._paddingBox;
			contSettings = container.settings;
			direction = container.isRtl() ? (contSettings.direction || 'row-reversed') : contSettings.direction;
			align = contSettings.align;
			pack = container.isRtl() ? (contSettings.pack || 'end') : contSettings.pack;
			spacing = contSettings.spacing || 0;

			if (direction == "row-reversed" || direction == "column-reverse") {
				items = items.set(items.toArray().reverse());
				direction = direction.split('-')[0];
			}

			// Setup axis variable name for row/column direction since the calculations is the same
			if (direction == "column") {
				posName = "y";
				sizeName = "h";
				minSizeName = "minH";
				maxSizeName = "maxH";
				innerSizeName = "innerH";
				beforeName = 'top';
				afterName = 'bottom';
				deltaSizeName = "deltaH";
				contentSizeName = "contentH";

				alignBeforeName = "left";
				alignSizeName = "w";
				alignAxisName = "x";
				alignInnerSizeName = "innerW";
				alignMinSizeName = "minW";
				alignMaxSizeName = "maxW";
				alignAfterName = "right";
				alignDeltaSizeName = "deltaW";
				alignContentSizeName = "contentW";
			} else {
				posName = "x";
				sizeName = "w";
				minSizeName = "minW";
				maxSizeName = "maxW";
				innerSizeName = "innerW";
				beforeName = 'left';
				afterName = 'right';
				deltaSizeName = "deltaW";
				contentSizeName = "contentW";

				alignBeforeName = "top";
				alignSizeName = "h";
				alignAxisName = "y";
				alignInnerSizeName = "innerH";
				alignMinSizeName = "minH";
				alignMaxSizeName = "maxH";
				alignAfterName = "bottom";
				alignDeltaSizeName = "deltaH";
				alignContentSizeName = "contentH";
			}

			// Figure out total flex, availableSpace and collect any max size elements
			availableSpace = contLayoutRect[innerSizeName] - contPaddingBox[beforeName] - contPaddingBox[beforeName];
			maxAlignEndPos = totalFlex = 0;
			for (i = 0, l = items.length; i < l; i++) {
				ctrl = items[i];
				ctrlLayoutRect = ctrl.layoutRect();
				ctrlSettings = ctrl.settings;
				flex = ctrlSettings.flex;
				availableSpace -= (i < l - 1 ? spacing : 0);

				if (flex > 0) {
					totalFlex += flex;

					// Flexed item has a max size then we need to check if we will hit that size
					if (ctrlLayoutRect[maxSizeName]) {
						maxSizeItems.push(ctrl);
					}

					ctrlLayoutRect.flex = flex;
				}

				availableSpace -= ctrlLayoutRect[minSizeName];

				// Calculate the align end position to be used to check for overflow/underflow
				size = contPaddingBox[alignBeforeName] + ctrlLayoutRect[alignMinSizeName] + contPaddingBox[alignAfterName];
				if (size > maxAlignEndPos) {
					maxAlignEndPos = size;
				}
			}

			// Calculate minW/minH
			rect = {};
			if (availableSpace < 0) {
				rect[minSizeName] = contLayoutRect[minSizeName] - availableSpace + contLayoutRect[deltaSizeName];
			} else {
				rect[minSizeName] = contLayoutRect[innerSizeName] - availableSpace + contLayoutRect[deltaSizeName];
			}

			rect[alignMinSizeName] = maxAlignEndPos + contLayoutRect[alignDeltaSizeName];

			rect[contentSizeName] = contLayoutRect[innerSizeName] - availableSpace;
			rect[alignContentSizeName] = maxAlignEndPos;
			rect.minW = min(rect.minW, contLayoutRect.maxW);
			rect.minH = min(rect.minH, contLayoutRect.maxH);
			rect.minW = max(rect.minW, contLayoutRect.startMinWidth);
			rect.minH = max(rect.minH, contLayoutRect.startMinHeight);

			// Resize container container if minSize was changed
			if (contLayoutRect.autoResize && (rect.minW != contLayoutRect.minW || rect.minH != contLayoutRect.minH)) {
				rect.w = rect.minW;
				rect.h = rect.minH;

				container.layoutRect(rect);
				this.recalc(container);

				// Forced recalc for example if items are hidden/shown
				if (container._lastRect === null) {
					var parentCtrl = container.parent();
					if (parentCtrl) {
						parentCtrl._lastRect = null;
						parentCtrl.recalc();
					}
				}

				return;
			}

			// Handle max size elements, check if they will become to wide with current options
			ratio = availableSpace / totalFlex;
			for (i = 0, l = maxSizeItems.length; i < l; i++) {
				ctrl = maxSizeItems[i];
				ctrlLayoutRect = ctrl.layoutRect();
				maxSize = ctrlLayoutRect[maxSizeName];
				size = ctrlLayoutRect[minSizeName] + ctrlLayoutRect.flex * ratio;

				if (size > maxSize) {
					availableSpace -= (ctrlLayoutRect[maxSizeName] - ctrlLayoutRect[minSizeName]);
					totalFlex -= ctrlLayoutRect.flex;
					ctrlLayoutRect.flex = 0;
					ctrlLayoutRect.maxFlexSize = maxSize;
				} else {
					ctrlLayoutRect.maxFlexSize = 0;
				}
			}

			// Setup new ratio, target layout rect, start position
			ratio = availableSpace / totalFlex;
			pos = contPaddingBox[beforeName];
			rect = {};

			// Handle pack setting moves the start position to end, center
			if (totalFlex === 0) {
				if (pack == "end") {
					pos = availableSpace + contPaddingBox[beforeName];
				} else if (pack == "center") {
					pos = Math.round(
						(contLayoutRect[innerSizeName] / 2) - ((contLayoutRect[innerSizeName] - availableSpace) / 2)
					) + contPaddingBox[beforeName];

					if (pos < 0) {
						pos = contPaddingBox[beforeName];
					}
				} else if (pack == "justify") {
					pos = contPaddingBox[beforeName];
					spacing = Math.floor(availableSpace / (items.length - 1));
				}
			}

			// Default aligning (start) the other ones needs to be calculated while doing the layout
			rect[alignAxisName] = contPaddingBox[alignBeforeName];

			// Start laying out controls
			for (i = 0, l = items.length; i < l; i++) {
				ctrl = items[i];
				ctrlLayoutRect = ctrl.layoutRect();
				size = ctrlLayoutRect.maxFlexSize || ctrlLayoutRect[minSizeName];

				// Align the control on the other axis
				if (align === "center") {
					rect[alignAxisName] = Math.round((contLayoutRect[alignInnerSizeName] / 2) - (ctrlLayoutRect[alignSizeName] / 2));
				} else if (align === "stretch") {
					rect[alignSizeName] = max(
						ctrlLayoutRect[alignMinSizeName] || 0,
						contLayoutRect[alignInnerSizeName] - contPaddingBox[alignBeforeName] - contPaddingBox[alignAfterName]
					);
					rect[alignAxisName] = contPaddingBox[alignBeforeName];
				} else if (align === "end") {
					rect[alignAxisName] = contLayoutRect[alignInnerSizeName]  - ctrlLayoutRect[alignSizeName]  - contPaddingBox.top;
				}

				// Calculate new size based on flex
				if (ctrlLayoutRect.flex > 0) {
					size += ctrlLayoutRect.flex * ratio;
				}

				rect[sizeName] = size;
				rect[posName] = pos;
				ctrl.layoutRect(rect);

				// Recalculate containers
				if (ctrl.recalc) {
					ctrl.recalc();
				}

				// Move x/y position
				pos += size + spacing;
			}
		}
	});
});

// Included from: js/tinymce/classes/ui/FlowLayout.js

/**
 * FlowLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager will place the controls by using the browsers native layout.
 *
 * @-x-less FlowLayout.less
 * @class tinymce.ui.FlowLayout
 * @extends tinymce.ui.Layout
 */
define("tinymce/ui/FlowLayout", [
	"tinymce/ui/Layout"
], function(Layout) {
	return Layout.extend({
		Defaults: {
			containerClass: 'flow-layout',
			controlClass: 'flow-layout-item',
			endClass : 'break'
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			container.items().filter(':visible').each(function(ctrl) {
				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		}
	});
});

// Included from: js/tinymce/classes/ui/FormatControls.js

/**
 * FormatControls.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class containing all TinyMCE specific control types such as
 * format listboxes, fontlist boxes, toolbar buttons etc.
 *
 * @class tinymce.ui.FormatControls
 */
define("tinymce/ui/FormatControls", [
	"tinymce/ui/Control",
	"tinymce/ui/Widget",
	"tinymce/ui/FloatPanel",
	"tinymce/util/Tools",
	"tinymce/EditorManager",
	"tinymce/Env"
], function(Control, Widget, FloatPanel, Tools, EditorManager, Env) {
	var each = Tools.each;

	EditorManager.on('AddEditor', function(e) {
		if (e.editor.rtl) {
			Control.rtl = true;
		}

		registerControls(e.editor);
	});

	Control.translate = function(text) {
		return EditorManager.translate(text);
	};

	Widget.tooltips = !Env.iOS;

	function registerControls(editor) {
		var formatMenu;

		// Generates a preview for a format
		function getPreviewCss(format) {
			var name, previewElm, dom = editor.dom;
			var previewCss = '', parentFontSize, previewStyles;

			previewStyles = editor.settings.preview_styles;

			// No preview forced
			if (previewStyles === false) {
				return '';
			}

			// Default preview
			if (!previewStyles) {
				previewStyles = 'font-family font-size font-weight font-style text-decoration ' +
					'text-transform color background-color border border-radius outline text-shadow';
			}

			// Removes any variables since these can't be previewed
			function removeVars(val) {
				return val.replace(/%(\w+)/g, '');
			}

			// Create block/inline element to use for preview
			format = editor.formatter.get(format);
			if (!format) {
				return;
			}

			format = format[0];
			name = format.block || format.inline || 'span';
			previewElm = dom.create(name);

			// Add format styles to preview element
			each(format.styles, function(value, name) {
				value = removeVars(value);

				if (value) {
					dom.setStyle(previewElm, name, value);
				}
			});

			// Add attributes to preview element
			each(format.attributes, function(value, name) {
				value = removeVars(value);

				if (value) {
					dom.setAttrib(previewElm, name, value);
				}
			});

			// Add classes to preview element
			each(format.classes, function(value) {
				value = removeVars(value);

				if (!dom.hasClass(previewElm, value)) {
					dom.addClass(previewElm, value);
				}
			});

			editor.fire('PreviewFormats');

			// Add the previewElm outside the visual area
			dom.setStyles(previewElm, {position: 'absolute', left: -0xFFFF});
			editor.getBody().appendChild(previewElm);

			// Get parent container font size so we can compute px values out of em/% for older IE:s
			parentFontSize = dom.getStyle(editor.getBody(), 'fontSize', true);
			parentFontSize = /px$/.test(parentFontSize) ? parseInt(parentFontSize, 10) : 0;

			each(previewStyles.split(' '), function(name) {
				var value = dom.getStyle(previewElm, name, true);

				// If background is transparent then check if the body has a background color we can use
				if (name == 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
					value = dom.getStyle(editor.getBody(), name, true);

					// Ignore white since it's the default color, not the nicest fix
					// TODO: Fix this by detecting runtime style
					if (dom.toHex(value).toLowerCase() == '#ffffff') {
						return;
					}
				}

				if (name == 'color') {
					// Ignore black since it's the default color, not the nicest fix
					// TODO: Fix this by detecting runtime style
					if (dom.toHex(value).toLowerCase() == '#000000') {
						return;
					}
				}

				// Old IE won't calculate the font size so we need to do that manually
				if (name == 'font-size') {
					if (/em|%$/.test(value)) {
						if (parentFontSize === 0) {
							return;
						}

						// Convert font size from em/% to px
						value = parseFloat(value, 10) / (/%$/.test(value) ? 100 : 1);
						value = (value * parentFontSize) + 'px';
					}
				}

				if (name == "border" && value) {
					previewCss += 'padding:0 2px;';
				}

				previewCss += name + ':' + value + ';';
			});

			editor.fire('AfterPreviewFormats');

			//previewCss += 'line-height:normal';

			dom.remove(previewElm);

			return previewCss;
		}

		function createListBoxChangeHandler(items, formatName) {
			return function() {
				var self = this;

				editor.on('nodeChange', function(e) {
					var formatter = editor.formatter;
					var value = null;

					each(e.parents, function(node) {
						each(items, function(item) {
							if (formatName) {
								if (formatter.matchNode(node, formatName, {value: item.value})) {
									value = item.value;
								}
							} else {
								if (formatter.matchNode(node, item.value)) {
									value = item.value;
								}
							}

							if (value) {
								return false;
							}
						});

						if (value) {
							return false;
						}
					});

					self.value(value);
				});
			};
		}

		function createFormats(formats) {
			formats = formats.split(';');

			var i = formats.length;
			while (i--) {
				formats[i] = formats[i].split('=');
			}

			return formats;
		}

		function createFormatMenu() {
			var count = 0, newFormats = [];

			var defaultStyleFormats = [
				{title: 'Headers', items: [
					{title: 'Header 1', format: 'h1'},
					{title: 'Header 2', format: 'h2'},
					{title: 'Header 3', format: 'h3'},
					{title: 'Header 4', format: 'h4'},
					{title: 'Header 5', format: 'h5'},
					{title: 'Header 6', format: 'h6'}
				]},

				{title: 'Inline', items: [
					{title: 'Bold', icon: 'bold', format: 'bold'},
					{title: 'Italic', icon: 'italic', format: 'italic'},
					{title: 'Underline', icon: 'underline', format: 'underline'},
					{title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
					{title: 'Superscript', icon: 'superscript', format: 'superscript'},
					{title: 'Subscript', icon: 'subscript', format: 'subscript'},
					{title: 'Code', icon: 'code', format: 'code'}
				]},

				{title: 'Blocks', items: [
					{title: 'Paragraph', format: 'p'},
					{title: 'Blockquote', format: 'blockquote'},
					{title: 'Div', format: 'div'},
					{title: 'Pre', format: 'pre'}
				]},

				{title: 'Alignment', items: [
					{title: 'Left', icon: 'alignleft', format: 'alignleft'},
					{title: 'Center', icon: 'aligncenter', format: 'aligncenter'},
					{title: 'Right', icon: 'alignright', format: 'alignright'},
					{title: 'Justify', icon: 'alignjustify', format: 'alignjustify'}
				]}
			];

			function createMenu(formats) {
				var menu = [];

				if (!formats) {
					return;
				}

				each(formats, function(format) {
					var menuItem = {
						text: format.title,
						icon: format.icon
					};

					if (format.items) {
						menuItem.menu = createMenu(format.items);
					} else {
						var formatName = format.format || "custom" + count++;

						if (!format.format) {
							format.name = formatName;
							newFormats.push(format);
						}

						menuItem.format = formatName;
					}

					menu.push(menuItem);
				});

				return menu;
			}

			function createStylesMenu() {
				var menu;

				if (editor.settings.style_formats_merge) {
					if (editor.settings.style_formats) {
						menu = createMenu(defaultStyleFormats.concat(editor.settings.style_formats));
					} else {
						menu = createMenu(defaultStyleFormats);
					}
				} else {
					menu = createMenu(editor.settings.style_formats || defaultStyleFormats);
				}

				return menu;
			}

			editor.on('init', function() {
				each(newFormats, function(format) {
					editor.formatter.register(format.name, format);
				});
			});

			return {
				type: 'menu',
				items: createStylesMenu(),
				onPostRender: function(e) {
					editor.fire('renderFormatsMenu', {control: e.control});
				},
				itemDefaults: {
					preview: true,

					textStyle: function() {
						if (this.settings.format) {
							return getPreviewCss(this.settings.format);
						}
					},

					onPostRender: function() {
						var self = this, formatName = this.settings.format;

						if (formatName) {
							self.parent().on('show', function() {
								self.disabled(!editor.formatter.canApply(formatName));
								self.active(editor.formatter.match(formatName));
							});
						}
					},

					onclick: function() {
						if (this.settings.format) {
							toggleFormat(this.settings.format);
						}
					}
				}
			};
		}

		formatMenu = createFormatMenu();

		// Simple format controls <control/format>:<UI text>
		each({
			bold: 'Bold',
			italic: 'Italic',
			underline: 'Underline',
			strikethrough: 'Strikethrough',
			subscript: 'Subscript',
			superscript: 'Superscript'
		}, function(text, name) {
			editor.addButton(name, {
				tooltip: text,
				onPostRender: function() {
					var self = this;

					// TODO: Fix this
					if (editor.formatter) {
						editor.formatter.formatChanged(name, function(state) {
							self.active(state);
						});
					} else {
						editor.on('init', function() {
							editor.formatter.formatChanged(name, function(state) {
								self.active(state);
							});
						});
					}
				},
				onclick: function() {
					toggleFormat(name);
				}
			});
		});

		// Simple command controls <control>:[<UI text>,<Command>]
		each({
			outdent: ['Decrease indent', 'Outdent'],
			indent: ['Increase indent', 'Indent'],
			cut: ['Cut', 'Cut'],
			copy: ['Copy', 'Copy'],
			paste: ['Paste', 'Paste'],
			help: ['Help', 'mceHelp'],
			selectall: ['Select all', 'SelectAll'],
			hr: ['Insert horizontal rule', 'InsertHorizontalRule'],
			removeformat: ['Clear formatting', 'RemoveFormat'],
			visualaid: ['Visual aids', 'mceToggleVisualAid'],
			newdocument: ['New document', 'mceNewDocument']
		}, function(item, name) {
			editor.addButton(name, {
				tooltip: item[0],
				cmd: item[1]
			});
		});

		// Simple command controls with format state
		each({
			blockquote: ['Blockquote', 'mceBlockQuote'],
			numlist: ['Numbered list', 'InsertOrderedList'],
			bullist: ['Bullet list', 'InsertUnorderedList'],
			subscript: ['Subscript', 'Subscript'],
			superscript: ['Superscript', 'Superscript'],
			alignleft: ['Align left', 'JustifyLeft'],
			aligncenter: ['Align center', 'JustifyCenter'],
			alignright: ['Align right', 'JustifyRight'],
			alignjustify: ['Justify', 'JustifyFull']
		}, function(item, name) {
			editor.addButton(name, {
				tooltip: item[0],
				cmd: item[1],
				onPostRender: function() {
					var self = this;

					// TODO: Fix this
					if (editor.formatter) {
						editor.formatter.formatChanged(name, function(state) {
							self.active(state);
						});
					} else {
						editor.on('init', function() {
							editor.formatter.formatChanged(name, function(state) {
								self.active(state);
							});
						});
					}
				}
			});
		});

		function hasUndo() {
			return editor.undoManager ? editor.undoManager.hasUndo() : false;
		}

		function hasRedo() {
			return editor.undoManager ? editor.undoManager.hasRedo() : false;
		}

		function toggleUndoState() {
			var self = this;

			self.disabled(!hasUndo());
			editor.on('Undo Redo AddUndo TypingUndo', function() {
				self.disabled(!hasUndo());
			});
		}

		function toggleRedoState() {
			var self = this;

			self.disabled(!hasRedo());
			editor.on('Undo Redo AddUndo TypingUndo', function() {
				self.disabled(!hasRedo());
			});
		}

		function toggleVisualAidState() {
			var self = this;

			editor.on('VisualAid', function(e) {
				self.active(e.hasVisual);
			});

			self.active(editor.hasVisual);
		}

		editor.addButton('undo', {
			tooltip: 'Undo',
			onPostRender: toggleUndoState,
			cmd: 'undo'
		});

		editor.addButton('redo', {
			tooltip: 'Redo',
			onPostRender: toggleRedoState,
			cmd: 'redo'
		});

		editor.addMenuItem('newdocument', {
			text: 'New document',
			shortcut: 'Ctrl+N',
			icon: 'newdocument',
			cmd: 'mceNewDocument'
		});

		editor.addMenuItem('undo', {
			text: 'Undo',
			icon: 'undo',
			shortcut: 'Ctrl+Z',
			onPostRender: toggleUndoState,
			cmd: 'undo'
		});

		editor.addMenuItem('redo', {
			text: 'Redo',
			icon: 'redo',
			shortcut: 'Ctrl+Y',
			onPostRender: toggleRedoState,
			cmd: 'redo'
		});

		editor.addMenuItem('visualaid', {
			text: 'Visual aids',
			selectable: true,
			onPostRender: toggleVisualAidState,
			cmd: 'mceToggleVisualAid'
		});

		each({
			cut: ['Cut', 'Cut', 'Ctrl+X'],
			copy: ['Copy', 'Copy', 'Ctrl+C'],
			paste: ['Paste', 'Paste', 'Ctrl+V'],
			selectall: ['Select all', 'SelectAll', 'Ctrl+A'],
			bold: ['Bold', 'Bold', 'Ctrl+B'],
			italic: ['Italic', 'Italic', 'Ctrl+I'],
			underline: ['Underline', 'Underline'],
			strikethrough: ['Strikethrough', 'Strikethrough'],
			subscript: ['Subscript', 'Subscript'],
			superscript: ['Superscript', 'Superscript'],
			removeformat: ['Clear formatting', 'RemoveFormat']
		}, function(item, name) {
			editor.addMenuItem(name, {
				text: item[0],
				icon: name,
				shortcut: item[2],
				cmd: item[1]
			});
		});

		editor.on('mousedown', function() {
			FloatPanel.hideAll();
		});

		function toggleFormat(fmt) {
			if (fmt.control) {
				fmt = fmt.control.value();
			}

			if (fmt) {
				editor.execCommand('mceToggleFormat', false, fmt);
			}
		}

		editor.addButton('styleselect', {
			type: 'menubutton',
			text: 'Formats',
			menu: formatMenu
		});

		editor.addButton('formatselect', function() {
			var items = [], blocks = createFormats(editor.settings.block_formats ||
				'Paragraph=p;' +
				'Address=address;' +
				'Pre=pre;' +
				'Header 1=h1;' +
				'Header 2=h2;' +
				'Header 3=h3;' +
				'Header 4=h4;' +
				'Header 5=h5;' +
				'Header 6=h6'
			);

			each(blocks, function(block) {
				items.push({
					text: block[0],
					value: block[1],
					textStyle: function() {
						return getPreviewCss(block[1]);
					}
				});
			});

			return {
				type: 'listbox',
				text: blocks[0][0],
				values: items,
				fixedWidth: true,
				onselect: toggleFormat,
				onPostRender: createListBoxChangeHandler(items)
			};
		});

		editor.addButton('fontselect', function() {
			var defaultFontsFormats =
				'Andale Mono=andale mono,times;' +
				'Arial=arial,helvetica,sans-serif;' +
				'Arial Black=arial black,avant garde;' +
				'Book Antiqua=book antiqua,palatino;' +
				'Comic Sans MS=comic sans ms,sans-serif;' +
				'Courier New=courier new,courier;' +
				'Georgia=georgia,palatino;' +
				'Helvetica=helvetica;' +
				'Impact=impact,chicago;' +
				'Symbol=symbol;' +
				'Tahoma=tahoma,arial,helvetica,sans-serif;' +
				'Terminal=terminal,monaco;' +
				'Times New Roman=times new roman,times;' +
				'Trebuchet MS=trebuchet ms,geneva;' +
				'Verdana=verdana,geneva;' +
				'Webdings=webdings;' +
				'Wingdings=wingdings,zapf dingbats';

			var items = [], fonts = createFormats(editor.settings.font_formats || defaultFontsFormats);

			each(fonts, function(font) {
				items.push({
					text: {raw: font[0]},
					value: font[1],
					textStyle: font[1].indexOf('dings') == -1 ? 'font-family:' + font[1] : ''
				});
			});

			return {
				type: 'listbox',
				text: 'Font Family',
				tooltip: 'Font Family',
				values: items,
				fixedWidth: true,
				onPostRender: createListBoxChangeHandler(items, 'fontname'),
				onselect: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontName', false, e.control.settings.value);
					}
				}
			};
		});

		editor.addButton('fontsizeselect', function() {
			var items = [], defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
			var fontsize_formats = editor.settings.fontsize_formats || defaultFontsizeFormats;

			each(fontsize_formats.split(' '), function(item) {
				items.push({text: item, value: item});
			});

			return {
				type: 'listbox',
				text: 'Font Sizes',
				tooltip: 'Font Sizes',
				values: items,
				fixedWidth: true,
				onPostRender: createListBoxChangeHandler(items, 'fontsize'),
				onclick: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontSize', false, e.control.settings.value);
					}
				}
			};
		});

		editor.addMenuItem('formats', {
			text: 'Formats',
			menu: formatMenu
		});
	}
});

// Included from: js/tinymce/classes/ui/GridLayout.js

/**
 * GridLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager places controls in a grid.
 *
 * @setting {Number} spacing Spacing between controls.
 * @setting {Number} spacingH Horizontal spacing between controls.
 * @setting {Number} spacingV Vertical spacing between controls.
 * @setting {Number} columns Number of columns to use.
 * @setting {String/Array} alignH start|end|center|stretch or array of values for each column.
 * @setting {String/Array} alignV start|end|center|stretch or array of values for each column.
 * @setting {String} pack start|end
 *
 * @class tinymce.ui.GridLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/GridLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			var settings = container.settings, rows, cols, items, contLayoutRect, width, height, rect,
				ctrlLayoutRect, ctrl, x, y, posX, posY, ctrlSettings, contPaddingBox, align, spacingH, spacingV, alignH, alignV, maxX, maxY,
				colWidths = [], rowHeights = [], ctrlMinWidth, ctrlMinHeight, alignX, alignY, availableWidth, availableHeight;

			// Get layout settings
			settings = container.settings;
			items = container.items().filter(':visible');
			contLayoutRect = container.layoutRect();
			cols = settings.columns || Math.ceil(Math.sqrt(items.length));
			rows = Math.ceil(items.length / cols);
			spacingH = settings.spacingH || settings.spacing || 0;
			spacingV = settings.spacingV || settings.spacing || 0;
			alignH = settings.alignH || settings.align;
			alignV = settings.alignV || settings.align;
			contPaddingBox = container._paddingBox;

			if (alignH && typeof(alignH) == "string") {
				alignH = [alignH];
			}

			if (alignV && typeof(alignV) == "string") {
				alignV = [alignV];
			}

			// Zero padd columnWidths
			for (x = 0; x < cols; x++) {
				colWidths.push(0);
			}

			// Zero padd rowHeights
			for (y = 0; y < rows; y++) {
				rowHeights.push(0);
			}

			// Calculate columnWidths and rowHeights
			for (y = 0; y < rows; y++) {
				for (x = 0; x < cols; x++) {
					ctrl = items[y * cols + x];

					// Out of bounds
					if (!ctrl) {
						break;
					}

					ctrlLayoutRect = ctrl.layoutRect();
					ctrlMinWidth = ctrlLayoutRect.minW;
					ctrlMinHeight = ctrlLayoutRect.minH;

					colWidths[x] = ctrlMinWidth > colWidths[x] ? ctrlMinWidth : colWidths[x];
					rowHeights[y] = ctrlMinHeight > rowHeights[y] ? ctrlMinHeight : rowHeights[y];
				}
			}

			// Calculate maxX
			availableWidth = contLayoutRect.innerW - contPaddingBox.left - contPaddingBox.right;
			for (maxX = 0, x = 0; x < cols; x++) {
				maxX += colWidths[x] + (x > 0 ? spacingH : 0);
				availableWidth -= (x > 0 ? spacingH : 0) + colWidths[x];
			}

			// Calculate maxY
			availableHeight = contLayoutRect.innerH - contPaddingBox.top - contPaddingBox.bottom;
			for (maxY = 0, y = 0; y < rows; y++) {
				maxY += rowHeights[y] + (y > 0 ? spacingV : 0);
				availableHeight -= (y > 0 ? spacingV : 0) + rowHeights[y];
			}

			maxX += contPaddingBox.left + contPaddingBox.right;
			maxY += contPaddingBox.top + contPaddingBox.bottom;

			// Calculate minW/minH
			rect = {};
			rect.minW = maxX + (contLayoutRect.w - contLayoutRect.innerW);
			rect.minH = maxY + (contLayoutRect.h - contLayoutRect.innerH);

			rect.contentW = rect.minW - contLayoutRect.deltaW;
			rect.contentH = rect.minH - contLayoutRect.deltaH;
			rect.minW = Math.min(rect.minW, contLayoutRect.maxW);
			rect.minH = Math.min(rect.minH, contLayoutRect.maxH);
			rect.minW = Math.max(rect.minW, contLayoutRect.startMinWidth);
			rect.minH = Math.max(rect.minH, contLayoutRect.startMinHeight);

			// Resize container container if minSize was changed
			if (contLayoutRect.autoResize && (rect.minW != contLayoutRect.minW || rect.minH != contLayoutRect.minH)) {
				rect.w = rect.minW;
				rect.h = rect.minH;

				container.layoutRect(rect);
				this.recalc(container);

				// Forced recalc for example if items are hidden/shown
				if (container._lastRect === null) {
					var parentCtrl = container.parent();
					if (parentCtrl) {
						parentCtrl._lastRect = null;
						parentCtrl.recalc();
					}
				}

				return;
			}

			// Update contentW/contentH so absEnd moves correctly
			if (contLayoutRect.autoResize) {
				rect = container.layoutRect(rect);
				rect.contentW = rect.minW - contLayoutRect.deltaW;
				rect.contentH = rect.minH - contLayoutRect.deltaH;
			}

			var flexV;

			if (settings.packV == 'start') {
				flexV = 0;
			} else {
				flexV = availableHeight > 0 ? Math.floor(availableHeight / rows) : 0;
			}

			// Calculate totalFlex
			var totalFlex = 0;
			var flexWidths = settings.flexWidths;
			if (flexWidths) {
				for (x = 0; x < flexWidths.length; x++) {
					totalFlex += flexWidths[x];
				}
			} else {
				totalFlex = cols;
			}

			// Calculate new column widths based on flex values
			var ratio = availableWidth / totalFlex;
			for (x = 0; x < cols; x++) {
				colWidths[x] += flexWidths ? flexWidths[x] * ratio : ratio;
			}

			// Move/resize controls
			posY = contPaddingBox.top;
			for (y = 0; y < rows; y++) {
				posX = contPaddingBox.left;
				height = rowHeights[y] + flexV;

				for (x = 0; x < cols; x++) {
					ctrl = items[y * cols + x];

					// No more controls to render then break
					if (!ctrl) {
						break;
					}

					// Get control settings and calculate x, y
					ctrlSettings = ctrl.settings;
					ctrlLayoutRect = ctrl.layoutRect();
					width = Math.max(colWidths[x], ctrlLayoutRect.startMinWidth);
					alignX = alignY = 0;
					ctrlLayoutRect.x = posX;
					ctrlLayoutRect.y = posY;

					// Align control horizontal
					align = ctrlSettings.alignH || (alignH ? (alignH[x] || alignH[0]) : null);
					if (align == "center") {
						ctrlLayoutRect.x = posX + (width / 2) - (ctrlLayoutRect.w / 2);
					} else if (align == "right") {
						ctrlLayoutRect.x = posX + width - ctrlLayoutRect.w;
					} else if (align == "stretch") {
						ctrlLayoutRect.w = width;
					}

					// Align control vertical
					align = ctrlSettings.alignV || (alignV ? (alignV[x] || alignV[0]) : null);
					if (align == "center") {
						ctrlLayoutRect.y = posY + (height / 2) - (ctrlLayoutRect.h / 2);
					} else  if (align == "bottom") {
						ctrlLayoutRect.y = posY + height - ctrlLayoutRect.h;
					} else if (align == "stretch") {
						ctrlLayoutRect.h = height;
					}

					ctrl.layoutRect(ctrlLayoutRect);

					posX += width + spacingH;

					if (ctrl.recalc) {
						ctrl.recalc();
					}
				}

				posY += height + spacingV;
			}
		}
	});
});

// Included from: js/tinymce/classes/ui/Iframe.js

/**
 * Iframe.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * This class creates an iframe.
 *
 * @setting {String} url Url to open in the iframe.
 *
 * @-x-less Iframe.less
 * @class tinymce.ui.Iframe
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Iframe", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			self.addClass('iframe');
			self.canFocus = false;

			return (
				'<iframe id="' + self._id + '" class="' + self.classes() + '" tabindex="-1" src="' +
				(self.settings.url || "javascript:\'\'") + '" frameborder="0"></iframe>'
			);
		},

		/**
		 * Setter for the iframe source.
		 *
		 * @method src
		 * @param {String} src Source URL for iframe.
		 */
		src: function(src) {
			this.getEl().src = src;
		},

		/**
		 * Inner HTML for the iframe.
		 *
		 * @method html
		 * @param {String} html HTML string to set as HTML inside the iframe.
		 * @param {function} callback Optional callback to execute when the iframe body is filled with contents.
		 * @return {tinymce.ui.Iframe} Current iframe control.
		 */
		html: function(html, callback) {
			var self = this, body = this.getEl().contentWindow.document.body;

			// Wait for iframe to initialize IE 10 takes time
			if (!body) {
				setTimeout(function() {
					self.html(html);
				}, 0);
			} else {
				body.innerHTML = html;

				if (callback) {
					callback();
				}
			}

			return this;
		}
	});
});

// Included from: js/tinymce/classes/ui/Label.js

/**
 * Label.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a label element. A label is a simple text control
 * that can be bound to other controls.
 *
 * @-x-less Label.less
 * @class tinymce.ui.Label
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Label", [
	"tinymce/ui/Widget",
	"tinymce/ui/DomUtils"
], function(Widget, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @param {Boolean} multiline Multiline label.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('widget');
			self.addClass('label');
			self.canFocus = false;

			if (settings.multiline) {
				self.addClass('autoscroll');
			}

			if (settings.strong) {
				self.addClass('strong');
			}
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, layoutRect = self._super();

			if (self.settings.multiline) {
				var size = DomUtils.getSize(self.getEl());

				// Check if the text fits within maxW if not then try word wrapping it
				if (size.width > layoutRect.maxW) {
					layoutRect.minW = layoutRect.maxW;
					self.addClass('multiline');
				}

				self.getEl().style.width = layoutRect.minW + 'px';
				layoutRect.startMinH = layoutRect.h = layoutRect.minH = Math.min(layoutRect.maxH, DomUtils.getSize(self.getEl()).height);
			}

			return layoutRect;
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this;

			if (!self.settings.multiline) {
				self.getEl().style.lineHeight = self.layoutRect().h + 'px';
			}

			return self._super();
		},

		/**
		 * Sets/gets the current label text.
		 *
		 * @method text
		 * @param {String} [text] New label text.
		 * @return {String|tinymce.ui.Label} Current text or current label instance.
		 */
		text: function(text) {
			var self = this;

			if (self._rendered && text) {
				this.innerHtml(self.encode(text));
			}

			return self._super(text);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, forId = self.settings.forId;

			return (
				'<label id="' + self._id + '" class="' + self.classes() + '"' + (forId ? ' for="' + forId +'"' : '') + '>' +
					self.encode(self._text) +
				'</label>'
			);
		}
	});
});

// Included from: js/tinymce/classes/ui/Toolbar.js

/**
 * Toolbar.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new toolbar.
 *
 * @class tinymce.ui.Toolbar
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/Toolbar", [
	"tinymce/ui/Container",
	"tinymce/ui/KeyboardNavigation"
], function(Container, KeyboardNavigation) {
	"use strict";

	return Container.extend({
		Defaults: {
			role: 'toolbar',
			layout: 'flow'
		},

		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('toolbar');
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self.items().addClass('toolbar-item');

			self.keyNav = new KeyboardNavigation({
				root: self,
				enableLeftRight: true
			});

			return self._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/MenuBar.js

/**
 * MenuBar.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menubar.
 *
 * @-x-less MenuBar.less
 * @class tinymce.ui.MenuBar
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/MenuBar", [
	"tinymce/ui/Toolbar"
], function(Toolbar) {
	"use strict";

	return Toolbar.extend({
		Defaults: {
			role: 'menubar',
			containerCls: 'menubar',
			defaults: {
				type: 'menubutton'
			}
		}
	});
});

// Included from: js/tinymce/classes/ui/MenuButton.js

/**
 * MenuButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menu button.
 *
 * @-x-less MenuButton.less
 * @class tinymce.ui.MenuButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/MenuButton", [
	"tinymce/ui/Button",
	"tinymce/ui/Factory",
	"tinymce/ui/MenuBar"
], function(Button, Factory, MenuBar) {
	"use strict";

	// TODO: Maybe add as some global function
	function isChildOf(node, parent) {
		while (node) {
			if (parent === node) {
				return true;
			}

			node = node.parentNode;
		}

		return false;
	}

	var MenuButton = Button.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this;

			self._renderOpen = true;
			self._super(settings);

			self.addClass('menubtn');

			if (settings.fixedWidth) {
				self.addClass('fixed-width');
			}

			self.aria('haspopup', true);
			self.hasPopup = true;
		},

		/**
		 * Shows the menu for the button.
		 *
		 * @method showMenu
		 */
		showMenu: function() {
			var self = this, settings = self.settings, menu;

			if (self.menu && self.menu.visible()) {
				return self.hideMenu();
			}

			if (!self.menu) {
				menu = settings.menu || [];

				// Is menu array then auto constuct menu control
				if (menu.length) {
					menu = {
						type: 'menu',
						items: menu
					};
				} else {
					menu.type = menu.type || 'menu';
				}

				self.menu = Factory.create(menu).parent(self).renderTo(self.getContainerElm());
				self.fire('createmenu');
				self.menu.reflow();
				self.menu.on('cancel', function(e) {
					if (e.control === self.menu) {
						self.focus();
					}
				});

				self.menu.on('show hide', function(e) {
					if (e.control == self.menu) {
						self.activeMenu(e.type == 'show');
					}
				}).fire('show');

				self.aria('expanded', true);
			}

			self.menu.show();
			self.menu.layoutRect({w: self.layoutRect().w});
			self.menu.moveRel(self.getEl(), self.isRtl() ? ['br-tr', 'tr-br'] : ['bl-tl', 'tl-bl']);
		},

		/**
		 * Hides the menu for the button.
		 *
		 * @method hideMenu
		 */
		hideMenu: function() {
			var self = this;

			if (self.menu) {
				self.menu.items().each(function(item) {
					if (item.hideMenu) {
						item.hideMenu();
					}
				});

				self.menu.hide();
				self.aria('expanded', false);
			}
		},

		/**
		 * Sets the active menu state.
		 *
		 * @private
		 */
		activeMenu: function(state) {
			this.toggleClass('active', state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			self.aria('role', self.parent() instanceof MenuBar ? 'menuitem' : 'button');

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button id="' + id + '-open" role="presentation" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"></i>' : '') +
						'<span>' + (self._text ? (icon ? '\u00a0' : '') + self.encode(self._text) : '') + '</span>' +
						' <i class="' + prefix + 'caret"></i>' +
					'</button>' +
				'</div>'
			);
		},

		/**
		 * Gets invoked after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self.on('click', function(e) {
				if (e.control === self && isChildOf(e.target, self.getEl())) {
					self.showMenu();

					if (e.keyboard) {
						self.menu.items()[0].focus();
					}
				}
			});

			self.on('mouseenter', function(e) {
				var overCtrl = e.control, parent = self.parent(), hasVisibleSiblingMenu;

				if (overCtrl && parent && overCtrl instanceof MenuButton && overCtrl.parent() == parent) {
					parent.items().filter('MenuButton').each(function(ctrl) {
						if (ctrl.hideMenu && ctrl != overCtrl) {
							if (ctrl.menu && ctrl.menu.visible()) {
								hasVisibleSiblingMenu = true;
							}

							ctrl.hideMenu();
						}
					});

					if (hasVisibleSiblingMenu) {
						overCtrl.focus(); // Fix for: #5887
						overCtrl.showMenu();
					}
				}
			});

			return self._super();
		},

		/**
		 * Sets/gets the current button text.
		 *
		 * @method text
		 * @param {String} [text] New button text.
		 * @return {String|tinymce.ui.MenuButton} Current text or current MenuButton instance.
		 */
		text: function(text) {
			var self = this, i, children;

			if (self._rendered) {
				children = self.getEl('open').getElementsByTagName('span');
				for (i = 0; i < children.length; i++) {
					children[i].innerHTML = (self.settings.icon && text ? '\u00a0' : '') + self.encode(text);
				}
			}

			return this._super(text);
		},

		/**
		 * Removes the control and it's menus.
		 *
		 * @method remove
		 */
		remove: function() {
			this._super();

			if (this.menu) {
				this.menu.remove();
			}
		}
	});

	return MenuButton;
});

// Included from: js/tinymce/classes/ui/ListBox.js

/**
 * ListBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new list box control.
 *
 * @-x-less ListBox.less
 * @class tinymce.ui.ListBox
 * @extends tinymce.ui.MenuButton
 */
define("tinymce/ui/ListBox", [
	"tinymce/ui/MenuButton"
], function(MenuButton) {
	"use strict";

	return MenuButton.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Array} values Array with values to add to list box.
		 */
		init: function(settings) {
			var self = this, values, i, selected, selectedText, lastItemCtrl;

			self._values = values = settings.values;
			if (values) {
				for (i = 0; i < values.length; i++) {
					selected = values[i].selected || settings.value === values[i].value;

					if (selected) {
						selectedText = selectedText || values[i].text;
						self._value = values[i].value;
					}
				}

				settings.menu = values;
			}

			settings.text = settings.text || selectedText || values[0].text;

			self._super(settings);
			self.addClass('listbox');

			self.on('select', function(e) {
				var ctrl = e.control;

				if (lastItemCtrl) {
					e.lastControl = lastItemCtrl;
				}

				if (settings.multiple) {
					ctrl.active(!ctrl.active());
				} else {
					self.value(e.control.settings.value);
				}

				lastItemCtrl = ctrl;
			});
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {Boolean/tinymce.ui.ListBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this, active, selectedText, menu, i;

			function activateByValue(menu, value) {
				menu.items().each(function(ctrl) {
					active = ctrl.value() === value;

					if (active) {
						selectedText = selectedText || ctrl.text();
					}

					ctrl.active(active);

					if (ctrl.menu) {
						activateByValue(ctrl.menu, value);
					}
				});
			}

			if (typeof(value) != "undefined") {
				if (self.menu) {
					activateByValue(self.menu, value);
				} else {
					menu = self.settings.menu;
					for (i = 0; i < menu.length; i++) {
						active = menu[i].value == value;

						if (active) {
							selectedText = selectedText || menu[i].text;
						}

						menu[i].active = active;
					}
				}

				self.text(selectedText || this.settings.text);
			}

			return self._super(value);
		}
	});
});

// Included from: js/tinymce/classes/ui/MenuItem.js

/**
 * MenuItem.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menu item.
 *
 * @-x-less MenuItem.less
 * @class tinymce.ui.MenuItem
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/MenuItem", [
	"tinymce/ui/Widget",
	"tinymce/ui/Factory",
	"tinymce/Env"
], function(Widget, Factory, Env) {
	"use strict";

	return Widget.extend({
		Defaults: {
			border: 0,
			role: 'menuitem'
		},

		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} selectable Selectable menu.
		 * @setting {Array} menu Submenu array with items.
		 * @setting {String} shortcut Shortcut to display for menu item. Example: Ctrl+X
		 */
		init: function(settings) {
			var self = this;

			self.hasPopup = true;

			self._super(settings);

			settings = self.settings;

			self.addClass('menu-item');

			if (settings.menu) {
				self.addClass('menu-item-expand');
			}

			if (settings.preview) {
				self.addClass('menu-item-preview');
			}

			if (self._text === '-' || self._text === '|') {
				self.addClass('menu-item-sep');
				self.aria('role', 'separator');
				self.canFocus = false;
				self._text = '-';
			}

			if (settings.selectable) {
				self.aria('role', 'menuitemcheckbox');
				self.aria('checked', true);
				self.addClass('menu-item-checkbox');
				settings.icon = 'selected';
			}

			if (!settings.preview && !settings.selectable) {
				self.addClass('menu-item-normal');
			}

			self.on('mousedown', function(e) {
				e.preventDefault();
			});

			self.on('mouseenter click', function(e) {
				if (e.control === self) {
					if (!settings.menu && e.type === 'click') {
						self.parent().hideAll();
						self.fire('cancel');
						self.fire('select');
					} else {
						self.showMenu();

						if (e.keyboard) {
							setTimeout(function() {
								self.menu.items()[0].focus();
							}, 0);
						}
					}
				}
			});

			if (settings.menu) {
				self.aria('haspopup', true);
			}
		},

		/**
		 * Returns true/false if the menuitem has sub menu.
		 *
		 * @method hasMenus
		 * @return {Boolean} True/false state if it has submenu.
		 */
		hasMenus: function() {
			return !!this.settings.menu;
		},

		/**
		 * Shows the menu for the menu item.
		 *
		 * @method showMenu
		 */
		showMenu: function() {
			var self = this, settings = self.settings, menu, parent = self.parent();

			parent.items().each(function(ctrl) {
				if (ctrl !== self) {
					ctrl.hideMenu();
				}
			});

			if (settings.menu) {
				menu = self.menu;

				if (!menu) {
					menu = settings.menu;

					// Is menu array then auto constuct menu control
					if (menu.length) {
						menu = {
							type: 'menu',
							items: menu
						};
					} else {
						menu.type = menu.type || 'menu';
					}

					if (parent.settings.itemDefaults) {
						menu.itemDefaults = parent.settings.itemDefaults;
					}

					menu = self.menu = Factory.create(menu).parent(self).renderTo(self.getContainerElm());
					menu.reflow();
					menu.fire('show');
					menu.on('cancel', function() {
						self.focus();
					});

					menu.on('hide', function(e) {
						if (e.control === menu) {
							self.removeClass('selected');
						}
					});
				} else {
					menu.show();
				}

				menu._parentMenu = parent;

				menu.addClass('menu-sub');

				var rel = menu.testMoveRel(
					self.getEl(),
					self.isRtl() ? ['tl-tr', 'bl-br', 'tr-tl', 'br-bl'] : ['tr-tl', 'br-bl', 'tl-tr', 'bl-br']
				);

				menu.moveRel(self.getEl(), rel);
				menu.rel = rel;

				rel = 'menu-sub-' + rel;
				menu.removeClass(menu._lastRel);
				menu.addClass(rel);
				menu._lastRel = rel;

				self.addClass('selected');
				self.aria('expanded', true);
			}
		},

		/**
		 * Hides the menu for the menu item.
		 *
		 * @method hideMenu
		 */
		hideMenu: function() {
			var self = this;

			if (self.menu) {
				self.menu.items().each(function(item) {
					if (item.hideMenu) {
						item.hideMenu();
					}
				});

				self.menu.hide();
				self.aria('expanded', false);
			}

			return self;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix, text = self.encode(self._text);
			var icon = self.settings.icon, image = '', shortcut = settings.shortcut;

			if (icon) {
				self.parent().addClass('menu-has-icons');
			}

			if (settings.image) {
				icon = 'none';
				image = ' style="background-image: url(\'' + settings.image + '\')"';
			}

			if (shortcut && Env.mac) {
				// format shortcut for Mac
				shortcut = shortcut.replace(/ctrl\+alt\+/i, '&#x2325;&#x2318;'); // ctrl+cmd
				shortcut = shortcut.replace(/ctrl\+/i, '&#x2318;'); // ctrl symbol
				shortcut = shortcut.replace(/alt\+/i, '&#x2325;'); // cmd symbol
				shortcut = shortcut.replace(/shift\+/i, '&#x21E7;'); // shift symbol
			}

			icon = prefix + 'ico ' + prefix + 'i-' + (self.settings.icon || 'none');

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					(text !== '-' ? '<i class="' + icon + '"' + image + '></i>&nbsp;' : '') +
					(text !== '-' ? '<span id="' + id + '-text" class="' + prefix + 'text">' + text + '</span>' : '') +
					(shortcut ? '<div id="' + id + '-shortcut" class="' + prefix + 'menu-shortcut">' + shortcut + '</div>' : '') +
					(settings.menu ? '<div class="' + prefix + 'caret"></div>' : '') +
				'</div>'
			);
		},

		/**
		 * Gets invoked after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, settings = self.settings;

			var textStyle = settings.textStyle;
			if (typeof(textStyle) == "function") {
				textStyle = textStyle.call(this);
			}

			if (textStyle) {
				var textElm = self.getEl('text');
				if (textElm) {
					textElm.setAttribute('style', textStyle);
				}
			}

			return self._super();
		},

		/**
		 * Removes the control and it's menus.
		 *
		 * @method remove
		 */
		remove: function() {
			this._super();

			if (this.menu) {
				this.menu.remove();
			}
		}
	});
});

// Included from: js/tinymce/classes/ui/Menu.js

/**
 * Menu.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menu.
 *
 * @-x-less Menu.less
 * @class tinymce.ui.Menu
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/Menu", [
	"tinymce/ui/FloatPanel",
	"tinymce/ui/KeyboardNavigation",
	"tinymce/ui/MenuItem",
	"tinymce/util/Tools"
], function(FloatPanel, KeyboardNavigation, MenuItem, Tools) {
	"use strict";

	var Menu = FloatPanel.extend({
		Defaults: {
			defaultType: 'menuitem',
			border: 1,
			layout: 'stack',
			role: 'menu'
		},

		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this;

			settings.autohide = true;
			settings.constrainToViewport = true;

			if (settings.itemDefaults) {
				var items = settings.items, i = items.length;

				while (i--) {
					items[i] = Tools.extend({}, settings.itemDefaults, items[i]);
				}
			}

			self._super(settings);
			self.addClass('menu');

			self.keyNav = new KeyboardNavigation({
				root: self,
				enableUpDown: true,
				enableLeftRight: true,

				leftAction: function() {
					if (self.parent() instanceof MenuItem) {
						self.keyNav.cancel();
					}
				},

				onCancel: function() {
					self.fire('cancel', {}, false);
					self.hide();
				}
			});
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			this.toggleClass('menu-align', true);

			this._super();

			this.getEl().style.height = '';
			this.getEl('body').style.height = '';

			return this;
		},

		/**
		 * Hides/closes the menu.
		 *
		 * @method cancel
		 */
		cancel: function() {
			var self = this;

			self.hideAll();
			self.fire('cancel');
			self.fire('select');
		},

		/**
		 * Hide menu and all sub menus.
		 *
		 * @method hideAll
		 */
		hideAll: function() {
			var self = this;

			this.find('menuitem').exec('hideMenu');

			return self._super();
		},

		/**
		 * Invoked before the menu is rendered.
		 *
		 * @method preRender
		 */
		preRender: function() {
			var self = this;

			self.items().each(function(ctrl) {
				var settings = ctrl.settings;

				if (settings.icon || settings.selectable) {
					self._hasIcons = true;
					return false;
				}
			});

			return self._super();
		}
	});

	return Menu;
});

// Included from: js/tinymce/classes/ui/Radio.js

/**
 * Radio.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new radio button.
 *
 * @-x-less Radio.less
 * @class tinymce.ui.Radio
 * @extends tinymce.ui.Checkbox
 */
define("tinymce/ui/Radio", [
	"tinymce/ui/Checkbox"
], function(Checkbox) {
	"use strict";

	return Checkbox.extend({
		Defaults: {
			classes: "radio",
			role: "radio"
		}
	});
});

// Included from: js/tinymce/classes/ui/ResizeHandle.js

/**
 * ResizeHandle.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Renders a resize handle that fires ResizeStart, Resize and ResizeEnd events.
 *
 * @-x-less ResizeHandle.less
 * @class tinymce.ui.ResizeHandle
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/ResizeHandle", [
	"tinymce/ui/Widget",
	"tinymce/ui/DragHelper"
], function(Widget, DragHelper) {
	"use strict";

	return Widget.extend({
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, prefix = self.classPrefix;

			self.addClass('resizehandle');

			if (self.settings.direction == "both") {
				self.addClass('resizehandle-both');
			}

			self.canFocus = false;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">' +
					'<i class="' + prefix + 'ico ' + prefix + 'i-resize"></i>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.resizeDragHelper = new DragHelper(this._id, {
				start: function() {
					self.fire('ResizeStart');
				},

				drag: function(e) {
					if (self.settings.direction != "both") {
						e.deltaX = 0;
					}

					self.fire('Resize', e);
				},

				stop: function() {
					self.fire('ResizeEnd');
				}
			});
		},

		remove: function() {
			if (this.resizeDragHelper) {
				this.resizeDragHelper.destroy();
			}

			return this._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/Spacer.js

/**
 * Spacer.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a spacer. This control is used in flex layouts for example.
 *
 * @-x-less Spacer.less
 * @class tinymce.ui.Spacer
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Spacer", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			self.addClass('spacer');
			self.canFocus = false;

			return '<div id="' + self._id + '" class="' + self.classes() + '"></div>';
		}
	});
});

// Included from: js/tinymce/classes/ui/SplitButton.js

/**
 * SplitButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a split button.
 *
 * @-x-less SplitButton.less
 * @class tinymce.ui.SplitButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/SplitButton", [
	"tinymce/ui/MenuButton",
	"tinymce/ui/DomUtils"
], function(MenuButton, DomUtils) {
	return MenuButton.extend({
		Defaults: {
			classes: "widget btn splitbtn",
			role: "splitbutton"
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, elm = self.getEl(), rect = self.layoutRect(), mainButtonElm, menuButtonElm;

			self._super();

			mainButtonElm = elm.firstChild;
			menuButtonElm = elm.lastChild;

			DomUtils.css(mainButtonElm, {
				width: rect.w - DomUtils.getSize(menuButtonElm).width,
				height: rect.h - 2
			});

			DomUtils.css(menuButtonElm, {
				height: rect.h - 2
			});

			return self;
		},

		/**
		 * Sets the active menu state.
		 *
		 * @private
		 */
		activeMenu: function(state) {
			var self = this;

			DomUtils.toggleClass(self.getEl().lastChild, self.classPrefix + 'active', state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '">' +
					'<button type="button" hidefocus tabindex="-1">' +
						(icon ? '<i class="' + icon + '"></i>' : '') +
						(self._text ? (icon ? ' ' : '') + self._text : '') +
					'</button>' +
					'<button type="button" class="' + prefix + 'open" hidefocus tabindex="-1">' +
						//(icon ? '<i class="' + icon + '"></i>' : '') +
						(self._menuBtnText ? (icon ? '\u00a0' : '') + self._menuBtnText : '') +
						' <i class="' + prefix + 'caret"></i>' +
					'</button>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, onClickHandler = self.settings.onclick;

			self.on('click', function(e) {
				var node = e.target;

				if (e.control == this) {
					// Find clicks that is on the main button
					while (node) {
						if (node.nodeName == 'BUTTON' && node.className.indexOf('open') == -1) {
							e.stopImmediatePropagation();
							onClickHandler.call(this, e);
							return;
						}

						node = node.parentNode;
					}
				}
			});

			delete self.settings.onclick;

			return self._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/StackLayout.js

/**
 * StackLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout uses the browsers layout when the items are blocks.
 *
 * @-x-less StackLayout.less
 * @class tinymce.ui.StackLayout
 * @extends tinymce.ui.FlowLayout
 */
define("tinymce/ui/StackLayout", [
	"tinymce/ui/FlowLayout"
], function(FlowLayout) {
	"use strict";

	return FlowLayout.extend({
		Defaults: {
			containerClass: 'stack-layout',
			controlClass: 'stack-layout-item',
			endClass : 'break'
		}
	});
});

// Included from: js/tinymce/classes/ui/TabPanel.js

/**
 * TabPanel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a tab panel control.
 *
 * @-x-less TabPanel.less
 * @class tinymce.ui.TabPanel
 * @extends tinymce.ui.Panel
 *
 * @setting {Number} activeTab Active tab index.
 */
define("tinymce/ui/TabPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils"
], function(Panel, DomUtils) {
	"use strict";

	return Panel.extend({
		lastIdx: 0,

		Defaults: {
			layout: 'absolute',
			defaults: {
				type: 'panel'
			}
		},

		/**
		 * Activates the specified tab by index.
		 *
		 * @method activateTab
		 * @param {Number} idx Index of the tab to activate.
		 */
		activateTab: function(idx) {
			if (this.activeTabId) {
				DomUtils.removeClass(this.getEl(this.activeTabId), this.classPrefix + 'active');
			}

			this.activeTabId = 't' + idx;

			DomUtils.addClass(this.getEl('t' + idx), this.classPrefix + 'active');

			if (idx != this.lastIdx) {
				this.items()[this.lastIdx].hide();
				this.lastIdx = idx;
			}

			this.items()[idx].show().fire('showtab');
			this.reflow();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, tabsHtml = '', prefix = self.classPrefix;

			self.preRender();
			layout.preRender(self);

			self.items().each(function(ctrl, i) {
				tabsHtml += (
					'<div id="' + self._id + '-t' + i + '" class="' + prefix + 'tab" unselectable="on">' +
						self.encode(ctrl.settings.title) +
					'</div>'
				);
			});

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					'<div id="' + self._id + '-head" class="' + prefix + 'tabs">' +
						tabsHtml +
					'</div>' +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.settings.activeTab = self.settings.activeTab || 0;
			self.activateTab(self.settings.activeTab);

			this.on('click', function(e) {
				var targetParent = e.target.parentNode;

				if (e.target.parentNode.id == self._id + '-head') {
					var i = targetParent.childNodes.length;

					while (i--) {
						if (targetParent.childNodes[i] == e.target) {
							self.activateTab(i);
						}
					}
				}
			});
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, rect, minW, minH;

			minW = DomUtils.getSize(self.getEl('head')).width;
			minW = minW < 0 ? 0 : minW;
			minH = 0;
			self.items().each(function(item, i) {
				minW = Math.max(minW, item.layoutRect().minW);
				minH = Math.max(minH, item.layoutRect().minH);
				if (self.settings.activeTab != i) {
					item.hide();
				}
			});

			self.items().each(function(ctrl) {
				ctrl.settings.x = 0;
				ctrl.settings.y = 0;
				ctrl.settings.w = minW;
				ctrl.settings.h = minH;

				ctrl.layoutRect({
					x: 0,
					y: 0,
					w: minW,
					h: minH
				});
			});

			var headH = DomUtils.getSize(self.getEl('head')).height;

			self.settings.minWidth = minW;
			self.settings.minHeight = minH + headH;

			rect = self._super();
			rect.deltaH += headH;
			rect.innerH = rect.h - rect.deltaH;

			return rect;
		}
	});
});

// Included from: js/tinymce/classes/ui/TextBox.js

/**
 * TextBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new textbox.
 *
 * @-x-less TextBox.less
 * @class tinymce.ui.TextBox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/TextBox", [
	"tinymce/ui/Widget",
	"tinymce/ui/DomUtils"
], function(Widget, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} multiline True if the textbox is a multiline control.
		 * @setting {Number} maxLength Max length for the textbox.
		 * @setting {Number} size Size of the textbox in characters.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self._value = settings.value || '';
			self.addClass('textbox');

			if (settings.multiline) {
				self.addClass('multiline');
			} else {
				// TODO: Rework this
				self.on('keydown', function(e) {
					if (e.keyCode == 13) {
						self.parents().reverse().each(function(ctrl) {
							e.preventDefault();

							if (ctrl.hasEventListeners('submit') && ctrl.toJSON) {
								ctrl.fire('submit', {data: ctrl.toJSON()});
								return false;
							}
						});
					}
				});
			}
		},

		/**
		 * Getter/setter function for the disabled state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.ComboBox} True/false or self if it's a set operation.
		 */
		disabled: function(state) {
			var self = this;

			if (self._rendered && typeof(state) != 'undefined') {
				self.getEl().disabled = state;
			}

			return self._super(state);
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {String|tinymce.ui.ComboBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this;

			if (typeof(value) != "undefined") {
				self._value = value;

				if (self._rendered) {
					self.getEl().value = value;
				}

				return self;
			}

			if (self._rendered) {
				return self.getEl().value;
			}

			return self._value;
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, style, rect, borderBox, borderW = 0, borderH = 0, lastRepaintRect;

			style = self.getEl().style;
			rect = self._layoutRect;
			lastRepaintRect = self._lastRepaintRect || {};

			// Detect old IE 7+8 add lineHeight to align caret vertically in the middle
			var doc = document;
			if (!self.settings.multiline && doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
				style.lineHeight = (rect.h - borderH) + 'px';
			}

			borderBox = self._borderBox;
			borderW = borderBox.left + borderBox.right + 8;
			borderH = borderBox.top + borderBox.bottom + (self.settings.multiline ? 8 : 0);

			if (rect.x !== lastRepaintRect.x) {
				style.left = rect.x + 'px';
				lastRepaintRect.x = rect.x;
			}

			if (rect.y !== lastRepaintRect.y) {
				style.top = rect.y + 'px';
				lastRepaintRect.y = rect.y;
			}

			if (rect.w !== lastRepaintRect.w) {
				style.width = (rect.w - borderW) + 'px';
				lastRepaintRect.w = rect.w;
			}

			if (rect.h !== lastRepaintRect.h) {
				style.height = (rect.h - borderH) + 'px';
				lastRepaintRect.h = rect.h;
			}

			self._lastRepaintRect = lastRepaintRect;
			self.fire('repaint', {}, false);

			return self;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, value = self.encode(self._value, false), extraAttrs = '';

			if ("spellcheck" in settings) {
				extraAttrs += ' spellcheck="' + settings.spellcheck + '"';
			}

			if (settings.maxLength) {
				extraAttrs += ' maxlength="' + settings.maxLength + '"';
			}

			if (settings.size) {
				extraAttrs += ' size="' + settings.size + '"';
			}

			if (settings.subtype) {
				extraAttrs += ' type="' + settings.subtype + '"';
			}

			if (self.disabled()) {
				extraAttrs += ' disabled="disabled"';
			}

			if (settings.multiline) {
				return (
					'<textarea id="' + id + '" class="' + self.classes() + '" ' +
					(settings.rows ? ' rows="' + settings.rows + '"' : '') +
					' hidefocus="true"' + extraAttrs + '>' + value +
					'</textarea>'
				);
			}

			return '<input id="' + id + '" class="' + self.classes() + '" value="' + value + '" hidefocus="true"' + extraAttrs + '>';
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			DomUtils.on(self.getEl(), 'change', function(e) {
				self.fire('change', e);
			});

			return self._super();
		},

		remove: function() {
			DomUtils.off(this.getEl());
			this._super();
		}
	});
});

// Included from: js/tinymce/classes/ui/Throbber.js

/**
 * Throbber.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to display a Throbber for any element.
 *
 * @-x-less Throbber.less
 * @class tinymce.ui.Throbber
 */
define("tinymce/ui/Throbber", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	/**
	 * Constructs a new throbber.
	 *
	 * @constructor
	 * @param {Element} elm DOM Html element to display throbber in.
	 */
	return function(elm) {
		var self = this, state;

		/**
		 * Shows the throbber.
		 *
		 * @method show
		 * @param {Number} [time] Time to wait before showing.
		 * @return {tinymce.ui.Throbber} Current throbber instance.
		 */
		self.show = function(time) {
			self.hide();

			state = true;

			window.setTimeout(function() {
				if (state) {
					elm.appendChild(DomUtils.createFragment('<div class="mce-throbber"></div>'));
				}
			}, time || 0);

			return self;
		};

		/**
		 * Hides the throbber.
		 *
		 * @method hide
		 * @return {tinymce.ui.Throbber} Current throbber instance.
		 */
		self.hide = function() {
			var child = elm.lastChild;

			if (child && child.className.indexOf('throbber') != -1) {
				child.parentNode.removeChild(child);
			}

			state = false;

			return self;
		};
	};
});

expose(["tinymce/dom/Sizzle","tinymce/html/Styles","tinymce/dom/EventUtils","tinymce/dom/TreeWalker","tinymce/util/Tools","tinymce/dom/Range","tinymce/html/Entities","tinymce/Env","tinymce/dom/StyleSheetLoader","tinymce/dom/DOMUtils","tinymce/dom/ScriptLoader","tinymce/AddOnManager","tinymce/html/Node","tinymce/html/Schema","tinymce/html/SaxParser","tinymce/html/DomParser","tinymce/html/Writer","tinymce/html/Serializer","tinymce/dom/Serializer","tinymce/dom/TridentSelection","tinymce/util/VK","tinymce/dom/ControlSelection","tinymce/dom/RangeUtils","tinymce/dom/Selection","tinymce/Formatter","tinymce/UndoManager","tinymce/EnterKey","tinymce/ForceBlocks","tinymce/EditorCommands","tinymce/util/URI","tinymce/util/Class","tinymce/ui/Selector","tinymce/ui/Collection","tinymce/ui/DomUtils","tinymce/ui/Control","tinymce/ui/Factory","tinymce/ui/Container","tinymce/ui/DragHelper","tinymce/ui/Scrollable","tinymce/ui/Panel","tinymce/ui/Movable","tinymce/ui/Resizable","tinymce/ui/FloatPanel","tinymce/ui/KeyboardNavigation","tinymce/ui/Window","tinymce/ui/MessageBox","tinymce/WindowManager","tinymce/util/Quirks","tinymce/util/Observable","tinymce/Shortcuts","tinymce/Editor","tinymce/util/I18n","tinymce/FocusManager","tinymce/EditorManager","tinymce/LegacyInput","tinymce/util/XHR","tinymce/util/JSON","tinymce/util/JSONRequest","tinymce/util/JSONP","tinymce/util/LocalStorage","tinymce/Compat","tinymce/ui/Layout","tinymce/ui/AbsoluteLayout","tinymce/ui/Tooltip","tinymce/ui/Widget","tinymce/ui/Button","tinymce/ui/ButtonGroup","tinymce/ui/Checkbox","tinymce/ui/PanelButton","tinymce/ui/ColorButton","tinymce/ui/ComboBox","tinymce/ui/Path","tinymce/ui/ElementPath","tinymce/ui/FormItem","tinymce/ui/Form","tinymce/ui/FieldSet","tinymce/ui/FilePicker","tinymce/ui/FitLayout","tinymce/ui/FlexLayout","tinymce/ui/FlowLayout","tinymce/ui/FormatControls","tinymce/ui/GridLayout","tinymce/ui/Iframe","tinymce/ui/Label","tinymce/ui/Toolbar","tinymce/ui/MenuBar","tinymce/ui/MenuButton","tinymce/ui/ListBox","tinymce/ui/MenuItem","tinymce/ui/Menu","tinymce/ui/Radio","tinymce/ui/ResizeHandle","tinymce/ui/Spacer","tinymce/ui/SplitButton","tinymce/ui/StackLayout","tinymce/ui/TabPanel","tinymce/ui/TextBox","tinymce/ui/Throbber"]);
})(this);