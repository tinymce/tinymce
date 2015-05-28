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
			delete editor.settings.document_base_url;
			delete editor.settings.image_advtab;

			var win = Utils.getFrontmostWindow();

			if (win) {
				win.close();
			}
		}
	});

	function cleanHtml(html) {
		return Utils.cleanHtml(html).replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
	}

	function fillAndSubmitWindowForm(data) {
		var win = Utils.getFrontmostWindow();

		win.fromJSON(data);
		win.find('form')[0].submit();
		win.close();
	}

	test('Default image dialog on empty editor', function() {
		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
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

	test("Image recognizes relative src url and prepends relative image_prepend_url setting.", function () {
		var win, elementId, element;

		editor.settings.image_prepend_url = 'testing/images/';
		editor.setContent('');
		editor.execCommand('mceImage', true);

		var data = {
			"src": "src",
			"alt": "alt"
		};

		win = Utils.getFrontmostWindow();
		elementId = win.find('#src')[0]._id;
		element = document.getElementById(elementId).childNodes[0];

		win.fromJSON(data);
		Utils.triggerElementChange(element);

		win.find('form')[0].submit();
		win.close();

		equal(
			cleanHtml(editor.getContent()),
			'<p><img src="' + editor.settings.image_prepend_url + 'src" alt="alt" /></p>'
		);


 	});

 	test("Image recognizes relative src url and prepends absolute image_prepend_url setting.", function () {
		var win, elementId, element;

		editor.settings.image_prepend_url = 'http://testing.com/images/';
		editor.setContent('');
		editor.execCommand('mceImage', true);

		var data = {
			"src": "src",
			"alt": "alt"
		};

		win = Utils.getFrontmostWindow();
		elementId = win.find('#src')[0]._id;
		element = document.getElementById(elementId).childNodes[0];

		win.fromJSON(data);
		Utils.triggerElementChange(element);

		win.find('form')[0].submit();
		win.close();

		equal(
			cleanHtml(editor.getContent()),
			'<p><img src="' + editor.settings.image_prepend_url + 'src" alt="alt" /></p>'
		);
 	});

	test('Advanced image dialog border option on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"border": "10px",
			"src": "src"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="border-width: 10px;" src="src" alt="alt" /></p>'
		);
	});

	test('Advanced image dialog margin space options on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"hspace": "10",
			"src": "src",
			"vspace": "10"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
		);

	});

	test('Advanced image dialog border style only options on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"src": "src",
			"style": "border-width: 10px;"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="border-width: 10px;" src="src" alt="alt" /></p>'
		);

	});

	test('Advanced image dialog margin style only options on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"src": "src",
			"style": "margin: 10px;"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
		);

	});

	test('Advanced image dialog overriden border style options on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"border": "10",
			"src": "src",
			"style": "border-width: 15px;",
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="border-width: 10px;" src="src" alt="alt" /></p>'
		);

	});

	test('Advanced image dialog overriden margin style options on empty editor', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		fillAndSubmitWindowForm({
			"alt": "alt",
			"hspace": "10",
			"src": "src",
			"style": "margin-left: 15px; margin-top: 20px;",
			"vspace": "10"
		});

		equal(
			cleanHtml(editor.getContent()),
			'<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
		);

	});

	test('Advanced image dialog non-shorthand horizontal margin style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin-left: 15px; margin-right: 15px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "15",
			"src": "",
			"style": "margin-left: 15px; margin-right: 15px;",
			"vspace": ""
		});

	});

	test('Advanced image dialog non-shorthand vertical margin style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin-top: 15px; margin-bottom: 15px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "margin-top: 15px; margin-bottom: 15px;",
			"vspace": "15"
		});

	});

	test('Advanced image dialog shorthand margin 1 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "5",
			"src": "",
			"style": "margin: 5px;",
			"vspace": "5"
		});

	});

	test('Advanced image dialog shorthand margin 2 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px 10px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "10",
			"src": "",
			"style": "margin: 5px 10px 5px 10px;",
			"vspace": "5"
		});

	});

	test('Advanced image dialog shorthand margin 2 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px 10px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "10",
			"src": "",
			"style": "margin: 5px 10px 5px 10px;",
			"vspace": "5"
		});

	});

	test('Advanced image dialog shorthand margin 3 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px 10px 15px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "10",
			"src": "",
			"style": "margin: 5px 10px 15px 10px;",
			"vspace": ""
		});

	});

	test('Advanced image dialog shorthand margin 4 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px 10px 15px 20px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "margin: 5px 10px 15px 20px;",
			"vspace": ""
		});

	});

	test('Advanced image dialog shorthand margin 4 value style change test', function(){
		editor.settings.image_advtab = true;
		editor.settings.image_dimensions = false;

		editor.setContent('');
		editor.execCommand('mceImage', true);

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "",
			"vspace": ""
		});

		Utils.getFrontmostWindow().find('#style').value('margin: 5px 10px 15px 20px; margin-top: 15px;').fire('change');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"alt": "",
			"border": "",
			"hspace": "",
			"src": "",
			"style": "margin: 15px 10px 15px 20px;",
			"vspace": "15"
		});

	});
})();
