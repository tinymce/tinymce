ModuleLoader.require([
	"tinymce/util/I18n",
	"tinymce/ui/Control"
], function(I18n, Control) {
	var scriptLoadedRtlState = {};

	module("tinymce.Editor_rtl", {
		setupModule: function() {
			QUnit.stop();

			tinymce.addI18n('ar', {
				"Bold": "Bold test",
				"_dir": "rtl"
			});

			tinymce.init({
				selector: "textarea",
				toolbar: 'bold italic underline',
				setup: function (editor) {
					var beforeEventRtl = editor.rtl;

					editor.on('ScriptsLoaded', function () {
						// We will know the rtl mode and code after all scripts have been loaded
						scriptLoadedRtlState = {
							beforeRtl: beforeEventRtl,
							afterRtl: editor.rtl,
							code: I18n.getCode()
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
			I18n.setCode('en');
			Control.rtl = false;
		}
	});

	test('UI rendered in RTL mode', function() {
		QUnit.equal(tinymce.activeEditor.getContainer().className.indexOf('mce-rtl') !== -1, true, 'Should have a mce-rtl class');
		QUnit.equal(tinymce.activeEditor.rtl, true, 'Should have the rtl property set');
	});

	test('Rtl mode property set on editor instance and I18n global', function() {
		QUnit.equal(scriptLoadedRtlState.beforeRtl, undefined, 'Should be undefined since we dont know the rtl mode yet');
		QUnit.equal(scriptLoadedRtlState.afterRtl, true, 'Should be true since we now know the rtl mode');
		QUnit.equal(scriptLoadedRtlState.code, 'ar', 'Should be "ar" since the code hass been changed during loading');
	});
});
