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

tinymce.PluginManager.add('code', function(editor) {
	function showDialog() {
		editor.windowManager.open({
			title: "Source code",
			body: {
				type: 'textbox',
				name: 'code',
				multiline: true,
				minWidth: editor.getParam("code_dialog_width", 600),
				minHeight: editor.getParam("code_dialog_height", 500),
				value: editor.getContent({source_view: true}),
				spellcheck: false
			},
			onSubmit: function(e) {
				editor.undoManager.transact(function() {
					editor.setContent(e.data.code);
				});
	
				editor.nodeChanged();
			}
		});
	}

	editor.addCommand("mceCodeEditor", showDialog);

	editor.addButton('code', {
		icon: 'code',
		tooltip: 'Source code',
		onclick: showDialog
	});

	editor.addMenuItem('code', {
		icon: 'code',
		text: 'Source code',
		context: 'tools',
		onclick: showDialog
	});
});