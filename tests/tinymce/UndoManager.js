module("tinymce.UndoManager", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test('Initial states', function() {
	expect(3);

	ok(!editor.undoManager.hasUndo());
	ok(!editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('One undo level', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(3);

	editor.focus();
	editor.execCommand('SelectAll');
	editor.execCommand('Bold');

	ok(editor.undoManager.hasUndo());
	ok(!editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('Two undo levels', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(3);

	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	editor.execCommand('SelectAll');
	editor.execCommand('Italic');

	ok(editor.undoManager.hasUndo());
	ok(!editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('No undo levels and one redo', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(3);

	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	editor.undoManager.undo();

	ok(!editor.undoManager.hasUndo());
	ok(editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('One undo levels and one redo', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(3);

	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	editor.execCommand('SelectAll');
	editor.execCommand('Italic');
	editor.undoManager.undo();

	ok(editor.undoManager.hasUndo());
	ok(editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('Typing state', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(2);

	editor.dom.fire(editor.getBody(), 'keydown', {keyCode: 65});
	ok(editor.undoManager.typing);

	editor.dom.fire(editor.getBody(), 'keyup', {keyCode: 13});
	ok(!editor.undoManager.typing);
});

test('Undo and add new level', function() {
	editor.undoManager.clear();
	editor.setContent('test');

	expect(3);

	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	editor.undoManager.undo();
	editor.execCommand('SelectAll');
	editor.execCommand('Italic');

	ok(editor.undoManager.hasUndo());
	ok(!editor.undoManager.hasRedo());
	ok(!editor.undoManager.typing);
});

test('Events', function() {
	var add, undo, redo;

	editor.undoManager.clear();
	editor.setContent('test');

	expect(6);

	editor.on('AddUndo', function(e) {
		add = e.level;
	});

	editor.on('Undo', function(e) {
		undo = e.level;
	});

	editor.on('Redo', function(e) {
		redo = e.level;
	});

	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	ok(add.content);
	ok(add.bookmark);

	editor.undoManager.undo();
	ok(undo.content);
	ok(undo.bookmark);

	editor.undoManager.redo();
	ok(redo.content);
	ok(redo.bookmark);
});

asyncTest('Undo added when typing and losing focus', function() {
	window.focus();

	window.setTimeout(function() {
		start();

		editor.focus();
		editor.undoManager.clear();
		editor.setContent("<p>some text</p>");
		Utils.setSelection('p', 4, 'p', 9);
		Utils.type('\b');

		// Move focus to an input element
		var input = document.createElement('input');
		document.getElementById('view').appendChild(input);
		input.focus();
		input.parentNode.removeChild(input);

		editor.execCommand('FormatBlock', false, 'h1');
		editor.undoManager.undo();
		equal(editor.getContent(), "<p>some</p>");
	}, 0);
});
