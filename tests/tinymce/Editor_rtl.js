ModuleLoader.require([
	"tinymce/util/I18n"
], function(I18n) {
	module("tinymce.Editor_rtl", {
		setupModule: function() {
			QUnit.stop();

			I18n.rtl = true;

			tinymce.init({
				selector: "textarea",
				toolbar: 'bold italic underline',
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
});
