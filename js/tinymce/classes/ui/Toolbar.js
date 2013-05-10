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