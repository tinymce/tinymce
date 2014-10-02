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
	function assertShortcut(shortcut, args) {
		var called;

		editor.shortcuts.add(shortcut, '', function() {
			called = true;
		});

		args = tinymce.extend({
			ctrlKey: false,
			altKey: false,
			shiftKey: false
		}, args);

		if (tinymce.Env.mac && args.ctrlKey) {
			args.metaKey = true;
			args.ctrlKey = false;
		}

		editor.fire('keydown', args);

		ok(called, 'Shortcut wasn\'t called: ' + shortcut);
	}

	assertShortcut('ctrl+d', {ctrlKey: true, keyCode: 68});
	assertShortcut('ctrl+shift+d', {ctrlKey: true, shiftKey: true, keyCode: 68});
	assertShortcut('ctrl+shift+alt+d', {ctrlKey: true, shiftKey: true, altKey: true, keyCode: 68});
	assertShortcut('ctrl+221', {ctrlKey: true, keyCode: 221});
});
