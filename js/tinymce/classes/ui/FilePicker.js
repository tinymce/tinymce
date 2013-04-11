/**
 * FilePicker.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/*global tinymce:true */

/**
 * ..
 *
 * @class tinymce.ui.FilePicker
 * @extends tinymce.ui.ComboBox
 */
define("tinymce/ui/FilePicker", [
	"tinymce/ui/ComboBox"
], function(ComboBox) {
	"use strict";

	return ComboBox.extend({
		init: function(settings) {
			var self = this, editor = tinymce.activeEditor, fileBrowserCallback;

			settings.spellcheck = false;

			fileBrowserCallback = editor.settings.file_browser_callback;
			if (fileBrowserCallback) {
				settings.icon = 'browse';

				settings.onaction = function() {
					fileBrowserCallback(
						self.getEl('inp').id,
						self.getEl('inp').value,
						settings.filetype,
						window
					);
				};
			}

			self._super(settings);
		}
	});
});