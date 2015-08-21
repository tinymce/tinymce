/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('visualchars', function(editor) {
	var self = this, state;

	function toggleVisualChars(addBookmark) {
		var node, nodeList, i, body = editor.getBody(), nodeValue, selection = editor.selection, div, bookmark;
		var charMap, visualCharsRegExp;

		charMap = {
			'\u00a0': 'nbsp',
			'\u00ad': 'shy'
		};

		function wrapCharWithSpan(value) {
			return '<span data-mce-bogus="1" class="mce-' + charMap[value] + '">' + value + '</span>';
		}

		function compileCharMapToRegExp() {
			var key, regExp = '';

			for (key in charMap) {
				regExp += key;
			}

			return new RegExp('[' + regExp + ']', 'g');
		}

		function compileCharMapToCssSelector() {
			var key, selector = '';

			for (key in charMap) {
				if (selector) {
					selector += ',';
				}

				selector += 'span.mce-' + charMap[key];
			}

			return selector;
		}

		state = !state;
		self.state = state;
		editor.fire('VisualChars', {state: state});
		visualCharsRegExp = compileCharMapToRegExp();

		if (addBookmark) {
			bookmark = selection.getBookmark();
		}

		if (state) {
			nodeList = [];
			tinymce.walk(body, function(n) {
				if (n.nodeType == 3 && n.nodeValue && visualCharsRegExp.test(n.nodeValue)) {
					nodeList.push(n);
				}
			}, 'childNodes');

			for (i = 0; i < nodeList.length; i++) {
				nodeValue = nodeList[i].nodeValue;
				nodeValue = nodeValue.replace(visualCharsRegExp, wrapCharWithSpan);

				div = editor.dom.create('div', null, nodeValue);
				while ((node = div.lastChild)) {
					editor.dom.insertAfter(node, nodeList[i]);
				}

				editor.dom.remove(nodeList[i]);
			}
		} else {
			nodeList = editor.dom.select(compileCharMapToCssSelector(), body);

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
