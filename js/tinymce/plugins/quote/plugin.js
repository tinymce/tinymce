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

tinymce.PluginManager.add('quote', function(editor) {
	editor.addCommand('mceQuote', function() {
		 editor.execCommand('mceInsertContent', false, '<q>');
	});
	
	editor.addButton('quote', {
	title: 'Quote',
	cmd: 'mceQuote',
	icon: 'bold',
	});

	editor.addMenuItem('quote', {
		text: 'Quote',
		cmd: 'mceQuote',
		icon: 'bold',
		context: 'file'
	});

});
