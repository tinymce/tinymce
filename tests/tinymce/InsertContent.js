ModuleLoader.require([
	"tinymce/InsertContent"
], function(InsertContent) {
	module("tinymce.InsertContent", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	function assertSelection(selector, offset) {
		var node = editor.$(selector)[0];
		var rng = editor.selection.getRng();

		equal(rng.startContainer, node.firstChild);
		equal(rng.startOffset, offset);
		equal(rng.collapsed, true);
	}

	test('insertAtCaret - i inside text, converts to em', function() {
		editor.setContent('<p>1234</p>');
		editor.focus();
		Utils.setSelection('p', 2);
		InsertContent.insertAtCaret(editor, '<i>a</i>');
		equal(editor.getContent(), '<p>12<em>a</em>34</p>');
	});

	test('insertAtCaret - ul at beginning of li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 0);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>a</li><li>12</li></ul>');
		assertSelection('li:nth-child(2)', 0);
	});

	test('insertAtCaret - ul with multiple items at beginning of li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 0);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li><li>b</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>a</li><li>b</li><li>12</li></ul>');
		assertSelection('li:nth-child(3)', 0);
	});

	test('insertAtCaret - ul at end of li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 2);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>12</li><li>a</li></ul>');
		assertSelection('li:nth-child(2)', 1);
	});

	test('insertAtCaret - ul with multiple items at end of li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 2);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li><li>b</li><li>c</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>12</li><li>a</li><li>b</li><li>c</li></ul>');
		assertSelection('li:nth-child(4)', 1);
	});

	test('insertAtCaret - ul with multiple items in middle of li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 1);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li><li>b</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>1</li><li>a</li><li>b</li><li>2</li></ul>');
		assertSelection('li:nth-child(4)', 1);
	});

	test('insertAtCaret - ul in middle of li with formatting', function() {
		editor.setContent('<ul><li><em><strong>12</strong></em></li></ul>');
		editor.focus();
		Utils.setSelection('strong', 1);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li><em><strong>1</strong></em></li><li>a</li><li><em><strong>2</strong></em></li></ul>');
		assertSelection('li:nth-child(3) strong', 1);
	});

	test('insertAtCaret - ul at beginning of li with empty end li', function() {
		editor.setContent('<ul><li>12</li></ul>');
		editor.focus();
		Utils.setSelection('li', 0);
		InsertContent.insertAtCaret(editor, {content: '<ul><li>a</li><li></li></ul>', paste: true});
		equal(editor.getContent(), '<ul><li>a</li><li>12</li></ul>');
		assertSelection('li:nth-child(2)', 0);
	});

	test('insertAtCaret - merge inline elements', function() {
		editor.setContent('<strong><em>abc</em></strong>');
		editor.focus();
		Utils.setSelection('em', 1);
		InsertContent.insertAtCaret(editor, {content: '<em><strong>123</strong></em>', merge: true});
		equal(editor.getContent(), '<p><strong><em>a123bc</em></strong></p>');
	});
});
