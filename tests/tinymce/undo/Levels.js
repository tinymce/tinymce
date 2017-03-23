ModuleLoader.require([
	'tinymce/undo/Levels',
	'tinymce/Env'
], function(Levels, Env) {
	module('tinymce.undo.Levels', {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
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

	var getBookmark = function (editor) {
		return editor.selection.getBookmark(2, true);
	};

	test('createFragmentedLevel', function() {
		deepEqual(Levels.createFragmentedLevel(['a', 'b']), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments': ['a', 'b'],
			'type': 'fragmented'
		});
	});

	test('createCompleteLevel', function() {
		deepEqual(Levels.createCompleteLevel('a'), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': 'a',
			'fragments': null,
			'type': 'complete'
		});
	});

	test('createFromEditor', function() {
		deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': Env.ie && Env.ie < 11 ? '<p></p>' : '<p><br data-mce-bogus="1"></p>',
			'fragments': null,
			'type': 'complete'
		});

		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe>a<!--b-->c';

		deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments': ['<iframe src="about:blank"></iframe>', 'a', '<!--b-->', 'c'],
			'type': 'fragmented'
		});
	});

	test('createFromEditor removes bogus=al', function() {
		editor.getBody().innerHTML = '<p data-mce-bogus="all">a</p> <span>b</span>';

		deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': ' <span>b</span>',
			'fragments': null,
			'type': 'complete'
		});
	});

	test('createFromEditor removes bogus=all', function() {
		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <p data-mce-bogus="all">a</p> <span>b</span>';

		deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments':[
				"<iframe src=\"about:blank\"></iframe>",
				" ",
				"",
				" ",
				"<span>b</span>"
			],
			'type': 'fragmented'
		});
	});

	test('applyToEditor to equal content with complete level', function() {
		var level = Levels.createCompleteLevel('<p>a</p>');
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>a</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		strictEqual(editor.getBody().innerHTML, '<p>a</p>');
		deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	test('applyToEditor to different content with complete level', function() {
		var level = Levels.createCompleteLevel('<p>b</p>');
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>a</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		strictEqual(editor.getBody().innerHTML, '<p>b</p>');
		deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	test('applyToEditor to different content with fragmented level', function() {
		var level = Levels.createFragmentedLevel(['<p>a</p>', '<p>b</p>']);
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>c</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		strictEqual(editor.getBody().innerHTML, '<p>a</p><p>b</p>');
		deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	test('isEq', function() {
		strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'b'])), true);
		strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'c'])), false);
		strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('a')), true);
		strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('b')), false);
		strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a']), Levels.createCompleteLevel('a')), true);
		strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel(['a'])), true);
	});
});
