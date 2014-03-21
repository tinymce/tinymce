module("tinymce.Editor", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			disable_nodechange: true,
			skin: false,
			entities: 'raw',
			indent: false,
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			custom_elements: 'custom1,~custom2',
			extended_valid_elements: 'custom1,custom2',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test('Event: change', function() {
	var level, lastLevel;

	editor.on('change', function(e) {
		level = e.level;
		lastLevel = e.lastLevel;
	});

	editor.setContent('');
	editor.insertContent('a');
	equal(level.content.toLowerCase(), '<p>a</p>');
	equal(lastLevel.content, editor.undoManager.data[0].content);

	editor.off('change');
});

test('Event: beforeExecCommand', function() {
	var cmd, ui, value;

	editor.on('BeforeExecCommand', function(e) {
		cmd = e.command;
		ui = e.ui;
		value = e.value;

		e.preventDefault();
	});

	editor.setContent('');
	editor.insertContent('a');
	equal(editor.getContent(), '');
	equal(cmd, 'mceInsertContent');
	equal(ui, false);
	equal(value, 'a');

	editor.off('BeforeExecCommand');
	editor.setContent('');
	editor.insertContent('a');
	equal(editor.getContent(), '<p>a</p>');
});

test('urls - relativeURLs', function() {
	editor.settings.relative_urls = true;
	editor.documentBaseURI = new tinymce.util.URI('http://www.site.com/dirA/dirB/dirC/');

	editor.setContent('<a href="test.html">test</a>');
	equal(editor.getContent(), '<p><a href="test.html">test</a></p>');

	editor.setContent('<a href="../test.html">test</a>');
	equal(editor.getContent(), '<p><a href="../test.html">test</a></p>');

	editor.setContent('<a href="test/test.html">test</a>');
	equal(editor.getContent(), '<p><a href="test/test.html">test</a></p>');

	editor.setContent('<a href="/test.html">test</a>');
	equal(editor.getContent(), '<p><a href="../../../test.html">test</a></p>');

	editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

	editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="../../../test/file.htm">test</a></p>');

	editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
});

test('urls - absoluteURLs', function() {
	editor.settings.relative_urls = false;
	editor.settings.remove_script_host = true;
	editor.documentBaseURI = new tinymce.util.URI('http://www.site.com/dirA/dirB/dirC/');

	editor.setContent('<a href="test.html">test</a>');
	equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test.html">test</a></p>');

	editor.setContent('<a href="../test.html">test</a>');
	equal(editor.getContent(), '<p><a href="/dirA/dirB/test.html">test</a></p>');

	editor.setContent('<a href="test/test.html">test</a>');
	equal(editor.getContent(), '<p><a href="/dirA/dirB/dirC/test/test.html">test</a></p>');

	editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

	editor.settings.relative_urls = false;
	editor.settings.remove_script_host = false;

	editor.setContent('<a href="test.html">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test.html">test</a></p>');

	editor.setContent('<a href="../test.html">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/test.html">test</a></p>');

	editor.setContent('<a href="test/test.html">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.site.com/dirA/dirB/dirC/test/test.html">test</a></p>');

	editor.setContent('<a href="http://www.somesite.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="http://www.somesite.com/test/file.htm">test</a></p>');

	editor.setContent('<a href="//www.site.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="//www.site.com/test/file.htm">test</a></p>');

	editor.setContent('<a href="//www.somesite.com/test/file.htm">test</a>');
	equal(editor.getContent(), '<p><a href="//www.somesite.com/test/file.htm">test</a></p>');
});

test('WebKit Serialization range bug', function() {
	expect(1);

	if (tinymce.isIE) {
		ok(true, "Skip IE");
	} else {
		// Note that if we create the P with this invalid content directly, Chrome cleans it up differently to other browsers so we don't
		// wind up testing the serialization functionality we were aiming for and the test fails.
		var p = editor.dom.create('p', {}, '123<table><tbody><tr><td>X</td></tr></tbody></table>456');
		editor.dom.replace(p, editor.getBody().firstChild);

		equal(editor.getContent(), '<p>123</p><table><tbody><tr><td>X</td></tr></tbody></table><p>456</p>');
	}
});


test('editor_methods - getParam', function() {
	expect(5);

	editor.settings.test = 'a,b,c';
	equal(editor.getParam('test', '', 'hash').c, 'c');

	editor.settings.test = 'a';
	equal(editor.getParam('test', '', 'hash').a, 'a');

	editor.settings.test = 'a=b';
	equal(editor.getParam('test', '', 'hash').a, 'b');

	editor.settings.test = 'a=b;c=d,e';
	equal(editor.getParam('test', '', 'hash').c, 'd,e');

	editor.settings.test = 'a=b,c=d';
	equal(editor.getParam('test', '', 'hash').c, 'd');
});

test('setContent', function() {
	var count;

	expect(4);

	function callback(e) {
		e.content = e.content.replace(/test/, 'X');
		count++;
	}

	editor.on('SetContent', callback);
	editor.on('BeforeSetContent', callback);
	count = 0;
	editor.setContent('<p>test</p>');
	equal(editor.getContent(), "<p>X</p>");
	equal(count, 2);
	editor.off('SetContent', callback);
	editor.off('BeforeSetContent', callback);

	count = 0;
	editor.setContent('<p>test</p>');
	equal(editor.getContent(), "<p>test</p>");
	equal(count, 0);
});

test('custom elements', function() {
	editor.setContent('<custom1>c1</custom1><custom2>c1</custom2>');
	equal(editor.getContent(), '<custom1>c1</custom1><p><custom2>c1</custom2></p>');
});

test('Store/restore tabindex', function() {
	editor.setContent('<span tabindex="42">abc</span>');
	equal(editor.getContent({format:'raw'}).toLowerCase(), '<p><span data-mce-tabindex="42">abc</span></p>');
	equal(editor.getContent(), '<p><span tabindex="42">abc</span></p>');
});
