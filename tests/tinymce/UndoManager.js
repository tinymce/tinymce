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

test('Transact', function() {
	var count = 0;

	editor.undoManager.clear();

	editor.on('BeforeAddUndo', function() {
		count++;
	});

	editor.undoManager.transact(function() {
		editor.undoManager.add();
		editor.undoManager.add();
	});

	equal(count, 1);
});

test('Transact nested', function() {
	var count = 0;

	editor.undoManager.clear();

	editor.on('BeforeAddUndo', function() {
		count++;
	});

	editor.undoManager.transact(function() {
		editor.undoManager.add();

		editor.undoManager.transact(function() {
			editor.undoManager.add();
		});
	});

	equal(count, 1);
});

test('Transact exception', function() {
	var count = 0;

	editor.undoManager.clear();

	editor.on('BeforeAddUndo', function() {
		count++;
	});

	throws(
		function() {
			editor.undoManager.transact(function() {
				throw new Error("Test");
			});
		},

		"Test"
	);

	editor.undoManager.add();

	equal(count, 1);
});

test('Exclude internal elements', function() {
	var count = 0, lastLevel;

	editor.undoManager.clear();
	equal(count, 0);

	editor.on('AddUndo', function() {
		count++;
	});

	editor.on('BeforeAddUndo', function(e) {
		lastLevel = e.level;
	});

	editor.getBody().innerHTML = (
		'test' +
		'<img src="about:blank" data-mce-selected="1" />' +
		'<table data-mce-selected="1"><tr><td>x</td></tr></table>'
	);

	editor.undoManager.add();
	equal(count, 1);
	equal(Utils.cleanHtml(lastLevel.content),
		'test' +
		'<img src="about:blank">' +
		'<table><tbody><tr><td>x</td></tr></tbody></table>'
	);

	editor.getBody().innerHTML = (
		'<span data-mce-bogus="1">\u200B</span>' +
		'<span data-mce-bogus="1">\uFEFF</span>' +
		'<div data-mce-bogus="1"></div>' +
		'test' +
		'<img src="about:blank" />' +
		'<table><tr><td>x</td></tr></table>'
	);

	editor.undoManager.add();
	equal(count, 1);
	equal(Utils.cleanHtml(lastLevel.content),
		'test' +
		'<img src="about:blank">' +
		'<table><tbody><tr><td>x</td></tr></tbody></table>'
	);
});

test('Undo added when typing and losing focus', function() {
	var lastLevel;

	editor.on('BeforeAddUndo', function(e) {
		lastLevel = e.level;
	});

	editor.undoManager.clear();
	editor.setContent("<p>some text</p>");
	Utils.setSelection('p', 4, 'p', 9);
	Utils.type('\b');

	equal(Utils.cleanHtml(lastLevel.content), "<p>some text</p>");
	editor.fire('blur');
	equal(Utils.cleanHtml(lastLevel.content), "<p>some</p>");

	editor.execCommand('FormatBlock', false, 'h1');
	editor.undoManager.undo();
	equal(editor.getContent(), "<p>some</p>");
});

test('BeforeAddUndo event', function() {
	var lastEvt, addUndoEvt;

	editor.on('BeforeAddUndo', function(e) {
		lastEvt = e;
	});

	editor.undoManager.clear();
	editor.setContent("<p>a</p>");
	editor.undoManager.add();

	equal(lastEvt.lastLevel, null);
	equal(Utils.cleanHtml(lastEvt.level.content), "<p>a</p>");

	editor.setContent("<p>b</p>");
	editor.undoManager.add();

	equal(Utils.cleanHtml(lastEvt.lastLevel.content), "<p>a</p>");
	equal(Utils.cleanHtml(lastEvt.level.content), "<p>b</p>");

	editor.on('BeforeAddUndo', function(e) {
		e.preventDefault();
	});

	editor.on('AddUndo', function(e) {
		addUndoEvt = e;
	});

	editor.setContent("<p>c</p>");
	editor.undoManager.add(null, {data: 1});

	equal(Utils.cleanHtml(lastEvt.lastLevel.content), "<p>b</p>");
	equal(Utils.cleanHtml(lastEvt.level.content), "<p>c</p>");
	equal(lastEvt.originalEvent.data, 1);
	ok(!addUndoEvt, "Event level produced when it should be blocked");
});