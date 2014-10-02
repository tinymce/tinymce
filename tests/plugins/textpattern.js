(function() {
	module("tinymce.plugins.TextPattern", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				skin: false,
				indent: false,
				plugins: "textpattern",
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			delete editor.settings.textpattern_patterns;
		}
	});

	test('Italic format on single word using space', function() {
		editor.setContent('<p>*abc*\u00a0</p>');
		Utils.setSelection('p', 6);
		editor.fire('keyup', {keyCode: 32});

		equal(
			editor.getContent(),
			'<p><em>abc</em>&nbsp;</p>'
		);
	});

	test('Bold format on single word using space', function() {
		editor.setContent('<p>**abc**\u00a0</p>');
		Utils.setSelection('p', 8);
		editor.fire('keyup', {keyCode: 32});

		equal(
			editor.getContent(),
			'<p><strong>abc</strong>&nbsp;</p>'
		);
	});

	test('Bold format on multiple words using space', function() {
		editor.setContent('<p>**abc 123**\u00a0</p>');
		Utils.setSelection('p', 12);
		editor.fire('keyup', {keyCode: 32});

		equal(
			editor.getContent(),
			'<p><strong>abc 123</strong>&nbsp;</p>'
		);
	});

	test('Bold format on single word using enter', function() {
		editor.setContent('<p>**abc**</p>');
		Utils.setSelection('p', 7);
		editor.fire('keydown', {keyCode: 13});

		equal(
			editor.getContent(),
			'<p><strong>abc</strong></p><p>&nbsp;</p>'
		);
	});

	test('H1 format on single word node using enter', function() {
		editor.setContent('<p>#abc</p>');
		Utils.setSelection('p', 4);
		editor.fire('keydown', {keyCode: 13});

		equal(
			editor.getContent(),
			'<h1>abc</h1><p>&nbsp;</p>'
		);
	});

	test('OL format on single word node using enter', function() {
		editor.setContent('<p>1. abc</p>');
		Utils.setSelection('p', 6);
		editor.fire('keydown', {keyCode: 13});

		equal(
			editor.getContent(),
			'<ol><li>abc</li><li></li></ol>'
		);
	});

	test('UL format on single word node using enter', function() {
		editor.setContent('<p>* abc</p>');
		Utils.setSelection('p', 5);
		editor.fire('keydown', {keyCode: 13});

		equal(
			editor.getContent(),
			'<ul><li>abc</li><li></li></ul>'
		);
	});

	test('getPatterns/setPatterns', function() {
		editor.plugins.textpattern.setPatterns([
			{start: '#', format: 'h1'},
			{start: '##', format: 'h2'},
			{start: '###', format: 'h3'}
		]);

		deepEqual(
			editor.plugins.textpattern.getPatterns(),
			[
				{
					"format": "h3",
					"start": "###"
				},
				{
					"format": "h2",
					"start": "##"
				},
				{
					"format": "h1",
					"start": "#"
				}
			]
		);
	});
})();