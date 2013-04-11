/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains the tinymce plugin logic for the paste plugin.
 *
 * @class tinymce.pasteplugin.Plugin
 * @private
 */
define("tinymce/pasteplugin/Plugin", [
	"tinymce/PluginManager",
	"tinymce/pasteplugin/Clipboard",
	"tinymce/pasteplugin/WordFilter",
	"tinymce/pasteplugin/Quirks"
], function(PluginManager, Clipboard, WordFilter, Quirks) {
	PluginManager.add('paste', function(editor) {
		var self = this;

		self.clipboard = new Clipboard(editor);
		self.quirks = new Quirks(editor);
		self.wordFilter = new WordFilter(editor);

		editor.addCommand('mceInsertClipboardContent', function(ui, value) {
			if (value.content) {
				self.clipboard.paste(value.content);
			}

			if (value.text) {
				self.clipboard.pasteText(value.text);
			}
		});
	});
});