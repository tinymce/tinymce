ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/CaretPosition"
], function(Env, CaretPosition) {
	module("tinymce.caret.CaretPosition");

	if (!Env.ceFalse) {
		return;
	}

	var createRange = Utils.createRange,
		assertCaretPosition = Utils.assertCaretPosition,
		assertRange = Utils.assertRange;

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		tinymce.$(getRoot()).empty();
		getRoot().innerHTML = html;
	}

	test('Constructor', function() {
		setupHtml('abc');
		strictEqual(new CaretPosition(getRoot(), 0).container(), getRoot());
		strictEqual(new CaretPosition(getRoot(), 1).offset(), 1);
		strictEqual(new CaretPosition(getRoot().firstChild, 0).container(), getRoot().firstChild);
		strictEqual(new CaretPosition(getRoot().firstChild, 1).offset(), 1);
	});

	test('fromRangeStart', function() {
		setupHtml('abc');
		assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 0)), new CaretPosition(getRoot(), 0));
		assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 1)), new CaretPosition(getRoot(), 1));
		assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot().firstChild, 1)), new CaretPosition(getRoot().firstChild, 1));
	});

	test('fromRangeEnd', function() {
		setupHtml('abc');
		assertCaretPosition(CaretPosition.fromRangeEnd(createRange(getRoot(), 0, getRoot(), 1)), new CaretPosition(getRoot(), 1));
		assertCaretPosition(CaretPosition.fromRangeEnd(createRange(getRoot().firstChild, 0, getRoot().firstChild, 1)), new CaretPosition(getRoot().firstChild, 1));
	});

	test('after', function() {
		setupHtml('abc<b>123</b>');
		assertCaretPosition(CaretPosition.after(getRoot().firstChild), new CaretPosition(getRoot(), 1));
		assertCaretPosition(CaretPosition.after(getRoot().lastChild), new CaretPosition(getRoot(), 2));
	});

	test('before', function() {
		setupHtml('abc<b>123</b>');
		assertCaretPosition(CaretPosition.before(getRoot().firstChild), new CaretPosition(getRoot(), 0));
		assertCaretPosition(CaretPosition.before(getRoot().lastChild), new CaretPosition(getRoot(), 1));
	});

	test('isAtStart', function() {
		setupHtml('abc<b>123</b>123');
		ok(new CaretPosition(getRoot(), 0).isAtStart());
		ok(!new CaretPosition(getRoot(), 1).isAtStart());
		ok(!new CaretPosition(getRoot(), 3).isAtStart());
		ok(new CaretPosition(getRoot().firstChild, 0).isAtStart());
		ok(!new CaretPosition(getRoot().firstChild, 1).isAtStart());
		ok(!new CaretPosition(getRoot().firstChild, 3).isAtStart());
	});

	test('isAtEnd', function() {
		setupHtml('abc<b>123</b>123');
		ok(new CaretPosition(getRoot(), 3).isAtEnd());
		ok(!new CaretPosition(getRoot(), 2).isAtEnd());
		ok(!new CaretPosition(getRoot(), 0).isAtEnd());
		ok(new CaretPosition(getRoot().firstChild, 3).isAtEnd());
		ok(!new CaretPosition(getRoot().firstChild, 0).isAtEnd());
		ok(!new CaretPosition(getRoot().firstChild, 1).isAtEnd());
	});

	test('toRange', function() {
		setupHtml('abc');
		assertRange(new CaretPosition(getRoot(), 0).toRange(), createRange(getRoot(), 0));
		assertRange(new CaretPosition(getRoot(), 1).toRange(), createRange(getRoot(), 1));
		assertRange(new CaretPosition(getRoot().firstChild, 1).toRange(), createRange(getRoot().firstChild, 1));
	});

	test('isEqual', function() {
		setupHtml('abc');
		equal(new CaretPosition(getRoot(), 0).isEqual(new CaretPosition(getRoot(), 0)), true);
		equal(new CaretPosition(getRoot(), 1).isEqual(new CaretPosition(getRoot(), 0)), false);
		equal(new CaretPosition(getRoot(), 0).isEqual(new CaretPosition(getRoot().firstChild, 0)), false);
	});

	test('isVisible', function() {
		setupHtml('<b>  abc</b>');
		equal(new CaretPosition(getRoot().firstChild.firstChild, 0).isVisible(), false);
		equal(new CaretPosition(getRoot().firstChild.firstChild, 3).isVisible(), true);
	});

	test('getClientRects', function() {
		setupHtml(
			'<b>abc</b>' +
			'<div contentEditable="false">1</div>' +
			'<div contentEditable="false">2</div>' +
			'<div contentEditable="false">2</div>' +
			'<input style="margin: 10px">' +
			'<input style="margin: 10px">' +
			'<input style="margin: 10px">' +
			'<p>123</p>' +
			'<br>'
		);

		equal(new CaretPosition(getRoot().firstChild.firstChild, 0).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 1).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 2).getClientRects().length, 2);
		equal(new CaretPosition(getRoot(), 3).getClientRects().length, 2);
		equal(new CaretPosition(getRoot(), 4).getClientRects().length, 2);
		equal(new CaretPosition(getRoot(), 5).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 6).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 7).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 8).getClientRects().length, 1);
		equal(new CaretPosition(getRoot(), 9).getClientRects().length, 0);
	});

	test('getClientRects between inline node and cE=false', function() {
		setupHtml(
			'<span contentEditable="false">def</span>' +
			'<b>ghi</b>'
		);

		equal(new CaretPosition(getRoot(), 1).getClientRects().length, 1);
	});

	test('getClientRects at last visible character', function() {
		setupHtml('<b>a  </b>');

		equal(new CaretPosition(getRoot().firstChild.firstChild, 1).getClientRects().length, 1);
	});

	test('getClientRects at extending character', function() {
		setupHtml('a\u0301b');

		equal(new CaretPosition(getRoot().firstChild, 0).getClientRects().length, 1);
		equal(new CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
		equal(new CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
	});

	test('getClientRects at whitespace character', function() {
		setupHtml('  a  ');

		equal(new CaretPosition(getRoot().firstChild, 0).getClientRects().length, 0);
		equal(new CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
		equal(new CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
		equal(new CaretPosition(getRoot().firstChild, 3).getClientRects().length, 1);
		equal(new CaretPosition(getRoot().firstChild, 4).getClientRects().length, 0);
		equal(new CaretPosition(getRoot().firstChild, 5).getClientRects().length, 0);
	});

	test('getNode', function() {
		setupHtml('<b>abc</b><input><input>');

		equal(new CaretPosition(getRoot().firstChild.firstChild, 0).getNode(), getRoot().firstChild.firstChild);
		equal(new CaretPosition(getRoot(), 1).getNode(), getRoot().childNodes[1]);
		equal(new CaretPosition(getRoot(), 2).getNode(), getRoot().childNodes[2]);
		equal(new CaretPosition(getRoot(), 3).getNode(), getRoot().childNodes[2]);
	});

	test('getNode (before)', function() {
		setupHtml('<b>abc</b><input><input>');

		equal(new CaretPosition(getRoot().firstChild.firstChild, 0).getNode(true), getRoot().firstChild.firstChild);
		equal(new CaretPosition(getRoot(), 1).getNode(true), getRoot().childNodes[0]);
		equal(new CaretPosition(getRoot(), 2).getNode(true), getRoot().childNodes[1]);
		equal(new CaretPosition(getRoot(), 3).getNode(true), getRoot().childNodes[2]);
	});
});
