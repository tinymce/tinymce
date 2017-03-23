ModuleLoader.require([
	"tinymce/InsertContent"
], function(InsertContent) {
	module("tinymce.InsertContentForcedRootFalse", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				},
				forced_root_block: false
			});
		}
	});

	var trimBrs = function(string) {
		return string.replace(/<br>/g, '');
	};

	test('insertAtCaret - selected image with bogus div', function() {
		editor.getBody().innerHTML = '<img src="about:blank" /><div data-mce-bogus="all">x</div>';
		editor.focus();
		// editor.selection.setCursorLocation(editor.getBody(), 0);
		editor.selection.select(editor.dom.select('img')[0]);
		InsertContent.insertAtCaret(editor, 'a');
		equal(trimBrs(editor.getBody().innerHTML), 'a<div data-mce-bogus="all">x</div>');
	});

	test('insertAtCaret - selected text with bogus div', function() {
		editor.getBody().innerHTML = 'a<div data-mce-bogus="all">x</div>';
		editor.focus();
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 0);
		rng.setEnd(editor.getBody().firstChild, 1);
		editor.selection.setRng(rng);
		InsertContent.insertAtCaret(editor, 'b');
		equal(trimBrs(editor.getBody().innerHTML), 'b<div data-mce-bogus="all">x</div>');
	});
});
