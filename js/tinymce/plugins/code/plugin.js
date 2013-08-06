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
	function showSourceEditor() {
		editor.windowManager.open({
			title: "Source code",
            width: parseInt(editor.getParam("plugin_code_width", "600"), 10),
            height: parseInt(editor.getParam("plugin_code_height", "600"), 10),
			body: {
				type: 'textbox',
				name: 'code',
				multiline: true,
                minHeight: parseInt(editor.getParam("plugin_code_height", "600"), 10)-50,
				value: editor.getContent({source_view: true}),
				spellcheck: false
			},
			onSubmit: function(e) {
				editor.setContent(e.data.code);
			}
		});
	}

	editor.addButton('code', {
		icon: 'code',
		tooltip: 'Source code',
		onclick: showSourceEditor
	});

	editor.addMenuItem('code', {
		icon: 'code',
		text: 'Source code',
		context: 'tools',
		onclick: showSourceEditor
	});
});