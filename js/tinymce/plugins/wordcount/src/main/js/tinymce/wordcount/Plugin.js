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
	"tinymce.wordcount.text.WordGetter"
], function(PluginManager, WordGetter) {

	PluginManager.add('wordcount', function(editor) {
		var self = this;

		function update() {
			editor.theme.panel.find('#wordcount').text(['Words: {0}', self.getCount()]);
		}

		editor.on('init', function() {
			var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];

			if (statusbar) {
				tinymce.util.Delay.setEditorTimeout(editor, function() {
					statusbar.insert({
						type: 'label',
						name: 'wordcount',
						text: ['Words: {0}', self.getCount()],
						classes: 'wordcount',
						disabled: editor.settings.readonly
					}, 0);

					editor.on('setcontent beforeaddundo', update);

					editor.on('keyup', function(e) {
						if (e.keyCode == 32) {
							update();
						}
					});
				}, 0);
			}
		});

		self.getCount = function() {
			var tx = editor.getContent({format: 'raw'});
			var tc = 0;

			if (tx) {
				tx = tx.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' '); // remove html tags and space chars

				// deal with html entities
				tx = tx.replace(/(\w+)(&#?[a-z0-9]+;)+(\w+)/i, "$1$3").replace(/&.+?;/g, ' ');

				var wordArray = WordGetter(tx);
				if (wordArray) {
					tc = wordArray.length;
				}
			}

			return tc;
		};
	});

	return {
		plugin: WordGetter
	};
});
