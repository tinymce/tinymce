ModuleLoader.require([
	"tinymce/InsertContent"
], function(InsertContent) {
	module("tinymce.InsertContent", {
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
				}
			});
		}
	});

	test('insertAtCaret - i inside text, converts to em', function() {
		editor.setContent('<p>1234</p>');
		editor.focus();
		Utils.setSelection('p', 2);
		InsertContent.insertAtCaret(editor, '<i>a</i>');
		equal(editor.getContent(), '<p>12<em>a</em>34</p>');
	});
});
