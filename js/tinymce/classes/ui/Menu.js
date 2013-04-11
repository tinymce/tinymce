/**
 * Menu.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Menu.less
 * @class tinymce.ui.Menu
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/Menu", [
	"tinymce/ui/FloatPanel",
	"tinymce/ui/KeyboardNavigation",
	"tinymce/ui/MenuItem"
], function(FloatPanel, KeyboardNavigation, MenuItem) {
	"use strict";

	var Menu = FloatPanel.extend({
		Defaults: {
			defaultType: 'menuitem',
			border: 1,
			layout: 'stack',
			role: 'menu'
		},

		init: function(settings) {
			var self = this;

			settings.autohide = true;

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

		repaint: function() {
			this.toggleClass('menu-align', true);

			this._super();

			this.getEl().style.height = '';
			this.getEl('body').style.height = '';

			return this;
		},

		cancel: function() {
			var self = this;

			self.hideAll();
			self.fire('cancel');
			self.fire('select');
		},

		hideAll: function() {
			var self = this;

			this.find('menuitem').exec('hideMenu');

			return self._super();
		},

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