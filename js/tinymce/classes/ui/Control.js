/**
 * Control.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint consistent-this:0 */

/**
 * This is the base class for all controls and containers. All UI control instances inherit
 * from this one as it has the base logic needed by all of them.
 *
 * @class tinymce.ui.Control
 */
define("tinymce/ui/Control", [
	"tinymce/util/Class",
	"tinymce/util/Tools",
	"tinymce/util/EventDispatcher",
	"tinymce/ui/Collection",
	"tinymce/ui/DomUtils"
], function(Class, Tools, EventDispatcher, Collection, DomUtils) {
	"use strict";

	var elementIdCache = {};
	var hasMouseWheelEventSupport = "onmousewheel" in document;
	var hasWheelEventSupport = false;
	var classPrefix = "mce-";

	function getEventDispatcher(obj) {
		if (!obj._eventDispatcher) {
			obj._eventDispatcher = new EventDispatcher({
				scope: obj,
				toggleEvent: function(name, state) {
					if (state && EventDispatcher.isNative(name)) {
						if (!obj._nativeEvents) {
							obj._nativeEvents = {};
						}

						obj._nativeEvents[name] = true;

						if (obj._rendered) {
							obj.bindPendingEvents();
						}
					}
				}
			});
		}

		return obj._eventDispatcher;
	}

	var Control = Class.extend({
		Statics: {
			elementIdCache: elementIdCache,
			classPrefix: classPrefix
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
		classPrefix: classPrefix,

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
			self._id = settings.id || DomUtils.id();
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
			var self = this;

			function resolveCallbackName(name) {
				var callback, scope;

				if (typeof(name) != 'string') {
					return name;
				}

				return function(e) {
					if (!callback) {
						self.parentsAndSelf().each(function(ctrl) {
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

			getEventDispatcher(self).on(name, resolveCallbackName(callback));

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
			getEventDispatcher(this).off(name, callback);
			return this;
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
			var self = this;

			args = args || {};

			if (!args.control) {
				args.control = self;
			}

			args = getEventDispatcher(self).fire(name, args);

			// Bubble event up to parents
			if (bubble !== false && self.parent) {
				var parent = self.parent();
				while (parent && !args.isPropagationStopped()) {
					parent.fire(name, args, false);
					parent = parent.parent();
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
			return getEventDispatcher(this).has(name);
		},

		/**
		 * Returns a control collection with all parent controls.
		 *
		 * @method parents
		 * @param {String} selector Optional selector expression to find parents.
		 * @return {tinymce.ui.Collection} Collection with all parent controls.
		 */
		parents: function(selector) {
			var self = this, ctrl, parents = new Collection();

			// Add each parent to collection
			for (ctrl = self.parent(); ctrl; ctrl = ctrl.parent()) {
				parents.add(ctrl);
			}

			// Filter away everything that doesn't match the selector
			if (selector) {
				parents = parents.filter(selector);
			}

			return parents;
		},

		/**
		 * Returns the current control and it's parents.
		 *
		 * @method parentsAndSelf
		 * @param {String} selector Optional selector expression to find parents.
		 * @return {tinymce.ui.Collection} Collection with all parent controls.
		 */
		parentsAndSelf: function(selector) {
			return new Collection(this).add(this.parents(selector));
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
			var self = this, elm = self.getEl(self.ariaTarget);

			if (typeof(value) === "undefined") {
				return self._aria[name];
			} else {
				self._aria[name] = value;
			}

			if (self._rendered) {
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
			if (translate !== false) {
				text = this.translate(text);
			}

			return (text || '').replace(/[&<>"]/g, function(match) {
				return '&#' + match.charCodeAt(0) + ';';
			});
		},

		/**
		 * Returns the translated string.
		 *
		 * @method translate
		 * @param {String} text Text to translate.
		 * @return {String} Translated string or the same as the input.
		 */
		translate: function(text) {
			return Control.translate ? Control.translate(text) : text;
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
					e.deltaY = -1 / 40 * e.wheelDelta;

					if (e.wheelDeltaX) {
						e.deltaX = -1 / 40 * e.wheelDeltaX;
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

				var eventRootDelegates = eventRootCtrl._delegates;
				if (!eventRootDelegates) {
					eventRootDelegates = eventRootCtrl._delegates = {};
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
					} else if (!eventRootDelegates[name]) {
						DomUtils.on(eventRootCtrl.getEl(), name, delegate);
						eventRootDelegates[name] = true;
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