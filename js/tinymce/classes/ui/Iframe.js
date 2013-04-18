/**
 * Iframe.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/*jshint scripturl:true */

/**
 * ..
 *
 * @-x-less Iframe.less
 * @class tinymce.ui.Iframe
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Iframe", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		renderHtml: function() {
			var self = this;

			self.addClass('iframe');
			self.canFocus = false;

			return (
				'<iframe id="' + self._id + '" class="' + self.classes() + '" tabindex="-1" src="' +
				(self.settings.url || "javascript:\'\'") + '" frameborder="0"></iframe>'
			);
		},

		src: function(src) {
			this.getEl().src = src;
		},

		html: function(html) {
			this.getEl().contentWindow.document.body.innerHTML = html;
			return this;
		}
	});
});