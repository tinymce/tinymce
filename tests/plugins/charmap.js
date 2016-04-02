ModuleLoader.require([
], function() {
	module("tinymce.plugins.CharMap", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				plugins: "charmap",
				add_unload_trigger: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test('Replace characters by array', function() {
		editor.settings.charmap = [
			[65, 'Latin A'],
			[66, 'Latin B']
		];

		deepEqual(editor.plugins.charmap.getCharMap(), [
			[65, 'Latin A'],
			[66, 'Latin B']
		]);
	});

	test('Replace characters by function', function() {
		editor.settings.charmap = function() {
			return [
				[65, 'Latin A fun'],
				[66, 'Latin B fun']
			];
		};

		deepEqual(editor.plugins.charmap.getCharMap(), [
			[65, 'Latin A fun'],
			[66, 'Latin B fun']
		]);
	});

	test('Append characters by array', function() {
		editor.settings.charmap = [
			[67, 'Latin C']
		];

		editor.settings.charmap_append = [
			[65, 'Latin A'],
			[66, 'Latin B']
		];

		deepEqual(editor.plugins.charmap.getCharMap(), [
			[67, 'Latin C'],
			[65, 'Latin A'],
			[66, 'Latin B']
		]);
	});

	test('Append characters by function', function() {
		editor.settings.charmap = [
			[67, 'Latin C']
		];

		editor.settings.charmap_append = function() {
			return [
				[65, 'Latin A fun'],
				[66, 'Latin B fun']
			];
		};

		deepEqual(editor.plugins.charmap.getCharMap(), [
			[67, 'Latin C'],
			[65, 'Latin A fun'],
			[66, 'Latin B fun']
		]);
	});

	test('Insert character', function() {
		var lastEvt;

		editor.on('insertCustomChar', function(e) {
			lastEvt = e;
		});

		editor.plugins.charmap.insertChar('A');
		equal(lastEvt.chr, 'A');
	});
});
