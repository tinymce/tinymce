module("tinymce.Shortcuts", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			disable_nodechange: true,
			indent: false,
			skin: false,
			entities: 'raw',
			schema: 'html5',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test('Shortcuts formats', function() {
	function assertShortcut(shortcut, args, assertState) {
		var called = false;

		editor.shortcuts.add(shortcut, '', function() {
			called = true;
		});

		args = tinymce.extend({
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false
		}, args);

		editor.fire('keydown', args);

		if (assertState) {
			ok(called, 'Shortcut wasn\'t called: ' + shortcut);
		} else {
			ok(!called, 'Shortcut was called when it shouldn\'t have been: ' + shortcut);
		}
	}

	assertShortcut('ctrl+d', {ctrlKey: true, keyCode: 68}, true);
	assertShortcut('ctrl+d', {altKey: true, keyCode: 68}, false);

	if (tinymce.Env.mac) {
		assertShortcut('meta+d', {metaKey: true, keyCode: 68}, true);
		assertShortcut('access+d', {ctrlKey: true, altKey: true, keyCode: 68}, true);
		assertShortcut('meta+d', {ctrlKey: true, keyCode: 68}, false);
		assertShortcut('access+d', {shiftKey: true, altKey: true, keyCode: 68}, false);
	} else {
		assertShortcut('meta+d', {ctrlKey: true, keyCode: 68}, true);
		assertShortcut('access+d', {shiftKey: true, altKey: true, keyCode: 68}, true);
		assertShortcut('meta+d', {metaKey: true, keyCode: 68}, false);
		assertShortcut('access+d', {ctrlKey: true, altKey: true, keyCode: 68}, false);
	}

	assertShortcut('ctrl+shift+d', {ctrlKey: true, shiftKey: true, keyCode: 68}, true);
	assertShortcut('ctrl+shift+alt+d', {ctrlKey: true, shiftKey: true, altKey: true, keyCode: 68}, true);
	assertShortcut('ctrl+221', {ctrlKey: true, keyCode: 221}, true);
});

test('Remove', function() {
	var called = false, eventArgs;

	eventArgs = {
		ctrlKey: true,
		keyCode: 68,
		altKey: false,
		shiftKey: false,
		metaKey: false
	};

	editor.shortcuts.add('ctrl+d', '', function() {
		called = true;
	});

	editor.fire('keydown', eventArgs);
	ok(called, 'Shortcut wasn\'t called when it should have been.');

	called = false;
	editor.shortcuts.remove('ctrl+d');
	editor.fire('keydown', eventArgs);
	ok(!called, 'Shortcut was called when it shouldn\'t.');
});
