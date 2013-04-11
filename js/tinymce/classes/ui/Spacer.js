/**
 * Spacer.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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
		renderHtml: function() {
			var self = this;

			self.addClass('spacer');
			self.canFocus = false;

			return '<div id="' + self._id + '" class="' + self.classes() + '"></div>';
		}
	});
});