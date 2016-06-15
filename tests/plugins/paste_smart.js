ModuleLoader.require([
	"tinymce/pasteplugin/SmartPaste"
], function (SmartPaste) {
	module("tinymce.plugins.Paste_smart", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				indent: false,
				plugins: 'paste',
				setup: function(ed) {
					ed.on('NodeChange', false);
				},
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test('isAbsoluteUrl', function() {
		equal(SmartPaste.isAbsoluteUrl('http://www.site.com'), true);
		equal(SmartPaste.isAbsoluteUrl('https://www.site.com'), true);
		equal(SmartPaste.isAbsoluteUrl('http://www.site.com/dir-name/file.gif?query=%42'), true);
		equal(SmartPaste.isAbsoluteUrl('https://www.site.com/dir-name/file.gif?query=%42'), true);
		equal(SmartPaste.isAbsoluteUrl('file.gif'), false);
		equal(SmartPaste.isAbsoluteUrl(''), false);
	});

	test('isImageUrl', function() {
		equal(SmartPaste.isImageUrl('http://www.site.com'), false);
		equal(SmartPaste.isImageUrl('https://www.site.com'), false);
		equal(SmartPaste.isImageUrl('http://www.site.com/dir-name/file.gif'), true);
		equal(SmartPaste.isImageUrl('https://www.site.com/dir-name/file.gif'), true);
		equal(SmartPaste.isImageUrl('https://www.site.com/dir-name/file.gif?query=%42'), false);
		equal(SmartPaste.isImageUrl('https://www.site.com/dir-name/file.html?query=%42'), false);
		equal(SmartPaste.isImageUrl('file.gif'), false);
		equal(SmartPaste.isImageUrl(''), false);
	});

	test('smart paste url on selection', function() {
		editor.focus();
		editor.undoManager.clear();
		editor.setContent('<p>abc</p>');
		Utils.setSelection('p', 0, 'p', 3);
		editor.undoManager.add();

		editor.execCommand('mceInsertClipboardContent', false, {content: 'http://www.site.com'});
		equal(editor.getContent(), '<p><a href="http://www.site.com">abc</a></p>');
		equal(editor.undoManager.data.length, 3);
	});

	test('smart paste image url', function() {
		editor.focus();
		editor.undoManager.clear();
		editor.setContent('<p>abc</p>');
		Utils.setSelection('p', 1);
		editor.undoManager.add();

		editor.execCommand('mceInsertClipboardContent', false, {content: 'http://www.site.com/my.jpg'});
		equal(editor.getContent(), '<p>a<img src="http://www.site.com/my.jpg" />bc</p>');
		equal(editor.undoManager.data.length, 3);
	});
});
