/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('wordcount', function(editor) {
	var self = this, countre, cleanre;

	countre = editor.getParam('wordcount_countregex', /[\w\u2019\x27\-\u0600-\u06FF]+/g); // u2019 == &rsquo;
	cleanre = editor.getParam('wordcount_cleanregex', /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g);

	function update() {
		editor.theme.panel.find('#wordcount').text(['Words: {0}', self.getCount()]);
	}

	editor.on('init', function() {
		var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];

		if (statusbar) {
			window.setTimeout(function() {
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
			tx = tx.replace(/\.\.\./g, ' '); // convert ellipses to spaces
			tx = tx.replace(/<.[^<>]*?>/g, ' ').replace(/&#xa0;|&#160;/gi, ' '); // remove html tags and space chars

			// deal with html entities
			tx = tx.replace(/(\w+)(&.+?;)+(\w+)/, "$1$3").replace(/&.+?;/g, ' ');
			tx = tx.replace(cleanre, ''); // remove numbers and punctuation

			var wordArray = tx.match(countre);
			if (wordArray) {
				tc = wordArray.length;
			}
		}

		return tc;
	};
});