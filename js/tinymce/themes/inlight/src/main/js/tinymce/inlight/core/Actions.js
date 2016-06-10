/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/Actions', [
	'tinymce/inlight/alien/Uuid',
	'tinymce/inlight/alien/Unlink'
], function (Uuid, Unlink) {
	var createTableHtml = function (cols, rows) {
		var x, y, html;

		html = '<table data-mce-id="mce" style="width: 100%">';
		html += '<tbody>';

		for (y = 0; y < rows; y++) {
			html += '<tr>';

			for (x = 0; x < cols; x++) {
				html += '<td><br></td>';
			}

			html += '</tr>';
		}

		html += '</tbody>';
		html += '</table>';

		return html;
	};

	var getInsertedElement = function (editor) {
		var elms = editor.dom.select('*[data-mce-id]');
		return elms[0];
	};

	var insertTable = function (editor, cols, rows) {
		editor.undoManager.transact(function () {
			var tableElm, cellElm;

			editor.insertContent(createTableHtml(cols, rows));

			tableElm = getInsertedElement(editor);
			tableElm.removeAttribute('data-mce-id');
			cellElm = editor.dom.select('td,th', tableElm);
			editor.selection.setCursorLocation(cellElm[0], 0);
		});
	};

	var formatBlock = function (editor, formatName) {
		editor.execCommand('FormatBlock', false, formatName);
	};

	var insertBlob = function (editor, base64, blob) {
		var blobCache, blobInfo;

		blobCache = editor.editorUpload.blobCache;
		blobInfo = blobCache.create(Uuid.uuid('mceu'), blob, base64);
		blobCache.add(blobInfo);

		editor.insertContent(editor.dom.createHTML('img', {src: blobInfo.blobUri()}));
	};

	var collapseSelectionToEnd = function (editor) {
		editor.selection.collapse(false);
	};

	var unlink = function (editor) {
		Unlink.unlinkSelection(editor);
		collapseSelectionToEnd(editor);
	};

	var createLink = function (editor, url) {
		var elm;

		if (url.trim().length === 0) {
			editor.focus();
			unlink(editor);
			return;
		}

		elm = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
		if (elm) {
			editor.dom.setAttrib(elm, 'href', url);
			editor.focus();
		} else {
			editor.execCommand('mceInsertLink', false, {href: url});
		}

		collapseSelectionToEnd(editor);
	};

	return {
		insertTable: insertTable,
		formatBlock: formatBlock,
		insertBlob: insertBlob,
		createLink: createLink,
		unlink: unlink
	};
});
