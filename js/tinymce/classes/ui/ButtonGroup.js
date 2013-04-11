/**
 * ButtonGroup.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less ButtonGroup.less
 * @class tinymce.ui.ButtonGroup
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/ButtonGroup", [
	"tinymce/ui/Container"
], function(Container) {
	"use strict";

	return Container.extend({
		Defaults: {
			defaultType: 'button',
			role: 'toolbar'
		},

		renderHtml: function() {
			var self = this, layout = self._layout;

			self.addClass('btn-group');
			self.preRender();
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">'+
					'<div id="' + self._id + '-body">'+
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		}
	});
});