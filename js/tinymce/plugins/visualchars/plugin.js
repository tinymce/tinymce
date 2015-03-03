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

tinymce.PluginManager.add('visualchars', function(editor) {
	var self = this, state;

	function toggleVisualChars(addBookmark) {
		var node, nodeList, i, body = editor.getBody(), nodeValue, selection = editor.selection, div, bookmark;

		state = !state;
		self.state = state;
		editor.fire('VisualChars', {state: state});

		if (addBookmark) {
			bookmark = selection.getBookmark();
		}

		if (state) {
			nodeList = [];
			tinymce.walk(body, function(n) {
				if (n.nodeType == 3 && n.nodeValue && n.nodeValue.indexOf('\u00A0') != -1) {
					nodeList.push(n);
				} else if (n.nodeType == 3 && n.nodeValue && n.nodeValue.indexOf('\u00AD') != -1) {
					nodeList.push(n);
				}
			}, 'childNodes');

			for (i = 0; i < nodeList.length; i++) {
				nodeValue = nodeList[i].nodeValue;
				console.log(nodeValue);
				nodeValue = nodeValue.replace(/(\u00A0)/g, '<span data-mce-bogus="1" class="mce-nbsp">$1</span>').replace(/(\u00AD)/g, '<span data-mce-bogus="1" class="mce-shy">$1</span>');

				div = editor.dom.create('div', null, nodeValue);
				while ((node = div.lastChild)) {
					editor.dom.insertAfter(node, nodeList[i]);
				}

				editor.dom.remove(nodeList[i]);
			}
		} else {
			nodeList = editor.dom.select('span.mce-nbsp, span.mce-shy', body);

			for (i = nodeList.length - 1; i >= 0; i--) {
				editor.dom.remove(nodeList[i], 1);
			}
		}

		selection.moveToBookmark(bookmark);
	}

	function toggleActiveState() {
		var self = this;

		editor.on('VisualChars', function(e) {
			self.active(e.state);
		});
	}

	editor.addCommand('mceVisualChars', toggleVisualChars);

	editor.addButton('visualchars', {
		title: 'Show invisible characters',
		cmd: 'mceVisualChars',
		onPostRender: toggleActiveState
	});

	editor.addMenuItem('visualchars', {
		text: 'Show invisible characters',
		cmd: 'mceVisualChars',
		onPostRender: toggleActiveState,
		selectable: true,
		context: 'view',
		prependToContext: true
	});

	editor.on('beforegetcontent', function(e) {
		if (state && e.format != 'raw' && !e.draft) {
			state = true;
			toggleVisualChars(false);
		}
	});
});
