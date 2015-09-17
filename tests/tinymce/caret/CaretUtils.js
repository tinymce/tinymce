ModuleLoader.require([
	"tinymce/caret/CaretUtils",
	"tinymce/caret/CaretPosition",
	"tinymce/text/Zwsp"
], function(CaretUtils, CaretPosition, Zwsp) {
	module("tinymce.caret.CaretUtils");

	var assertCaretPosition = Utils.assertCaretPosition,
		assertRange = Utils.assertRange,
		createRange = Utils.createRange,
		ZWSP = Zwsp.ZWSP;

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		getRoot().innerHTML = html;
	}

	function findElm(selector) {
		return tinymce.$(selector, getRoot())[0];
	}

	test('isForwards', function() {
		equal(CaretUtils.isForwards(1), true);
		equal(CaretUtils.isForwards(10), true);
		equal(CaretUtils.isForwards(0), false);
		equal(CaretUtils.isForwards(-1), false);
		equal(CaretUtils.isForwards(-10), false);
	});

	test('isBackwards', function() {
		equal(CaretUtils.isBackwards(1), false);
		equal(CaretUtils.isBackwards(10), false);
		equal(CaretUtils.isBackwards(0), false);
		equal(CaretUtils.isBackwards(-1), true);
		equal(CaretUtils.isBackwards(-10), true);
	});

	test('findNode', function() {
		setupHtml('<b>abc</b><b><i>123</i></b>def');

		function isBold(node) {
			return node.nodeName == 'B';
		}

		function isText(node) {
			return node.nodeType == 3;
		}

		equal(CaretUtils.findNode(getRoot(), 1, isBold, getRoot()), getRoot().firstChild);
		equal(CaretUtils.findNode(getRoot(), 1, isText, getRoot()), getRoot().firstChild.firstChild);
		equal(CaretUtils.findNode(getRoot().childNodes[1], 1, isBold, getRoot().childNodes[1]), null);
		equal(CaretUtils.findNode(getRoot().childNodes[1], 1, isText, getRoot().childNodes[1]).nodeName, '#text');
		equal(CaretUtils.findNode(getRoot(), -1, isBold, getRoot()), getRoot().childNodes[1]);
		equal(CaretUtils.findNode(getRoot(), -1, isText, getRoot()), getRoot().lastChild);
	});

	test('getEditingHost', function() {
		setupHtml('<span contentEditable="true"><span contentEditable="false"></span></span>');

		equal(CaretUtils.getEditingHost(getRoot(), getRoot()), getRoot());
		equal(CaretUtils.getEditingHost(getRoot().firstChild, getRoot()), getRoot());
		equal(CaretUtils.getEditingHost(getRoot().firstChild.firstChild, getRoot()), getRoot().firstChild);
	});

	test('getParentBlock', function() {
		setupHtml('<p>abc</p><div><p><table><tr><td>X</td></tr></p></div>');

		strictEqual(CaretUtils.getParentBlock(findElm('p:first')), findElm('p:first'));
		strictEqual(CaretUtils.getParentBlock(findElm('td:first').firstChild), findElm('td:first'));
		strictEqual(CaretUtils.getParentBlock(findElm('td:first')), findElm('td:first'));
		strictEqual(CaretUtils.getParentBlock(findElm('table')), findElm('table'));
	});

	test('isInSameBlock', function() {
		setupHtml('<p>abc</p><p>def<b>ghj</b></p>');

		strictEqual(CaretUtils.isInSameBlock(
			CaretPosition(findElm('p:first').firstChild, 0),
			CaretPosition(findElm('p:last').firstChild, 0)
		), false);

		strictEqual(CaretUtils.isInSameBlock(
			CaretPosition(findElm('p:first').firstChild, 0),
			CaretPosition(findElm('p:first').firstChild, 0)
		), true);

		strictEqual(CaretUtils.isInSameBlock(
			CaretPosition(findElm('p:last').firstChild, 0),
			CaretPosition(findElm('b').firstChild, 0)
		), true);
	});

	test('isInSameEditingHost', function() {
		setupHtml(
			'<p>abc</p>' +
			'def' +
			'<span contentEditable="false">' +
				'<span contentEditable="true">ghi</span>' +
				'<span contentEditable="true">jkl</span>' +
			'</span>'
		);

		strictEqual(CaretUtils.isInSameEditingHost(
			CaretPosition(findElm('p:first').firstChild, 0),
			CaretPosition(findElm('p:first').firstChild, 1)
		), true);

		strictEqual(CaretUtils.isInSameEditingHost(
			CaretPosition(findElm('p:first').firstChild, 0),
			CaretPosition(getRoot().childNodes[1], 1)
		), true);

		strictEqual(CaretUtils.isInSameEditingHost(
			CaretPosition(findElm('span span:first').firstChild, 0),
			CaretPosition(findElm('span span:first').firstChild, 1)
		), true);

		strictEqual(CaretUtils.isInSameEditingHost(
			CaretPosition(findElm('p:first').firstChild, 0),
			CaretPosition(findElm('span span:first').firstChild, 1)
		), false);

		strictEqual(CaretUtils.isInSameEditingHost(
			CaretPosition(findElm('span span:first').firstChild, 0),
			CaretPosition(findElm('span span:last').firstChild, 1)
		), false);
	});

	test('getOuterCaretPosition', function() {
		setupHtml(
			'<p>abc</p>' +
			'<p data-mce-caret="1">X</p>' +
			'<p>abc</p>'
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(-1, CaretPosition(findElm('p:nth-child(2)').firstChild, 0)),
			CaretPosition(getRoot(), 1)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(-1, CaretPosition(findElm('p:nth-child(2)').firstChild, 1)),
			CaretPosition(getRoot(), 1)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(1, CaretPosition(findElm('p:nth-child(2)').firstChild, 0)),
			CaretPosition(getRoot(), 2)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(1, CaretPosition(findElm('p:nth-child(2)').firstChild, 1)),
			CaretPosition(getRoot(), 2)
		);
	});

	test('getOuterCaretPosition zwsp', function() {
		setupHtml(
			'<span contentEditable="false">1</span>' + ZWSP + '<span contentEditable="false">2</span>'
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(-1, CaretPosition(getRoot().childNodes[1], 0)),
			CaretPosition(getRoot(), 1)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(-1, CaretPosition(getRoot().childNodes[1], 1)),
			CaretPosition(getRoot(), 1)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(1, CaretPosition(getRoot().childNodes[1], 0)),
			CaretPosition(getRoot(), 2)
		);

		assertCaretPosition(
			CaretUtils.getOuterCaretPosition(1, CaretPosition(getRoot().childNodes[1], 1)),
			CaretPosition(getRoot(), 2)
		);
	});

	test('normalizeRange', function() {
		setupHtml(
			'abc<span contentEditable="false">1</span>def'
		);

		assertRange(CaretUtils.normalizeRange(createRange(getRoot().firstChild, 2)), createRange(getRoot().firstChild, 2));
		assertRange(CaretUtils.normalizeRange(createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(createRange(getRoot().lastChild, 2)), createRange(getRoot().lastChild, 2));
		assertRange(CaretUtils.normalizeRange(createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
	});

	test('normalizeRange deep', function() {
		setupHtml(
			'<i><b>abc</b></i><span contentEditable="false">1</span>'
		);

		assertRange(CaretUtils.normalizeRange(createRange(findElm('b').firstChild, 2)), createRange(findElm('b').firstChild, 2));
		assertRange(CaretUtils.normalizeRange(createRange(findElm('b').firstChild, 3)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(createRange(findElm('b').lastChild, 2)), createRange(findElm('b').lastChild, 2));
	});

	test('normalizeRange break at candidate', function() {
		setupHtml(
			'abc<input><span contentEditable="false">1</span><input>def'
		);

		assertRange(CaretUtils.normalizeRange(createRange(getRoot().firstChild, 3)), createRange(getRoot().firstChild, 3));
		assertRange(CaretUtils.normalizeRange(createRange(getRoot().lastChild, 0)), createRange(getRoot().lastChild, 0));
	});

	test('normalizeRange caret container', function() {
		setupHtml(
			'abc<span contentEditable="false">1</span>def'
		);

		getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[1]);
		getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[3]);

		assertRange(CaretUtils.normalizeRange(createRange(getRoot().firstChild, 3)), createRange(getRoot().childNodes[1], 0));
		assertRange(CaretUtils.normalizeRange(createRange(getRoot().lastChild, 0)), createRange(getRoot().childNodes[3], 0));
	});
});
