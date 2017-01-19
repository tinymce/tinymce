ModuleLoader.require([
	'tinymce/undo/Levels'
], function(Levels) {
	module('tinymce.undo.ForcedRootBlock', {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				forced_root_block: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test('createFromEditor forced_root_block: false', function() {
		editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

		deepEqual(Levels.createFromEditor(editor), {
			'beforeBookmark': null,
			'bookmark': null,
			'content': '<strong>a</strong> <span>b</span>',
			'fragments': null,
			'type': 'complete'
		});
	});

	test('createFromEditor forced_root_block: false', function() {
		editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <strong>a</strong> <span>b</span>';

		deepEqual(Levels.createFromEditor(editor), {
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

});
