/**
 * Container.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * Base container control. This will be extended by all controls
 * that can have children such as panels etc.
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
		 * Constructor for the control.
		 *
		 * @constructor
		 * @method init
		 * @param {Object} settings Settings name/value object.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			settings = self.settings;

			self._items = new Collection();

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

		focus: function() {
			var self = this;

			if (self.keyNav) {
				self.keyNav.focusFirst();
			} else {
				self._super();
			}

			return self;
		},

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

		append: function(items) {
			return this.add(items).renderNew();
		},

		prepend: function(items) {
			var self = this;

			self.items().set(self.create(items).concat(self.items().toArray()));

			return self.renderNew();
		},

		insert: function(items, index, before) {
			var self = this, curItems, beforeItems, afterItems;

			items = self.create(items);
			curItems = self.items();

			if (!before) {
				index += 1;
			}

			if (index >= 0 && index < curItems.length) {
				beforeItems = curItems.slice(0, index).toArray();
				afterItems = curItems.slice(index).toArray();
				curItems.set(beforeItems.concat(items, afterItems));
			}

			return self.renderNew();
		},

		preRender: function() {
		},

		renderHtml: function() {
			var self = this, layout = self._layout;

			self.preRender();
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" role="' + this.settings.role + '">' +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">'+
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		},

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

		initLayoutRect: function() {
			var self = this, layoutRect = self._super();

			// Recalc container size by asking layout manager
			self._layout.recalc(self);

			return layoutRect;
		},

		recalc: function() {
			var self = this, rect = self._layoutRect, lastRect = self._lastRect;

			if (!lastRect || lastRect.w != rect.w || lastRect.h != rect.h) {
				self._layout.recalc(self);
				rect = self.layoutRect();
				self._lastRect = {x: rect.x, y: rect.y, w: rect.w, h: rect.h};
				return true;
			}
		},

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