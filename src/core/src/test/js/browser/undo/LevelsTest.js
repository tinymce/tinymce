asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	'tinymce.undo.Levels',
	'tinymce/Env'
], function (LegacyUnit, Pipeline, Levels, Env) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	module('tinymce.undo.Levels', {
		setupModule: function () {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function (ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	var getBookmark = function (editor) {
		return editor.selection.getBookmark(2, true);
	};

	suite.test('createFragmentedLevel', function () {
		LegacyUnit.deepEqual(Levels.createFragmentedLevel(['a', 'b']), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments': ['a', 'b'],
			'type': 'fragmented'
		});
	});

	suite.test('createCompleteLevel', function () {
		LegacyUnit.deepEqual(Levels.createCompleteLevel('a'), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': 'a',
			'fragments': null,
			'type': 'complete'
		});
	});

	suite.test('createFromEditor', function () {
		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': Env.ie && Env.ie < 11 ? '<p></p>' : '<p><br data-mce-bogus="1"></p>',
			'fragments': null,
			'type': 'complete'
		});

		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe>a<!--b-->c';

		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments': ['<iframe src="about:blank"></iframe>', 'a', '<!--b-->', 'c'],
			'type': 'fragmented'
		});
	});

	suite.test('createFromEditor removes bogus=al', function () {
		editor.getBody().innerHTML = '<p data-mce-bogus="all">a</p> <span>b</span>';

		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': ' <span>b</span>',
			'fragments': null,
			'type': 'complete'
		});
	});

	suite.test('createFromEditor removes bogus=all', function () {
		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <p data-mce-bogus="all">a</p> <span>b</span>';

		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
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

	suite.test('applyToEditor to equal content with complete level', function () {
		var level = Levels.createCompleteLevel('<p>a</p>');
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>a</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>a</p>');
		LegacyUnit.deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	suite.test('applyToEditor to different content with complete level', function () {
		var level = Levels.createCompleteLevel('<p>b</p>');
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>a</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>b</p>');
		LegacyUnit.deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	suite.test('applyToEditor to different content with fragmented level', function () {
		var level = Levels.createFragmentedLevel(['<p>a</p>', '<p>b</p>']);
		level.bookmark = {start: [1, 0, 0]};

		editor.getBody().innerHTML = '<p>c</p>';
		Utils.setSelection('p', 0);
		Levels.applyToEditor(editor, level, false);

		LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>a</p><p>b</p>');
		LegacyUnit.deepEqual(getBookmark(editor), {start: [1, 0, 0]});
	});

	suite.test('isEq', function () {
		LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'b'])), true);
		LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'c'])), false);
		LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('a')), true);
		LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('b')), false);
		LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a']), Levels.createCompleteLevel('a')), true);
		LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel(['a'])), true);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
