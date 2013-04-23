/**
 * ColorButton.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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
		init: function(settings) {
			this._super(settings);
			this.addClass('colorbutton');
		},

		showPreview: function(color) {
			this.getEl('preview').style.backgroundColor = color;
		},

		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
			var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button role="presentation" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						'<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
						(self._text ? (icon ? ' ' : '') + self.encode(self._text) : '') +
					'</button>' +
				'</div>'
			);
		}
	});
});