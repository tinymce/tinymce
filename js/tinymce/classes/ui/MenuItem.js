/**
 * MenuItem.js
 *
 * Copyright 2003-2013, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less MenuItem.less
 * @class tinymce.ui.MenuItem
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/MenuItem", [
	"tinymce/ui/Widget",
	"tinymce/ui/Factory"
], function(Widget, Factory) {
	"use strict";

	return Widget.extend({
		Defaults: {
			border: 0,
			role: 'menuitem'
		},

		init: function(settings) {
			var self = this;

			self.hasPopup = true;

			self._super(settings);

			settings = self.settings;

			self.addClass('menu-item');

			if (settings.menu) {
				self.addClass('menu-item-expand');
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

		hasMenus: function() {
			return !!this.settings.menu;
		},

		showMenu: function() {
			var self = this, settings = self.settings, menu;

			self.parent().items().each(function(ctrl) {
				if (ctrl !== self) {
					ctrl.hideMenu();
				}
			});

			if (settings.menu) {
				if (!self.menu) {
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

					self.menu = Factory.create(menu).parent(self).renderTo(self.getContainerElm());
					self.menu.reflow();
					self.menu.fire('show');
					self.menu.on('cancel', function() {
						self.focus();
					});

					self.menu.on('hide', function(e) {
						if (e.control === self.menu) {
							self.removeClass('selected');
						}
					});
				} else {
					self.menu.show();
				}

				self.menu._parentMenu = self.parent();

				self.menu.addClass('menu-sub');
				self.menu.moveRel(self.getEl(), 'tr-tl');
				self.addClass('selected');
				self.aria('expanded', true);
			}
		},

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

		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix, text = self.encode(self._text);
			var icon = self.settings.icon;

			if (icon) {
				self.parent().addClass('menu-has-icons');
			}

			icon = prefix + 'ico ' + prefix + 'i-' + (self.settings.icon || 'none');

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					(text !== '-' ? '<i class="' + icon + '"></i>&nbsp;' : '') +
					(text !== '-' ? '<span id="' + id + '-text" class="' + prefix + 'text">' + text + '</span>' : '') +
					(settings.shortcut ? '<div id="' + id + '-shortcut" class="' + prefix + 'menu-shortcut">' +
						settings.shortcut + '</div>' : '') +
					(settings.menu ? '<div class="' + prefix + 'caret"></div>' : '') +
				'</div>'
			);
		},

		postRender: function() {
			var self = this, settings = self.settings;

			var textStyle = settings.textStyle;
			if (typeof(textStyle) == "function") {
				textStyle = textStyle();
			}

			if (textStyle) {
				var textElm = self.getEl('text');
				if (textElm) {
					textElm.setAttribute('style', textStyle);
				}
			}

			return self._super();
		},

		remove: function() {
			this._super();

			if (this.menu) {
				this.menu.remove();
			}
		}
	});
});