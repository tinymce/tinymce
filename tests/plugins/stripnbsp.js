(function() {
	module("tinymce.plugins.stripnbsp", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				indent: false,
				plugins: 'stripnbsp',
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},
		teardown: function() {
			var win = Utils.getFrontmostWindow();

			if (win) {
				win.close();
			}

			delete editor.settings.stripnbsp_force;
		}
	});

	test("Strip nbsp", function() {
		var data = {
			'<p>A&nbsp;B</p>': '<p>A B</p>',
			'<p>A&nbsp;<span class="a">B</span></p>': '<p>A <span class="a">B</span></p>',
			'<p>A<span class="a">&nbsp;B</span></p>': '<p>A<span class="a"> B</span></p>',
			'<p>A<span class="a">B&nbsp;</span></p>': '<p>A<span class="a">B </span></p>',
			'<p>A<span class="a">B</span>&nbsp;</p>': '<p>A<span class="a">B</span> </p>',
		};

		Object.keys(data).forEach(function(before) {
			editor.setContent(before);

			equal(
				editor.getContent(),
				data[before]
			);
		});
	});

	test("Keep nbsp", function() {
		var data = [
			'<p>A&nbsp;&nbsp;B</p>',
			'<p>A &nbsp;B</p>',
			'<p>A&nbsp; B</p>',
			'<p>A</p><p>&nbsp;</p><p>B</p>',
			'<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>',
		];

		data.forEach(function(content) {
			editor.setContent(content);

			equal(
				editor.getContent(),
				content
			);
		});
	});

	test("Force strip nbsp", function() {
		editor.settings.stripnbsp_force = true;

		var data = {
			'<p>A&nbsp;&nbsp;B</p>': '<p>A  B</p>',
			'<p>A &nbsp;B</p>': '<p>A  B</p>',
			'<p>A&nbsp; B</p>': '<p>A  B</p>',
			'<p>A</p><p>&nbsp;</p><p>B</p>': '<p>A</p><p> </p><p>B</p>',
			'<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>': '<table><tbody><tr><td> </td></tr></tbody></table>',
		};

		Object.keys(data).forEach(function(before) {
			editor.setContent(before);

			equal(
				editor.getContent(),
				data[before]
			);
		});
	});
})();
