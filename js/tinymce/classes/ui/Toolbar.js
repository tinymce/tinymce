/**
 * Toolbar.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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

		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('toolbar');
		},

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