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
	"tinymce/ui/KeyboardNavigation",
	"tinymce/util/Tools",
	"tinymce/ui/DomUtils"
], function(Control, Collection, Selector, Factory, KeyboardNavigation, Tools, DomUtils) {
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
		 * @param {Boolean} keyboard Optional true/false if the focus was a keyboard focus or not.
		 * @return {tinymce.ui.Collection} Current instance.
		 */
		focus: function(keyboard) {
			var self = this, focusCtrl, keyboardNav, items;

			if (keyboard) {
				keyboardNav = self.keyboardNav || self.parents().eq(-1)[0].keyboardNav;

				if (keyboardNav) {
					keyboardNav.focusFirst(self);
					return;
				}
			}

			items = self.find('*');

			// TODO: Figure out a better way to auto focus alert dialog buttons
			if (self.statusbar) {
				items.add(self.statusbar.items());
			}

			items.each(function(ctrl) {
				if (ctrl.settings.autofocus) {
					focusCtrl = null;
					return false;
				}

				if (ctrl.canFocus) {
					focusCtrl = focusCtrl || ctrl;
				}
			});

			if (focusCtrl) {
				focusCtrl.focus();
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

			if (!self.parent()) {
				self.keyboardNav = new KeyboardNavigation({
					root: self
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