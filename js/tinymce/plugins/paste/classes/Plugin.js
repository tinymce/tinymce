/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	var userIsInformed;

	PluginManager.add('paste', function(editor) {
		var self = this, clipboard, settings = editor.settings;

		function isUserInformedAboutPlainText() {
			return userIsInformed || editor.settings.paste_plaintext_inform === false;
		}

		function togglePlainTextPaste() {
			if (clipboard.pasteFormat == "text") {
				clipboard.pasteFormat = "html";
				editor.fire('PastePlainTextToggle', {state: false});
			} else {
				clipboard.pasteFormat = "text";
				editor.fire('PastePlainTextToggle', {state: true});

				if (!isUserInformedAboutPlainText()) {
					var message = editor.translate('Paste is now in plain text mode. Contents will now ' +
					'be pasted as plain text until you toggle this option off.');

					editor.notificationManager.open({
						text: message,
						type: 'info'
					});

					userIsInformed = true;
				}
			}

			editor.focus();
		}

		function stateChange() {
			var self = this;

			self.active(clipboard.pasteFormat === 'text');

			editor.on('PastePlainTextToggle', function (e) {
				self.active(e.state);
			});
		}

		// draw back if power version is requested and registered
		if (/(^|[ ,])powerpaste([, ]|$)/.test(settings.plugins) && PluginManager.get('powerpaste')) {
			/*eslint no-console:0 */
			if (typeof console !== "undefined" && console.log) {
				console.log("PowerPaste is incompatible with Paste plugin! Remove 'paste' from the 'plugins' option.");
			}
			return;
		}

		self.clipboard = clipboard = new Clipboard(editor);
		self.quirks = new Quirks(editor);
		self.wordFilter = new WordFilter(editor);

		if (editor.settings.paste_as_text) {
			self.clipboard.pasteFormat = "text";
		}

		if (settings.paste_preprocess) {
			editor.on('PastePreProcess', function(e) {
				settings.paste_preprocess.call(self, self, e);
			});
		}

		if (settings.paste_postprocess) {
			editor.on('PastePostProcess', function(e) {
				settings.paste_postprocess.call(self, self, e);
			});
		}

		editor.addCommand('mceInsertClipboardContent', function(ui, value) {
			if (value.content) {
				self.clipboard.pasteHtml(value.content);
			}

			if (value.text) {
				self.clipboard.pasteText(value.text);
			}
		});

		// Block all drag/drop events
		if (editor.settings.paste_block_drop) {
			editor.on('dragend dragover draggesture dragdrop drop drag', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}

		// Prevent users from dropping data images on Gecko
		if (!editor.settings.paste_data_images) {
			editor.on('drop', function(e) {
				var dataTransfer = e.dataTransfer;

				if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
					e.preventDefault();
				}
			});
		}

		editor.addCommand('mceTogglePlainTextPaste', togglePlainTextPaste);

		editor.addButton('pastetext', {
			icon: 'pastetext',
			tooltip: 'Paste as text',
			onclick: togglePlainTextPaste,
			onPostRender: stateChange
		});

		editor.addMenuItem('pastetext', {
			text: 'Paste as text',
			selectable: true,
			active: clipboard.pasteFormat,
			onclick: togglePlainTextPaste,
			onPostRender: stateChange
		});
	});
});
