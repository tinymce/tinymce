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