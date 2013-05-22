/**
 * FormItem.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is a container created by the form element with
 * a label and control item.
 *
 * @class tinymce.ui.FormItem
 * @extends tinymce.ui.Container
 * @setting {String} label Label to display for the form item.
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

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
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