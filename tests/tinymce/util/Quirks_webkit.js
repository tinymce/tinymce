module("tinymce.utils.Quirks_WebKit", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			elements: "elm1",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			disable_nodechange: true,
			init_instance_callback : function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

if (tinymce.isWebKit) {
	test('Delete from beginning of P into H1', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';
		Utils.setSelection('p', 0);
		editor.execCommand('Delete');
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('Delete whole H1 before P', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';

		var rng = editor.selection.getRng();
		rng.setStartBefore(editor.getBody().firstChild);
		rng.setEndAfter(editor.getBody().firstChild);
		editor.selection.setRng(rng);

		editor.execCommand('Delete');
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>b<br></h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('Delete from beginning of P with style span inside into H1', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b<span style="color:red">c</span></p>';
		Utils.setSelection('p', 0);
		editor.execCommand('Delete');
		equal(Utils.normalizeHtml(Utils.cleanHtml(editor.getBody().innerHTML)), '<h1>ab<span data-mce-style="color:red" style="color: red;">c</span></h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('ForwardDelete from end of H1 into P', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';
		Utils.setSelection('h1', 1);
		editor.execCommand('ForwardDelete');
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('ForwardDelete whole H1 before P', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';

		var rng = editor.selection.getRng();
		rng.setStartBefore(editor.getBody().firstChild);
		rng.setEndAfter(editor.getBody().firstChild);
		editor.selection.setRng(rng);

		editor.execCommand('ForwardDelete');
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>b<br></h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('ForwardDelete from end of H1 into P with style span inside', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b<span style="color:red">c</span></p>';
		Utils.setSelection('h1', 1);
		editor.execCommand('ForwardDelete');
		equal(Utils.normalizeHtml(Utils.cleanHtml(editor.getBody().innerHTML)), '<h1>ab<span data-mce-style="color:red" style="color: red;">c</span></h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('Backspace key from beginning of P into H1', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';
		Utils.setSelection('p', 0);
		editor.fire("keydown", {keyCode: 8});
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});

	test('Delete key from end of H1 into P', function() {
		editor.getBody().innerHTML ='<h1>a</h1><p>b</p>';
		Utils.setSelection('h1', 1);
		editor.fire("keydown", {keyCode: 46});
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
		equal(editor.selection.getStart().nodeName, 'H1');
	});
} else {
	test("Skipped since the browser isn't WebKit", function() {
		ok(true, "Skipped");
	});
}
