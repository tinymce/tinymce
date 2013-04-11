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

tinymce.PluginManager.add('nonbreaking', function(editor) {
	editor.addCommand('mceNonBreaking', function() {
		editor.insertContent(
			(editor.plugins.visualchars && editor.plugins.visualchars.state) ?
			'<span data-mce-bogus="1" class="mce-nbsp">&nbsp;</span>' : '&nbsp;'
		);
	});

	editor.addButton('nonbreaking', {
		title: 'Insert nonbreaking space',
		cmd: 'mceNonBreaking'
	});

	editor.addMenuItem('nonbreaking', {
		text: 'Nonbreaking space',
		cmd: 'mceNonBreaking',
		context: 'insert'
	});

	if (editor.getParam('nonbreaking_force_tab')) {
		editor.on('keydown', function(e) {
			if (e.keyCode == 9) {
				e.preventDefault();

				editor.execCommand('mceNonBreaking');
				editor.execCommand('mceNonBreaking');
				editor.execCommand('mceNonBreaking');
			}
		});
	}
});
