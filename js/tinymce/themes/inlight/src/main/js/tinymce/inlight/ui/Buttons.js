/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/ui/Buttons', [
	'tinymce/inlight/ui/Panel',
	'tinymce/inlight/file/Conversions',
	'tinymce/inlight/file/Picker',
	'tinymce/inlight/alien/Uuid'
], function (Panel, Conversions, Picker, Uuid) {
	var createTableHtml = function (cols, rows) {
		var x, y, html;

		html = '<table style="width: 100%">';
		for (y = 0; y < rows; y++) {
			html += '<tr>';

			for (x = 0; x < cols; x++) {
				html += '<td><br></td>';
			}

			html += '</tr>';
		}
		html += '</table>';

		return html;
	};

	var formatBlock = function (editor, formatName) {
		return function () {
			editor.execCommand('FormatBlock', false, formatName);
		};
	};

	var addHeaderButtons = function (editor) {
		for (var i = 1; i < 6; i++) {
			var name = 'h' + i;

			editor.addButton(name, {
				text: name.toUpperCase(),
				tooltip: 'Header ' + name,
				stateSelector: name,
				onclick: formatBlock(editor, name),
				onPostRender: function () {
					// TODO: Remove this hack that produces bold H1-H6 when we have proper icons
					var span = this.getEl().firstChild.firstChild;
					span.style.fontWeight = 'bold';
				}
			});
		}
	};

	var insertBlob = function (editor, base64, blob) {
		var blobCache, blobInfo;

		blobCache = editor.editorUpload.blobCache;
		blobInfo = blobCache.create(Uuid.uuid('mceu'), blob, base64);
		blobCache.add(blobInfo);

		editor.insertContent(editor.dom.createHTML('img', {src: blobInfo.blobUri()}));
	};

	var addToEditor = function (editor) {
		editor.addButton('quicklink', {
			icon: 'link',
			tooltip: 'Insert/Edit link',
			stateSelector: 'a[href]',
			onclick: function () {
				Panel.showForm(editor, 'quicklink');
			}
		});

		editor.addButton('quickimage', {
			icon: 'image',
			tooltip: 'Insert image',
			onclick: function () {
				Picker.pickFile().then(function (files) {
					var blob = files[0];

					Conversions.blobToBase64(blob).then(function (base64) {
						insertBlob(editor, base64, blob);
					});
				});
			}
		});

		editor.addButton('quicktable', {
			icon: 'table',
			tooltip: 'Insert table',
			onclick: function () {
				Panel.hide();
				editor.insertContent(createTableHtml(2, 2));
			}
		});

		addHeaderButtons(editor);
	};

	return {
		addToEditor: addToEditor
	};
});
