module("tinymce.plugins.Legacyoutput", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			plugins: 'legacyoutput',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test("Font color", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('forecolor', false, '#FF0000');
	equal(editor.getContent().toLowerCase(), '<p><font color="#ff0000">text</font></p>');
});

test("Font size", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('fontsize', false, 7);
	equal(editor.getContent(), '<p><font size="7">text</font></p>');
});

test("Font face", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('fontname', false, "times");
	equal(editor.getContent(), '<p><font face="times">text</font></p>');
});

test("Bold", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('bold');
	equal(editor.getContent(), '<p><b>text</b></p>');
});

test("Italic", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('italic');
	equal(editor.getContent(), '<p><i>text</i></p>');
});

test("Underline", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('underline');
	equal(editor.getContent(), '<p><u>text</u></p>');
});

test("Strikethrough", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('strikethrough');
	equal(editor.getContent(), '<p><strike>text</strike></p>');
});

test("Justifyleft", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('justifyleft');
	equal(editor.getContent(), '<p align="left">text</p>');
});

test("Justifycenter", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('justifycenter');
	equal(editor.getContent(), '<p align="center">text</p>');
});

test("Justifyright", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('justifyright');
	equal(editor.getContent(), '<p align="right">text</p>');
});

test("Justifyfull", function() {
	editor.setContent('<p>text</p>');
	Utils.setSelection('p', 0, 'p', 4);
	editor.execCommand('justifyfull');
	equal(editor.getContent(), '<p align="justify">text</p>');
});