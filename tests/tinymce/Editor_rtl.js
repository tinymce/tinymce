ModuleLoader.require([
	"tinymce/util/I18n"
], function(I18n) {
	var scriptLoadedRtlState = {};

	module("tinymce.Editor_rtl", {
		setupModule: function() {
			QUnit.stop();

			I18n.rtl = true;

			tinymce.init({
				selector: "textarea",
				toolbar: 'bold italic underline',
				setup: function (editor) {
					var beforeEventRtl = editor.rtl;

					editor.on('ScriptsLoaded', function () {
						// We will know the rtl mode after all scripts have been loaded
						scriptLoadedRtlState = {
							before: beforeEventRtl,
							after: editor.rtl
						};
					});
				},
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			I18n.rtl = false;
		}
	});

	test('UI rendered in RTL mode', function() {
		QUnit.equal(tinymce.activeEditor.getContainer().className.indexOf('mce-rtl') !== -1, true, 'Should have a mce-rtl class');
		QUnit.equal(tinymce.activeEditor.rtl, true, 'Should have the rtl property set');
	});

	test('UI rendered in RTL mode 2', function() {
		QUnit.equal(scriptLoadedRtlState.before, undefined, 'Should be undefined since we dont know the rtl mode yet');
		QUnit.equal(scriptLoadedRtlState.after, true, 'Should be true since we now know the rtl mode');
	});
});
