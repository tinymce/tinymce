ModuleLoader.require([
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretContainer",
	"tinymce/util/VK",
	"tinymce/text/Zwsp"
], function(CaretPosition, CaretContainer, VK, Zwsp) {
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

	function exitPreTest(arrow, offset, expectedContent) {
		return function() {
			editor.setContent('<pre>abc</pre>');

			Utils.setSelection('pre', 1);
			arrow();
			equal(editor.getContent(), '<pre>abc</pre>');
			equal(editor.selection.getNode().nodeName, 'PRE');

			Utils.setSelection('pre', offset);
			arrow();
			equal(editor.getContent(), expectedContent);
			equal(editor.selection.getNode().nodeName, 'P');
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

	test('delete inside nested cE=true block element', function() {
		editor.setContent('<div contenteditable="false">1<div contenteditable="true">2</div>3</div>');
		Utils.setSelection('div div', 1);

		Utils.type('\b');
		equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div contenteditable="false">1<div contenteditable="true"><br data-mce-bogus="1"></div>3</div>');
		equal(editor.selection.getRng().startContainer, editor.$('div div')[0]);
	});

	test('backspace from block to after cE=false inline', function() {
		editor.setContent('<p>1<span contenteditable="false">2</span></p><p>3</p>');
		Utils.setSelection('p:nth-child(2)', 0);

		Utils.type('\b');
		equal(editor.getContent(), '<p>1<span contenteditable="false">2</span>3</p>');
		ok(Zwsp.isZwsp(editor.selection.getRng().startContainer.data));
		equal(editor.selection.getRng().startContainer.previousSibling.nodeName, 'SPAN');
	});

	test('delete from block to before cE=false inline', function() {
		editor.setContent('<p>1</p><p><span contenteditable="false">2</span>3</p>');
		Utils.setSelection('p:nth-child(1)', 1);

		forwardDelete();
		equal(editor.getContent(), '<p>1<span contenteditable="false">2</span>3</p>');
		ok(Zwsp.isZwsp(editor.selection.getRng().startContainer.data));
		equal(editor.selection.getRng().startContainer.nextSibling.nodeName, 'SPAN');
	});

	test('exit pre block (up)', exitPreTest(upArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
	test('exit pre block (left)', exitPreTest(leftArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
	test('exit pre block (down)', exitPreTest(downArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));
	test('exit pre block (right)', exitPreTest(rightArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));

	test('click on link in cE=false', function() {
		editor.setContent('<p contentEditable="false"><a href="#"><strong>link</strong></a></p>');
		var evt = editor.fire('click', {target: editor.$('strong')[0]});

		equal(evt.isDefaultPrevented(), true);
	});
});
