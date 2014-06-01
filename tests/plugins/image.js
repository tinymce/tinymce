(function() {
	module("tinymce.plugins.Image", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				skin: false,
				plugins: "image",
				disable_nodechange: true,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			delete editor.settings.image_dimensions;
			delete editor.settings.file_browser_callback;
			delete editor.settings.image_list;
			delete editor.settings.image_class_list;

			var win = Utils.getFontmostWindow();

			if (win) {
				win.close();
			}
		}
	});

	function cleanHtml(html) {
		return Utils.cleanHtml(html).replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
	}

	function fillAndSubmitWindowForm(data) {
		var win = Utils.getFontmostWindow();

		win.fromJSON(data);
		win.find('form')[0].submit();
		win.close();
	}

	test('Default image dialog on empty editor', function() {
		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"alt": "",
			"constrain": true,
			"height": "",
			"src": "",
			"width": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"height": "100",
			"src": "src",
			"width": "200"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img src="src" alt="alt" width="200" height="100" /></p>'
		);
	});

	test('Image dialog image_dimensions: false', function() {
		editor.settings.image_dimensions = false;
		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"alt": "",
			"src": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"src": "src"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img src="src" alt="alt" /></p>'
		);
	});

	test('All image dialog ui options on empty editor', function() {
		editor.settings.image_list = [
			{title: 'link1', value: 'link1'},
			{title: 'link2', value: 'link2'}
		];

		editor.settings.image_class_list = [
			{title: 'class1', value: 'class1'},
			{title: 'class2', value: 'class2'}
		];

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"alt": "",
			"class": "class1",
			"constrain": true,
			"height": "",
			"src": "",
			"width": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"class": "class1",
			"constrain": true,
			"height": "200",
			"src": "src",
			"width": "100"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img class="class1" src="src" alt="alt" width="100" height="200" /></p>'
		);
	});
})();