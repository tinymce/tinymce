/**
 * FormItem.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.FormItem
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/FormItem", [
	"tinymce/ui/Container"
], function(Container) {
	"use strict";

	return Container.extend({
		Defaults: {
			layout: 'flex',
			align: 'center',
			defaults: {
				flex: 1
			}
		},

		renderHtml: function() {
			var self = this, layout = self._layout, prefix = self.classPrefix;

			self.addClass('formitem');
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self.settings.title ? ('<div id="' + self._id + '-title" class="' + prefix + 'title">' +
						self.settings.title + '</div>') : '') +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		}
	});
});