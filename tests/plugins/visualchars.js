module("tinymce.plugins.VisualChars", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			plugins: "visualchars",
			elements: "elm1",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			disable_nodechange: true,
			init_instance_callback : function(ed) {
				window.editor = ed;
				tinymce.util.Delay.setTimeout(function() {
					QUnit.start();
				}, 0);
			}
		});
	}
});

test('Visualchar toggle on/off', function() {
	editor.setContent('<p>a&nbsp;&nbsp;b</p>');
	equal(0, editor.dom.select('span').length);
	editor.execCommand('mceVisualChars');
	equal('<p>a&nbsp;&nbsp;b</p>', editor.getContent());
	equal(2, editor.dom.select('span').length);
	editor.execCommand('mceVisualChars');
	equal(0, editor.dom.select('span').length);
});
