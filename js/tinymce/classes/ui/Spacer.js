/**
 * Spacer.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a spacer. This control is used in flex layouts for example.
 *
 * @-x-less Spacer.less
 * @class tinymce.ui.Spacer
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Spacer", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			self.addClass('spacer');
			self.canFocus = false;

			return '<div id="' + self._id + '" class="' + self.classes() + '"></div>';
		}
	});
});