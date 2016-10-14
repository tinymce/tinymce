module("tinymce.plugins.Noneditable", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			noneditable_regexp: [/\{[^\}]+\}/g],
			plugins: 'noneditable',
			convert_fonts_to_spans: false,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

// Ignore on IE 7, 8 this is a known bug not worth fixing
if (tinymce.Env.ceFalse) {
	test('noneditable class', function() {
		editor.setContent('<p><span class="mceNonEditable">abc</span></p>');
		equal(editor.dom.select('span')[0].contentEditable, "false");
	});

	test('editable class', function() {
		editor.setContent('<p><span class="mceEditable">abc</span></p>');
		equal(editor.dom.select('span')[0].contentEditable, "true");
	});

	test('noneditable regexp', function() {
		editor.setContent('<p>{test1}{test2}</p>');

		equal(editor.dom.select('span').length, 2);
		equal(editor.dom.select('span')[0].contentEditable, "false");
		equal(editor.dom.select('span')[1].contentEditable, "false");
		equal(editor.getContent(), '<p>{test1}{test2}</p>');
	});

	test('noneditable regexp inside cE=false', function() {
		editor.setContent('<span contenteditable="false">{test1}</span>');
		equal(editor.dom.select('span').length, 1);
	});
}