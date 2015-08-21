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

tinymce.PluginManager.add('anchor', function(editor) {
	function showDialog() {
		var selectedNode = editor.selection.getNode(), name = '';

		if (selectedNode.tagName == 'A') {
			name = selectedNode.name || selectedNode.id || '';
		}

		editor.windowManager.open({
			title: 'Anchor',
			body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: name},
			onsubmit: function(e) {
				editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
					id: e.data.name
				}));
			}
		});
	}

	editor.addButton('anchor', {
		icon: 'anchor',
		tooltip: 'Anchor',
		onclick: showDialog,
		stateSelector: 'a:not([href])'
	});

	editor.addMenuItem('anchor', {
		icon: 'anchor',
		text: 'Anchor',
		context: 'insert',
		onclick: showDialog
	});
});