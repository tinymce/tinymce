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
			var self = this, editor = tinymce.activeEditor, fileBrowserCallback, fileBrowserCallbackEnabled;

			settings.spellcheck = false;

			fileBrowserCallback = editor.settings.file_browser_callback;
			if (fileBrowserCallback) {
			
				fileBrowserCallbackEnabled = editor.settings.file_browser_callback_enabled;
				
				if (fileBrowserCallbackEnabled && typeof(fileBrowserCallbackEnabled) == 'string') {
					// Option enabled set to a string, check if the current fileBrowser match the setting
					// Current filetype possible values are file, image, and media
					// file_browser_callback_enabled should be set to something like file|image
					fileBrowserCallbackEnabled = fileBrowserCallbackEnabled.indexOf(settings.filetype) !== -1;
				} else if (typeof(fileBrowserCallbackEnabled) == 'undefined') {
					// Option not set, consider it enabled
					fileBrowserCallbackEnabled = true;
				}
				
				if (fileBrowserCallbackEnabled) {
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
			}

			self._super(settings);
		}
	});
});