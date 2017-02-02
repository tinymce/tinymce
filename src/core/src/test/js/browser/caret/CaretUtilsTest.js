ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/CaretPosition",
	"tinymce/text/Zwsp"
], function(Env, CaretUtils, CaretPosition, Zwsp) {
	module("tinymce.caret.CaretUtils");

	if (!Env.ceFalse) {
		return;
	}

	var assertRange = Utils.assertRange,
		createRange = Utils.createRange,
		ZWSP = Zwsp.ZWSP;

	function getRoot() {
		return document.getElementById('view');
	}

	function replaceWithZwsp(node) {
		for (var i = 0; i < node.childNodes.length; i++) {
			var childNode = node.childNodes[i];

			if (childNode.nodeType === 3) {
				childNode.nodeValue = childNode.nodeValue.replace(/__ZWSP__/, ZWSP);
			} else {
				replaceWithZwsp(childNode);
			}
		}
	}

	function setupHtml(html) {
		var child, rootElm = getRoot();

		// IE leaves zwsp in the dom on innerHTML
		while ((child = rootElm.firstChild)) {
			rootElm.removeChild(child);
		}

		// IE messes zwsp up on innerHTML so we need to first set markers then replace then using dom operations
		rootElm.innerHTML = html.replace(new RegExp(ZWSP, 'g'), '__ZWSP__');
		replaceWithZwsp(rootElm);
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

	test('isBeforeContentEditableFalse', function() {
		setupHtml(
			'<span contentEditable="false"></span>' +
			'<span contentEditable="false"></span>a'
		);

		strictEqual(CaretUtils.isBeforeContentEditableFalse(CaretPosition(getRoot(), 0)), true);
		strictEqual(CaretUtils.isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)), true);
		strictEqual(CaretUtils.isBeforeContentEditableFalse(CaretPosition(getRoot(), 2)), false);
		strictEqual(CaretUtils.isBeforeContentEditableFalse(CaretPosition(getRoot(), 3)), false);
	});

	test('isAfterContentEditableFalse', function() {
		setupHtml(
			'<span contentEditable="false"></span>' +
			'<span contentEditable="false"></span>a'
		);

		strictEqual(CaretUtils.isAfterContentEditableFalse(CaretPosition(getRoot(), 0)), false);
		strictEqual(CaretUtils.isAfterContentEditableFalse(CaretPosition(getRoot(), 1)), true);
		strictEqual(CaretUtils.isAfterContentEditableFalse(CaretPosition(getRoot(), 2)), true);
		strictEqual(CaretUtils.isAfterContentEditableFalse(CaretPosition(getRoot(), 3)), false);
	});

	test('normalizeRange', function() {
		setupHtml(
			'abc<span contentEditable="false">1</span>def'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 2)), createRange(getRoot().firstChild, 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 2)), createRange(getRoot().lastChild, 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
	});

	test('normalizeRange deep', function() {
		setupHtml(
			'<i><b>abc</b></i><span contentEditable="false">1</span><i><b>def</b></i>'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 2)), createRange(findElm('b').firstChild, 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 3)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('b:last').firstChild, 1)), createRange(findElm('b:last').firstChild, 1));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('b:last').firstChild, 0)), createRange(getRoot(), 2));
	});

	test('normalizeRange break at candidate', function() {
		setupHtml(
			'<p><b>abc</b><input></p><p contentEditable="false">1</p><p><input><b>abc</b></p>'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 3)), createRange(findElm('b').firstChild, 3));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b:last').lastChild, 0)), createRange(findElm('b:last').lastChild, 0));
	});

	test('normalizeRange at block caret container', function() {
		setupHtml(
			'<p data-mce-caret="before">\u00a0</p><p contentEditable="false">1</p><p data-mce-caret="after">\u00a0</p>'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 0)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 1)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 0)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 1)), createRange(getRoot(), 2));
	});

	test('normalizeRange at inline caret container', function() {
		setupHtml(
			'abc<span contentEditable="false">1</span>def'
		);

		getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[1]);
		getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[3]);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[1], 0)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[1], 1)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 3));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[3], 0)), createRange(getRoot(), 3));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[3], 1)), createRange(getRoot(), 3));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[1], 0)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[1], 1)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 3));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[3], 0)), createRange(getRoot(), 3));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[3], 1)), createRange(getRoot(), 3));
	});

	test('normalizeRange at inline caret container (combined)', function() {
		setupHtml(
			'abc' + ZWSP + '<span contentEditable="false">1</span>' + ZWSP + 'def'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 4)), createRange(getRoot(), 1));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
		assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 1)), createRange(getRoot(), 2));
	});

	test('normalizeRange at inline caret container after block', function() {
		setupHtml(
			'<p><span contentEditable="false">1</span></p>' + ZWSP + 'abc'
		);

		assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot().lastChild, 0));

	});
});
