/**
 * Iframe.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * This class creates an iframe.
 *
 * @setting {String} url Url to open in the iframe.
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
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			self.addClass('iframe');
			self.canFocus = false;

			return (
				'<iframe id="' + self._id + '" class="' + self.classes() + '" tabindex="-1" src="' +
				(self.settings.url || "javascript:\'\'") + '" frameborder="0"></iframe>'
			);
		},

		/**
		 * Setter for the iframe source.
		 *
		 * @method src
		 * @param {String} src Source URL for iframe.
		 */
		src: function(src) {
			this.getEl().src = src;
		},

		/**
		 * Inner HTML for the iframe.
		 *
		 * @method html
		 * @param {String} html HTML string to set as HTML inside the iframe.
		 * @return {tinymce.ui.Iframe} Current iframe control.
		 */
		html: function(html) {
			this.getEl().contentWindow.document.body.innerHTML = html;
			return this;
		}
	});
});