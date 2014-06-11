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
	"tinymce/ui/ComboBox",
	"tinymce/util/Tools"
], function(ComboBox, Tools) {
	"use strict";

	return ComboBox.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this, editor = tinymce.activeEditor, editorSettings = editor.settings;
			var actionCallback, fileBrowserCallback, fileBrowserCallbackTypes;

			settings.spellcheck = false;

			fileBrowserCallbackTypes = editorSettings.file_picker_types || editorSettings.file_browser_callback_types;
			if (fileBrowserCallbackTypes) {
				fileBrowserCallbackTypes = Tools.makeMap(fileBrowserCallbackTypes, /[, ]/);
			}

			if (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[settings.filetype]) {
				fileBrowserCallback = editorSettings.file_picker_callback;
				if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[settings.filetype])) {
					actionCallback = function() {
						var meta = self.fire('beforecall').meta;

						meta = Tools.extend({filetype: settings.filetype}, meta);

						// file_picker_callback(callback, currentValue, metaData)
						fileBrowserCallback.call(
							editor,
							function(value, meta) {
								self.value(value).fire('change', {meta: meta});
							},
							self.value(),
							meta
						);
					};
				} else {
					// Legacy callback: file_picker_callback(id, currentValue, filetype, window)
					fileBrowserCallback = editorSettings.file_browser_callback;
					if (fileBrowserCallback && (!fileBrowserCallbackTypes || fileBrowserCallbackTypes[settings.filetype])) {
						actionCallback = function() {
							fileBrowserCallback(
								self.getEl('inp').id,
								self.value(),
								settings.filetype,
								window
							);
						};
					}
				}
			}

			if (actionCallback) {
				settings.icon = 'browse';
				settings.onaction = actionCallback;
			}

			self._super(settings);
		}
	});
});