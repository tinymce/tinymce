/**
 * MenuItem.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/Env",
	"tinymce/util/Delay"
], function(Widget, Factory, Env, Delay) {
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
			var self = this, text;

			self._super(settings);

			settings = self.settings;

			self.classes.add('menu-item');

			if (settings.menu) {
				self.classes.add('menu-item-expand');
			}

			if (settings.preview) {
				self.classes.add('menu-item-preview');
			}

			text = self.state.get('text');
			if (text === '-' || text === '|') {
				self.classes.add('menu-item-sep');
				self.aria('role', 'separator');
				self.state.set('text', '-');
			}

			if (settings.selectable) {
				self.aria('role', 'menuitemcheckbox');
				self.classes.add('menu-item-checkbox');
				settings.icon = 'selected';
			}

			if (!settings.preview && !settings.selectable) {
				self.classes.add('menu-item-normal');
			}

			self.on('mousedown', function(e) {
				e.preventDefault();
			});

			if (settings.menu && !settings.ariaHideMenu) {
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

					menu = self.menu = Factory.create(menu).parent(self).renderTo();
					menu.reflow();
					menu.on('cancel', function(e) {
						e.stopPropagation();
						self.focus();
						menu.hide();
					});
					menu.on('show hide', function(e) {
						e.control.items().each(function(ctrl) {
							ctrl.active(ctrl.settings.selected);
						});
					}).fire('show');

					menu.on('hide', function(e) {
						if (e.control === menu) {
							self.classes.remove('selected');
						}
					});

					menu.submenu = true;
				} else {
					menu.show();
				}

				menu._parentMenu = parent;

				menu.classes.add('menu-sub');

				var rel = menu.testMoveRel(
					self.getEl(),
					self.isRtl() ? ['tl-tr', 'bl-br', 'tr-tl', 'br-bl'] : ['tr-tl', 'br-bl', 'tl-tr', 'bl-br']
				);

				menu.moveRel(self.getEl(), rel);
				menu.rel = rel;

				rel = 'menu-sub-' + rel;
				menu.classes.remove(menu._lastRel).add(rel);
				menu._lastRel = rel;

				self.classes.add('selected');
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
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix, text = self.encode(self.state.get('text'));
			var icon = self.settings.icon, image = '', shortcut = settings.shortcut;

			// Converts shortcut format to Mac/PC variants
			function convertShortcut(shortcut) {
				var i, value, replace = {};

				if (Env.mac) {
					replace = {
						alt: '&#x2325;',
						ctrl: '&#x2318;',
						shift: '&#x21E7;',
						meta: '&#x2318;'
					};
				} else {
					replace = {
						meta: 'Ctrl'
					};
				}

				shortcut = shortcut.split('+');

				for (i = 0; i < shortcut.length; i++) {
					value = replace[shortcut[i].toLowerCase()];

					if (value) {
						shortcut[i] = value;
					}
				}

				return shortcut.join('+');
			}

			if (icon) {
				self.parent().classes.add('menu-has-icons');
			}

			if (settings.image) {
				image = ' style="background-image: url(\'' + settings.image + '\')"';
			}

			if (shortcut) {
				shortcut = convertShortcut(shortcut);
			}

			icon = prefix + 'ico ' + prefix + 'i-' + (self.settings.icon || 'none');

			return (
				'<div id="' + id + '" class="' + self.classes + '" tabindex="-1">' +
					(text !== '-' ? '<i class="' + icon + '"' + image + '></i>\u00a0' : '') +
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
			if (typeof textStyle == "function") {
				textStyle = textStyle.call(this);
			}

			if (textStyle) {
				var textElm = self.getEl('text');
				if (textElm) {
					textElm.setAttribute('style', textStyle);
				}
			}

			self.on('mouseenter click', function(e) {
				if (e.control === self) {
					if (!settings.menu && e.type === 'click') {
						self.fire('select');

						// Edge will crash if you stress it see #2660
						Delay.requestAnimationFrame(function() {
							self.parent().hideAll();
						});
					} else {
						self.showMenu();

						if (e.aria) {
							self.menu.focus(true);
						}
					}
				}
			});

			self._super();

			return self;
		},

		hover: function() {
			var self = this;

			self.parent().items().each(function(ctrl) {
				ctrl.classes.remove('selected');
			});

			self.classes.toggle('selected', true);

			return self;
		},

		active: function(state) {
			if (typeof state != "undefined") {
				this.aria('checked', state);
			}

			return this._super(state);
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
