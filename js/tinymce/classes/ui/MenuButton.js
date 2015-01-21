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
	"tinymce/ui/Factory"
], function(Button, Factory) {
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

				self.menu = Factory.create(menu).parent(self).renderTo();
				self.fire('createmenu');
				self.menu.reflow();
				self.menu.on('cancel', function(e) {
					if (e.control.parent() === self.menu) {
						e.stopPropagation();
						e.preventDefault();
						self.focus();
						self.hideMenu();
					}
				});

				// Move focus to button when a menu item is selected/clicked
				self.menu.on('select', function() {
					self.focus();
				});

				self.menu.on('show hide', function(e) {
					if (e.control == self.menu) {
						self.activeMenu(e.type == 'show');
					}

					self.aria('expanded', e.type == 'show');
				}).fire('show');
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
			var icon = self.settings.icon, image;

			image = self.settings.image;
			if (image) {
				icon = 'none';

				// Support for [high dpi, low dpi] image sources
				if (typeof image != "string") {
					image = window.getSelection ? image[0] : image[1];
				}

				image = ' style="background-image: url(\'' + image + '\')"';
			} else {
				image = '';
			}

			icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

			var parentrolemap = {
				buttongroup: 'button',
				toolbar: 'button',
				menubar: 'menuitem'
			};
			self.aria('role', parentrolemap[self.parent().type] || 'combobox');

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button id="' + id + '-open" role="presentation" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
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

					if (e.aria) {
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
