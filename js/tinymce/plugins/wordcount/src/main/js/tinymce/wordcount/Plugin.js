/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
/* global tinymce: true */

define("tinymce.wordcount.Plugin", [
	"global!tinymce.PluginManager",
	"global!tinymce.util.Delay",
	"tinymce.wordcount.text.WordGetter"
], function(PluginManager, Delay, WordGetter) {
	PluginManager.add('wordcount', function(editor) {
		var getTextContent = function(editor) {
			return editor.removed ? '' : editor.getBody().innerText;
		};

		var getCount = function() {
			return WordGetter.getWords(getTextContent(editor)).length;
		};

		var update = function() {
			editor.theme.panel.find('#wordcount').text(['Words: {0}', getCount()]);
		};

		editor.on('init', function() {
			var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];
			var debouncedUpdate = Delay.debounce(update, 300);

			if (statusbar) {
				tinymce.util.Delay.setEditorTimeout(editor, function() {
					statusbar.insert({
						type: 'label',
						name: 'wordcount',
						text: ['Words: {0}', getCount()],
						classes: 'wordcount',
						disabled: editor.settings.readonly
					}, 0);

					editor.on('setcontent beforeaddundo undo redo keyup', debouncedUpdate);
				}, 0);
			}
		});

		return {
			getCount: getCount
		};
	});

	return function () {};
});
