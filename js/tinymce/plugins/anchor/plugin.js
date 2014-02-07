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

tinymce.PluginManager.add('anchor', function(editor) {
    function showDialog() {
        var selectedNode = editor.selection.getNode(), settings = editor.settings, fields;

        if (settings.allow_html_in_named_anchor) {
            fields = [
                { type: 'textbox', name: 'name', size: 40, label: 'Name', value: selectedNode.name || selectedNode.id },
                { type: 'textbox', name: 'html', size: 40, label: 'Html', value: '' }
            ];
        } else {
            fields = [
                { type: 'textbox', name: 'name', size: 40, label: 'Name', value: selectedNode.name || selectedNode.id }
            ];
        }

        editor.windowManager.open({
            title: 'Anchor',
            body: fields,
            onsubmit: function (e) {
                editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', { id: e.data.name }, e.data.html));
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