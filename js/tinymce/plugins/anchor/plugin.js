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
	var isAnchorNode = function (node) {
		return !node.attr('href') && (node.attr('id') || node.attr('name')) && !node.firstChild;
	};

	var setContentEditable = function (state) {
		return function (nodes) {
			for (var i = 0; i < nodes.length; i++) {
				if (isAnchorNode(nodes[i])) {
					nodes[i].attr('contenteditable', state);
				}
			}
		};
	};

	var showDialog = function () {
		var selectedNode = editor.selection.getNode(), name = '';
		var isAnchor = selectedNode.tagName == 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';

		if (isAnchor) {
			name = selectedNode.name || selectedNode.id || '';
		}

		editor.windowManager.open({
			title: 'Anchor',
			body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: name},
			onsubmit: function(e) {
				var id = e.data.name;

				if (isAnchor) {
					selectedNode.id = id;
				} else {
					editor.selection.collapse(true);
					editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
						id: id
					}));
				}
			}
		});
	};

	if (tinymce.Env.ceFalse) {
		editor.on('PreInit', function () {
			editor.parser.addNodeFilter('a', setContentEditable('false'));
			editor.serializer.addNodeFilter('a', setContentEditable(null));
		});
	}

	editor.addCommand('mceAnchor', showDialog);

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