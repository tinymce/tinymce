/**
 * Menu.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/ui/MenuItem",
	"tinymce/util/Tools"
], function(FloatPanel, MenuItem, Tools) {
	"use strict";

	return FloatPanel.extend({
		Defaults: {
			defaultType: 'menuitem',
			border: 1,
			layout: 'stack',
			role: 'application',
			bodyRole: 'menu',
			ariaRoot: true
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
			self.classes.add('menu');
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			this.classes.toggle('menu-align', true);

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

				if (settings.icon || settings.image || settings.selectable) {
					self._hasIcons = true;
					return false;
				}
			});

			return self._super();
		}
	});
});
