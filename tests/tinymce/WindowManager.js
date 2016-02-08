ModuleLoader.require([
], function() {
	module("tinymce.WindowManager", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			editor.off('CloseWindow OpenWindow');
		}
	});

	test('OpenWindow/CloseWindow events', function() {
		var openWindowArgs, closeWindowArgs;

		editor.on('CloseWindow', function(e) {
			closeWindowArgs = e;
		});

		editor.on('OpenWindow', function(e) {
			openWindowArgs = e;
			e.win.close();
		});

		editor.windowManager.alert('test');

		equal(openWindowArgs.type, 'openwindow');
		equal(closeWindowArgs.type, 'closewindow');
		equal(editor.windowManager.getWindows().length, 0);
	});
});
