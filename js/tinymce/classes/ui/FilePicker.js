/**
 * FilePicker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class creates a file picker control.
 *
 * @class tinymce.ui.FilePicker
 * @extends tinymce.ui.ComboBox
 */
define("tinymce/ui/FilePicker", [
	"tinymce/ui/ComboBox"
], function(ComboBox) {
	"use strict";

	return ComboBox.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
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