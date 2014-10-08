/**
 * plugin.js for TinyMCE soft hyphen (shy)
 *
 */

tinymce.PluginManager.requireLangPack('shy', 'de');

tinymce.PluginManager.add('shy', function(editor) {
	editor.addCommand('mceShy', function() {
		editor.insertContent(
			(editor.plugins.visualchars && editor.plugins.visualchars.state) ?
			'<span class="mce-shy">&shy;</span>' : '&shy;'
		);
		editor.dom.setAttrib(editor.dom.select('span.mce-shy'), 'data-mce-bogus', '1');
	});

	editor.addButton('shy', {
		title: 'Soft hyphen',
		cmd: 'mceShy'
	});

	editor.addMenuItem('shy', {
		text: 'Soft hyphen',
		cmd: 'mceShy',
		context: 'insert'
	});
});
