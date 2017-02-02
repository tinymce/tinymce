asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	'tinymce.undo.Levels'
], function (LegacyUnit, Pipeline, Levels) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	module('tinymce.undo.ForcedRootBlock', {
		setupModule: function () {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				forced_root_block: false,
				init_instance_callback: function (ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	suite.test('createFromEditor forced_root_block: false', function () {
		editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '<strong>a</strong> <span>b</span>',
			'fragments': null,
			'type': 'complete'
		});
	});

	suite.test('createFromEditor forced_root_block: false', function () {
		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <strong>a</strong> <span>b</span>';

		LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '',
			'fragments': [
				"<iframe src=\"about:blank\"></iframe>",
				" ",
				"<strong>a</strong>",
				" ",
				"<span>b</span>"
			],
			'type': 'fragmented'
		});
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
