module("tinymce.plugins.Autosave", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			plugins: 'autosave',
			autosave_ask_before_unload: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				editor.plugins.autosave.removeDraft();
				QUnit.start();
			}
		});
	}
});

test("isEmpty true", function() {
	ok(editor.plugins.autosave.isEmpty(''));
	ok(editor.plugins.autosave.isEmpty('   '));
	ok(editor.plugins.autosave.isEmpty('\t\t\t'));

	ok(editor.plugins.autosave.isEmpty('<p id="x"></p>'));
	ok(editor.plugins.autosave.isEmpty('<p></p>'));
	ok(editor.plugins.autosave.isEmpty('<p> </p>'));
	ok(editor.plugins.autosave.isEmpty('<p>\t</p>'));

	ok(editor.plugins.autosave.isEmpty('<p><br></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br /></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /></p>'));

	ok(editor.plugins.autosave.isEmpty('<p><br><br></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br /><br /></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>'));
});

test("isEmpty false", function() {
	ok(!editor.plugins.autosave.isEmpty('X'));
	ok(!editor.plugins.autosave.isEmpty('   X'));
	ok(!editor.plugins.autosave.isEmpty('\t\t\tX'));

	ok(!editor.plugins.autosave.isEmpty('<p>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p> X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p>\tX</p>'));

	ok(!editor.plugins.autosave.isEmpty('<p><br>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br />X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" />X</p>'));

	ok(!editor.plugins.autosave.isEmpty('<p><br><br>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br /><br />X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>'));

	ok(!editor.plugins.autosave.isEmpty('<h1></h1>'));
	ok(!editor.plugins.autosave.isEmpty('<img src="x" />'));
});

test("hasDraft/storeDraft/restoreDraft", function() {
	ok(!editor.plugins.autosave.hasDraft());

	editor.setContent('X');
	editor.undoManager.add();
	editor.plugins.autosave.storeDraft();

	ok(editor.plugins.autosave.hasDraft());

	editor.setContent('Y');
	editor.undoManager.add();

	editor.plugins.autosave.restoreDraft();
	equal(editor.getContent(), '<p>X</p>');
});
