asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce.caret.CaretPosition",
	"tinymce.caret.CaretContainer",
	"tinymce.util.VK",
	"tinymce.text.Zwsp"
], function (LegacyUnit, Pipeline, CaretPosition, CaretContainer, VK, Zwsp) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	module("tinymce.SelectionOverrides", {
		setupModule: function () {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function (ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	function pressKey (key) {
		return function () {
			Utils.pressKey({keyCode: key});
		};
	}

	function exitPreTest (arrow, offset, expectedContent) {
		return function () {
			editor.setContent('<pre>abc</pre>');

			Utils.setSelection('pre', 1);
			arrow();
			LegacyUnit.equal(editor.getContent(), '<pre>abc</pre>');
			LegacyUnit.equal(editor.selection.getNode().nodeName, 'PRE');

			Utils.setSelection('pre', offset);
			arrow();
			LegacyUnit.equal(editor.getContent(), expectedContent);
			LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
		};
	}

	function assertCaretInCaretBlockContainer () {
		var beforeRng = editor.selection.getRng();
		LegacyUnit.equal(CaretContainer.isCaretContainerBlock(beforeRng.startContainer), true, 'Not in caret block container.');
	}

	var leftArrow = pressKey(VK.LEFT);
	var rightArrow = pressKey(VK.RIGHT);
	var backspace = pressKey(VK.BACKSPACE);
	var forwardDelete = pressKey(VK.DELETE);
	var upArrow = pressKey(VK.UP);
	var downArrow = pressKey(VK.DOWN);

	suite.test('left/right over cE=false inline', function () {
		editor.setContent('<span contenteditable="false">1</span>');
		editor.selection.select(editor.$('span')[0]);

		leftArrow();
		LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('p')[0].firstChild);

		rightArrow();
		LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		LegacyUnit.equal(editor.selection.getNode(), editor.$('span')[0]);

		rightArrow();
		LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('p')[0].lastChild);
	});

	suite.test('left/right over cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		leftArrow();
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);

		rightArrow();
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
		LegacyUnit.equal(editor.selection.getNode(), editor.$('p')[0]);

		rightArrow();
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);
	});

	suite.test('left before cE=false block and type', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		leftArrow();
		Utils.type('a');
		LegacyUnit.equal(editor.getContent(), '<p>a</p><p contenteditable="false">1</p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
	});

	suite.test('right after cE=false block and type', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		rightArrow();
		Utils.type('a');
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p><p>a</p>');
		LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
	});

	suite.test('up from P to inline cE=false', function () {
		editor.setContent('<p>a<span contentEditable="false">1</span></p><p>abc</p>');
		Utils.setSelection('p:last', 3);

		upArrow();
		LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.$('p:first')[0].lastChild), true);
	});

	suite.test('down from P to inline cE=false', function () {
		editor.setContent('<p>abc</p><p>a<span contentEditable="false">1</span></p>');
		Utils.setSelection('p:first', 3);

		downArrow();
		LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.$('p:last')[0].lastChild), true);
	});

	suite.test('backspace on selected cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		backspace();
		LegacyUnit.equal(editor.getContent(), '');
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

	suite.test('backspace after cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		rightArrow();
		backspace();
		LegacyUnit.equal(editor.getContent(), '');
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

	suite.test('delete on selected cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p>');
		editor.selection.select(editor.$('p')[0]);

		forwardDelete();
		LegacyUnit.equal(editor.getContent(), '');
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('p')[0]);
	});

	suite.test('delete inside nested cE=true block element', function () {
		editor.setContent('<div contenteditable="false">1<div contenteditable="true">2</div>3</div>');
		Utils.setSelection('div div', 1);

		Utils.type('\b');
		LegacyUnit.equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div contenteditable="false">1<div contenteditable="true"><br data-mce-bogus="1"></div>3</div>');
		LegacyUnit.equal(editor.selection.getRng().startContainer, editor.$('div div')[0]);
	});

	suite.test('backspace from block to after cE=false inline', function () {
		editor.setContent('<p>1<span contenteditable="false">2</span></p><p>3</p>');
		Utils.setSelection('p:nth-child(2)', 0);

		Utils.type('\b');
		LegacyUnit.equal(editor.getContent(), '<p>1<span contenteditable="false">2</span>3</p>');
		ok(Zwsp.isZwsp(editor.selection.getRng().startContainer.data));
		LegacyUnit.equal(editor.selection.getRng().startContainer.previousSibling.nodeName, 'SPAN');
	});

	suite.test('delete from block to before cE=false inline', function () {
		editor.setContent('<p>1</p><p><span contenteditable="false">2</span>3</p>');
		Utils.setSelection('p:nth-child(1)', 1);

		forwardDelete();
		LegacyUnit.equal(editor.getContent(), '<p>1<span contenteditable="false">2</span>3</p>');
		ok(Zwsp.isZwsp(editor.selection.getRng().startContainer.data));
		LegacyUnit.equal(editor.selection.getRng().startContainer.nextSibling.nodeName, 'SPAN');
	});

	suite.test('backspace from before cE=false block to text', function () {
		editor.setContent('<p>1</p><p contenteditable="false">2</p><p>3</p>');
		editor.selection.select(editor.dom.select('p')[1]);
		editor.selection.collapse(true);
		assertCaretInCaretBlockContainer();

		Utils.type('\b');
		var rng = editor.selection.getRng();

		LegacyUnit.equal(editor.getContent(), '<p>1</p><p contenteditable="false">2</p><p>3</p>');
		LegacyUnit.equal(rng.startContainer, editor.dom.select('p')[0].firstChild);
		LegacyUnit.equal(rng.startOffset, 1);
		LegacyUnit.equal(rng.collapsed, true);
	});

	suite.test('backspace from before first cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p><p>2</p>');
		editor.selection.select(editor.dom.select('p')[0]);
		editor.selection.collapse(true);
		assertCaretInCaretBlockContainer();

		Utils.type('\b');

		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p><p>2</p>');
		assertCaretInCaretBlockContainer();
	});

	suite.test('backspace from before cE=false block to after cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');
		editor.selection.select(editor.dom.select('p')[1]);
		editor.selection.collapse(true);
		assertCaretInCaretBlockContainer();

		Utils.type('\b');
		var rng = editor.selection.getRng();

		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p><p contenteditable="false">2</p>');
		assertCaretInCaretBlockContainer();
		LegacyUnit.equal(rng.startContainer.previousSibling, editor.dom.select('p')[0]);
	});

	suite.test('delete from after cE=false block to text', function () {
		editor.setContent('<p>1</p><p contenteditable="false">2</p><p>3</p>');
		editor.selection.select(editor.dom.select('p')[1]);
		editor.selection.collapse(false);
		assertCaretInCaretBlockContainer();

		forwardDelete();
		var rng = editor.selection.getRng();

		LegacyUnit.equal(editor.getContent(), '<p>1</p><p contenteditable="false">2</p><p>3</p>');
		LegacyUnit.equal(rng.startContainer, editor.dom.select('p')[2].firstChild);
		LegacyUnit.equal(rng.startOffset, 0);
		LegacyUnit.equal(rng.collapsed, true);
	});

	suite.test('delete from after last cE=false block', function () {
		editor.setContent('<p>1</p><p contenteditable="false">2</p>');
		editor.selection.select(editor.dom.select('p')[1]);
		editor.selection.collapse(false);
		assertCaretInCaretBlockContainer();
		forwardDelete();
		LegacyUnit.equal(editor.getContent(), '<p>1</p><p contenteditable="false">2</p>');
		assertCaretInCaretBlockContainer();
	});

	suite.test('delete from after cE=false block to before cE=false block', function () {
		editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');
		editor.selection.select(editor.dom.select('p')[0]);
		rightArrow();
		assertCaretInCaretBlockContainer();

		forwardDelete();
		var rng = editor.selection.getRng();

		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p><p contenteditable="false">2</p>');
		assertCaretInCaretBlockContainer();
		LegacyUnit.equal(rng.startContainer.nextSibling, editor.dom.select('p')[2]);
	});

	suite.test('delete from block to before cE=false inline', function () {
		editor.setContent('<p>1</p><p><span contenteditable="false">2</span>3</p>');
		Utils.setSelection('p:nth-child(1)', 1);

		forwardDelete();
		LegacyUnit.equal(editor.getContent(), '<p>1<span contenteditable="false">2</span>3</p>');
		ok(Zwsp.isZwsp(editor.selection.getRng().startContainer.data));
		LegacyUnit.equal(editor.selection.getRng().startContainer.nextSibling.nodeName, 'SPAN');
	});

	suite.test('backspace from empty block to after cE=false', function () {
		editor.getBody().innerHTML = '<p contenteditable="false">1</p><p><br></p>';
		Utils.setSelection('p:nth-child(2)', 0);

		backspace();
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
		assertCaretInCaretBlockContainer();
	});

	suite.test('delete from empty block to before cE=false', function () {
		editor.getBody().innerHTML = '<p><br></p><p contenteditable="false">2</p>';
		Utils.setSelection('p:nth-child(1)', 0);

		forwardDelete();
		LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">2</p>');
		assertCaretInCaretBlockContainer();
	});

	suite.test('exit pre block (up)', exitPreTest(upArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
	suite.test('exit pre block (left)', exitPreTest(leftArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
	suite.test('exit pre block (down)', exitPreTest(downArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));
	suite.test('exit pre block (right)', exitPreTest(rightArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));

	suite.test('click on link in cE=false', function () {
		editor.setContent('<p contentEditable="false"><a href="#"><strong>link</strong></a></p>');
		var evt = editor.fire('click', {target: editor.$('strong')[0]});

		LegacyUnit.equal(evt.isDefaultPrevented(), true);
	});

	suite.test('click next to cE=false block', function () {
		editor.setContent(
			'<table style="width: 100%">' +
				'<tr>' +
					'<td style="vertical-align: top">1</td>' +
					'<td><div contentEditable="false" style="width: 100px; height: 100px">2</div></td>' +
				'</tr>' +
			'</table>'
		);

		var firstTd = editor.dom.select('td')[0];
		var rect = editor.dom.getRect(firstTd);

		editor.fire('mousedown', {
			target: firstTd,
			clientX: rect.x + rect.w,
			clientY: rect.y + 10
		});

		// Since we can't do a real click we need to check if it gets sucked in towards the cE=false block
		LegacyUnit.equal(editor.selection.getNode().nodeName !== 'P', true);
	});

	suite.test('offscreen copy of cE=false block remains offscreen', function () {
		if (tinymce.isIE || tinymce.isGecko || tinymce.isOpera) {
			editor.setContent(
				'<table contenteditable="false" style="width: 100%; table-layout: fixed">' +
				'<tbody><tr><td>1</td><td>2</td></tr></tbody>' +
				'</table>'
			);

			editor.selection.select(editor.dom.select('table')[0]);
			var offscreenSelection = editor.dom.select('.mce-offscreen-selection')[0];

			ok(offscreenSelection.offsetLeft !== undefined, 'The offscreen selection\'s left border is undefined');
			ok(offscreenSelection.offsetLeft < 0, 'The offscreen selection\'s left border is onscreen');
			ok(offscreenSelection.offsetWidth + offscreenSelection.offsetLeft < 0,
				'The cE=false offscreen selection is visible on-screen. Right edge: ' +
				offscreenSelection.offsetLeft + '+' + offscreenSelection.offsetWidth + '=' +
				(offscreenSelection.offsetLeft + offscreenSelection.offsetWidth) + 'px'
			);
		} else {
			// Chrome and Safari behave correctly, and PhantomJS also declares itself as WebKit but does not
			// put the off-screen selection off-screen, so fails the above tests. However, it has no visible UI,
			// so everything is off-screen anyway :-)
			ok(true, 'Not a tested browser - Chrome & Safari work, PhantomJS does not put the selection off screen');
		}
	});
});
