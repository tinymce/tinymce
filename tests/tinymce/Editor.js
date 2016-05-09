module("tinymce.Editor", {
	setupModule: function() {
		document.getElementById('view').innerHTML = '<textarea id="elm1"></textarea><div id="elm2"></div>';
		QUnit.stop();

		tinymce.init({
			selector: "#elm1",
			add_unload_trigger: false,
			disable_nodechange: true,
			skin: false,
			entities: 'raw',
			indent: false,
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			custom_elements: 'custom1,~custom2',
			extended_valid_elements: 'custom1,custom2,script[*]',
			init_instance_callback: function(ed) {
				window.editor = ed;

				if (window.inlineEditor) {
					QUnit.start();
				}
			}
		});

		tinymce.init({
			selector: "#elm2",
			add_unload_trigger: false,
			disable_nodechange: true,
			skin: false,
			entities: 'raw',
			indent: false,
			inline: true,
			init_instance_callback: function(ed) {
				window.inlineEditor = ed;

				if (window.editor) {
					QUnit.start();
				}
			}
		});
	},

	teardown: function() {
		Utils.unpatch(editor.getDoc());
		inlineEditor.show();
		editor.show();
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

test('setContent with comment bug #4409', function() {
	editor.setContent('<!-- x --><br>');
	editor.settings.disable_nodechange = false;
	editor.nodeChanged();
	editor.settings.disable_nodechange = true;
	equal(editor.getContent(), "<!-- x --><p>\u00a0</p>");
});

test('custom elements', function() {
	editor.setContent('<custom1>c1</custom1><custom2>c1</custom2>');
	equal(editor.getContent(), '<custom1>c1</custom1><p><custom2>c1</custom2></p>');
});

test('Store/restore tabindex', function() {
	editor.setContent('<span tabindex="42">abc</span>');
	equal(editor.getContent({format: 'raw'}).toLowerCase(), '<p><span data-mce-tabindex="42">abc</span></p>');
	equal(editor.getContent(), '<p><span tabindex="42">abc</span></p>');
});

test('show/hide/isHidden and events', function() {
	var lastEvent;

	editor.on('show hide', function(e) {
		lastEvent = e;
	});

	equal(editor.isHidden(), false, 'Initial isHidden state');

	editor.hide();
	equal(editor.isHidden(), true, 'After hide isHidden state');
	equal(lastEvent.type, "hide");

	lastEvent = null;
	editor.hide();
	strictEqual(lastEvent, null);

	editor.show();
	equal(editor.isHidden(), false, 'After show isHidden state');
	equal(lastEvent.type, "show");

	lastEvent = null;
	editor.show();
	strictEqual(lastEvent, null);
});

test('show/hide/isHidden and events (inline)', function() {
	var lastEvent;

	inlineEditor.on('show hide', function(e) {
		lastEvent = e;
	});

	equal(inlineEditor.isHidden(), false, 'Initial isHidden state');

	inlineEditor.hide();
	equal(inlineEditor.isHidden(), true, 'After hide isHidden state');
	equal(lastEvent.type, "hide");
	strictEqual(inlineEditor.getBody().contentEditable, "false", "ContentEditable after hide");

	lastEvent = null;
	inlineEditor.hide();
	strictEqual(lastEvent, null);

	inlineEditor.show();
	equal(inlineEditor.isHidden(), false, 'After show isHidden state');
	equal(lastEvent.type, "show");
	strictEqual(inlineEditor.getBody().contentEditable, "true", "ContentEditable after show");

	lastEvent = null;
	inlineEditor.show();
	strictEqual(lastEvent, null);
});

test('hide save content and hidden state while saving', function() {
	var lastEvent, hiddenStateWhileSaving;

	editor.on('SaveContent', function(e) {
		lastEvent = e;
		hiddenStateWhileSaving = editor.isHidden();
	});

	editor.setContent('xyz');
	editor.hide();

	strictEqual(hiddenStateWhileSaving, false, 'False isHidden state while saving');
	strictEqual(lastEvent.content, '<p>xyz</p>');
	strictEqual(document.getElementById('elm1').value, '<p>xyz</p>');
});

asyncTest('remove editor', function() {
	document.getElementById('view').appendChild(tinymce.DOM.create('textarea', {id: 'elmx'}));

	tinymce.init({
		selector: "#elmx",
		add_unload_trigger: false,
		disable_nodechange: true,
		skin: false,
		init_instance_callback: function(editor) {
			window.setTimeout(function() {
				var lastEvent;

				editor.on('SaveContent', function(e) {
					lastEvent = e;
				});

				editor.setContent('xyz');
				editor.remove();

				QUnit.start();

				strictEqual(lastEvent.content, '<p>xyz</p>');
				strictEqual(document.getElementById('elmx').value, '<p>xyz</p>');
			}, 0);
		}
	});
});

test('insertContent', function() {
	editor.setContent('<p>ab</p>');
	Utils.setSelection('p', 1);
	editor.insertContent('c');
	equal(editor.getContent(), '<p>acb</p>');
});

test('insertContent merge', function() {
	editor.setContent('<p><strong>a</strong></p>');
	Utils.setSelection('p', 1);
	editor.insertContent('<em><strong>b</strong></em>', {merge: true});
	equal(editor.getContent(), '<p><strong>a<em>b</em></strong></p>');
});

test('execCommand return values for native commands', function() {
	var lastCmd;

	strictEqual(editor.execCommand("NonExistingCommand"), false, "Return value for a completely unhandled command");

	Utils.patch(editor.getDoc(), 'execCommand', function(orgFunc, cmd) {
		lastCmd = cmd;
		return true;
	});

	strictEqual(editor.execCommand("ExistingCommand"), true, "Return value for an editor handled command");
	strictEqual(lastCmd, "ExistingCommand");
});

test('addCommand', function() {
	var scope = {}, lastScope, lastArgs;

	function callback() {
		lastScope = this;
		lastArgs = arguments;
	}

	editor.addCommand("CustomCommand1", callback, scope);
	editor.addCommand("CustomCommand2", callback);

	editor.execCommand("CustomCommand1", false, "value", {extra: true});
	strictEqual(lastArgs[0], false);
	strictEqual(lastArgs[1], "value");
	ok(lastScope === scope);

	editor.execCommand("CustomCommand2");
	equal(typeof lastArgs[0], "undefined");
	equal(typeof lastArgs[1], "undefined");
	ok(lastScope === editor);
});

test('addQueryStateHandler', function() {
	var scope = {}, lastScope, currentState;

	function callback() {
		lastScope = this;
		return currentState;
	}

	editor.addQueryStateHandler("CustomCommand1", callback, scope);
	editor.addQueryStateHandler("CustomCommand2", callback);

	currentState = false;
	ok(!editor.queryCommandState("CustomCommand1"));
	ok(lastScope === scope, "Scope is not custom scope");

	currentState = true;
	ok(editor.queryCommandState("CustomCommand2"));
	ok(lastScope === editor, "Scope is not editor");
});

test('Block script execution', function() {
	editor.setContent('<script></script><script type="x"></script><script type="mce-x"></script><p>x</p>');
	equal(
		Utils.cleanHtml(editor.getBody().innerHTML),
		'<script type="mce-no/type"></script>' +
		'<script type="mce-x"></script>' +
		'<script type="mce-x"></script>' +
		'<p>x</p>'
	);
	equal(
		editor.getContent(),
		'<script></script>' +
		'<script type="x"></script>' +
		'<script type="x"></script>' +
		'<p>x</p>'
	);
});

test('addQueryValueHandler', function() {
	var scope = {}, lastScope, currentValue;

	function callback() {
		lastScope = this;
		return currentValue;
	}

	editor.addQueryValueHandler("CustomCommand1", callback, scope);
	editor.addQueryValueHandler("CustomCommand2", callback);

	currentValue = "a";
	equal(editor.queryCommandValue("CustomCommand1"), "a");
	ok(lastScope === scope, "Scope is not custom scope");

	currentValue = "b";
	ok(editor.queryCommandValue("CustomCommand2"), "b");
	ok(lastScope === editor, "Scope is not editor");
});

test('setDirty/isDirty', function() {
	var lastArgs = null;

	editor.on('dirty', function(e) {
		lastArgs = e;
	});

	editor.setDirty(false);
	strictEqual(lastArgs, null);
	strictEqual(editor.isDirty(), false);

	editor.setDirty(true);
	strictEqual(lastArgs.type, 'dirty');
	strictEqual(editor.isDirty(), true);

	lastArgs = null;
	editor.setDirty(true);
	strictEqual(lastArgs, null);
	strictEqual(editor.isDirty(), true);

	editor.setDirty(false);
	strictEqual(lastArgs, null);
	strictEqual(editor.isDirty(), false);
});

test('setMode', function() {
	var clickCount = 0;

	editor.on('click', function() {
		clickCount++;
	});

	editor.dom.fire(editor.getBody(), 'click');
	equal(clickCount, 1);

	editor.setMode('readonly');
	equal(editor.theme.panel.find('button:last')[2].disabled(), true);
	editor.dom.fire(editor.getBody(), 'click');
	equal(clickCount, 1);

	editor.setMode('design');
	editor.dom.fire(editor.getBody(), 'click');
	equal(editor.theme.panel.find('button:last')[2].disabled(), false);
	equal(clickCount, 2);
});

test('translate', function() {
	tinymce.addI18n('en_US', {
		'input i18n': 'output i18n'
	});

	equal(editor.translate('input i18n'), 'output i18n');
});