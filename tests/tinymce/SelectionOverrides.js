ModuleLoader.require([
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretContainer",
	"tinymce/util/VK"
], function(CaretPosition, CaretContainer, VK) {
	module("tinymce.SelectionOverrides", {
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

	function pressKey(key) {
		return function() {
			Utils.pressKey({keyCode: key});
		};
	}

	var leftArrow = pressKey(VK.LEFT);
	var rightArrow = pressKey(VK.RIGHT);
	var backspace = pressKey(VK.BACKSPACE);
	var forwardDelete = pressKey(VK.DELETE);
	var upArrow = pressKey(VK.UP);
	var downArrow = pressKey(VK.DOWN);

	test('left/right over cE=false inline', function() {
		editor.setContent('<span contenteditable="false">1</span>');
		editor.selection.select(editor.$('span')[0]);

		leftArrow();
		equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
		equal(editor.selection.getRng().startContainer, editor.$('p')[0].firstChild);

		rightArrow();
		equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		equal(editor.selection.getNode(), editor.$('span')[0]);

		rightArrow();
		equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
		equal(editor.selection.getRng().startContainer, editor.$('p')[0].lastChild);
	});

	test('left/right over cE=false block', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		leftArrow();
		equal(editor.getContent(), '<p contenteditable="false">1</p>');
		equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);

		rightArrow();
		equal(editor.getContent(), '<p contenteditable="false">1</p>');
		equal(editor.selection.getNode(), editor.$('p')[0]);

		rightArrow();
		equal(editor.getContent(), '<p contenteditable="false">1</p>');
		equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);
	});

	test('left before cE=false block and type', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		leftArrow();
		Utils.type('a');
		equal(editor.getContent(), '<p>a</p><p contenteditable="false">1</p>');
		equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
	});

	test('right after cE=false block and type', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		rightArrow();
		Utils.type('a');
		equal(editor.getContent(), '<p contenteditable="false">1</p><p>a</p>');
		equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
	});

	test('up from P to inline cE=false', function() {
		editor.setContent('<p>a<span contentEditable="false">1</span></p><p>abc</p>');
		Utils.setSelection('p:last', 3);

		upArrow();
		equal(CaretContainer.isCaretContainerInline(editor.$('p:first')[0].lastChild), true);
	});

	test('down from P to inline cE=false', function() {
		editor.setContent('<p>abc</p><p>a<span contentEditable="false">1</span></p>');
		Utils.setSelection('p:first', 3);

		downArrow();
		equal(CaretContainer.isCaretContainerInline(editor.$('p:last')[0].lastChild), true);
	});

	test('backspace on selected cE=false block', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		backspace();
		equal(editor.getContent(), '');
		equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

	test('backspace after cE=false block', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		rightArrow();
		backspace();
		equal(editor.getContent(), '');
		equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

	test('delete on selected cE=false block', function() {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		forwardDelete();
		equal(editor.getContent(), '');
		equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

});
