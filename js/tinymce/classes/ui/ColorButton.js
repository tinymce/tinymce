/**
 * ColorButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a color button control. This is a button that has a visual representation
 * of the currently selected color. It will also display a color picker if you click the control
 * allowing the user to select a new color.
 *
 * @-x-less ColorButton.less
 * @class tinymce.ui.ColorButton
 * @extends tinymce.ui.PanelButton
 */
define("tinymce/ui/ColorButton", [
	"tinymce/ui/PanelButton"
], function(PanelButton) {
	"use strict";

	return PanelButton.extend({
		/**
		 * Constructs a new ColorButton instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this._super(settings);
			this.addClass('colorbutton');
		},

		/**
		 * Getter/setter for the current color.
		 *
		 * @method color
		 * @param {String} [color] Color to set.
		 * @return {String|tinymce.ui.ColorButton} Current color or current instance.
		 */
		color: function(color) {
			if (color) {
				this._color = color;
				this.getEl('preview').style.backgroundColor = color;
				return this;
			}

			return this._color;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
			var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button role="presentation" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						'<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
						(self._text ? (icon ? ' ' : '') + self.encode(self._text) : '') +
					'</button>' +
				'</div>'
			);
		}
	});
});