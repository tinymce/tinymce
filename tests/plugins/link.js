(function() {

	var nonRelativeRegex = /^\w+:/i;

	module("tinymce.plugins.Link", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: 'textarea',
				add_unload_trigger: false,
				skin: false,
				indent: false,
				plugins: "link",
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			delete editor.settings.file_browser_callback;
			delete editor.settings.link_list;
			delete editor.settings.link_class_list;
			delete editor.settings.link_target_list;
			delete editor.settings.rel_list;

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

	test('Default link dialog on empty editor', function() {
		editor.setContent('');
		editor.execCommand('mceLink', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"href": "",
			"target": "",
			"text": "",
			"title": ""
		});

		fillAndSubmitWindowForm({
			"href": "href",
			"target": "_blank",
			"text": "text",
			"title": "title"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><a title="title" href="href" target="_blank">text</a></p>'
		);
	});

	test('Default link dialog on text selection', function() {
		editor.setContent('<p>abc</p>');
		Utils.setSelection('p', 1, 'p', 2);
		editor.execCommand('mceLink', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"href": "",
			"target": "",
			"text": "b",
			"title": ""
		});

		fillAndSubmitWindowForm({
			"href": "href",
			"target": "_blank",
			"title": "title"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p>a<a title="title" href="href" target="_blank">b</a>c</p>'
		);
	});

	test('Default link dialog on non pure text selection', function() {
		editor.setContent('<p>a</p><p>bc</p>');
		Utils.setSelection('p:nth-child(1)', 0, 'p:nth-child(2)', 2);
		editor.execCommand('mceLink', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"href": "",
			"target": "",
			"title": ""
		});

		fillAndSubmitWindowForm({
			"href": "href",
			"target": "_blank",
			"title": "title"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><a title="title" href="href" target="_blank">a</a></p>' +
			'<p><a title="title" href="href" target="_blank">bc</a></p>'
		);
	});

	test('All lists link dialog on empty editor', function() {
		editor.settings.link_list = [
			{title: 'link1', value: 'link1'},
			{title: 'link2', value: 'link2'}
		];

		editor.settings.link_class_list = [
			{title: 'class1', value: 'class1'},
			{title: 'class2', value: 'class2'}
		];

		editor.settings.target_list = [
			{title: 'target1', value: 'target1'},
			{title: 'target2', value: 'target2'}
		];

		editor.settings.rel_list = [
			{title: 'rel1', value: 'rel1'},
			{title: 'rel2', value: 'rel2'}
		];

		editor.setContent('');
		editor.execCommand('mceLink', true);

		deepEqual(Utils.getFontmostWindow().toJSON(), {
			"class": "class1",
			"href": "",
			"rel": "rel1",
			"target": "target1",
			"text": "",
			"title": ""
		});

		fillAndSubmitWindowForm({
			"href": "href",
			"text": "text",
			"title": "title"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><a class="class1" title="title" href="href" target="target1" rel="rel1">text</a></p>'
		);
	});

	//Since there's no capability to use the confirm dialog with unit tests, simply test the regex we're using
	test('Test new regex for non relative link setting ftp', function() {
		equal(nonRelativeRegex.test('ftp://testftp.com'), true);
	});

	test('Test new regex for non relative link setting http', function() {
		equal(nonRelativeRegex.test('http://testhttp.com'), true);
	});

	test('Test new regex for non relative link setting relative', function() {
		equal(nonRelativeRegex.test('testhttp.com'), false);
	});

	test('Test new regex for non relative link setting relative base', function() {
		equal(nonRelativeRegex.test('/testjpg.jpg'), false);
	});
})();