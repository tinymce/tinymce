ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/LineWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/dom/DomQuery"
], function(Env, LineWalker, CaretPosition, $) {
	module("tinymce.caret.LineWalker");

	if (!Env.ceFalse) {
		return;
	}

	test('positionsUntil', function() {
		var result, predicateCallCount = 0;

		function predicate() {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<span contentEditable="false">a</span><span>b</span>');
		result = LineWalker.positionsUntil(1, $('#view')[0], predicate, $('#view')[0].firstChild);
		equal(result.length, 3);
		equal(result[0].position.getNode(), $('#view')[0].lastChild);
		equal(result[1].position.getNode(), $('#view')[0].lastChild.firstChild);
		equal(result[2].position.getNode(), $('#view')[0].lastChild.firstChild);
		equal(predicateCallCount, 3);

		predicateCallCount = 0;
		$('#view').html('<span>a</span><span contentEditable="false">b</span>');
		result = LineWalker.positionsUntil(-1, $('#view')[0], predicate, $('#view')[0].lastChild);
		equal(result.length, 3);
		equal(result[0].position.getNode(), $('#view')[0].lastChild);
		equal(result[1].position.getNode(), $('#view')[0].firstChild.firstChild);
		equal(result[2].position.getNode(), $('#view')[0].firstChild.firstChild);
		equal(predicateCallCount, 3);
	});

	test('upUntil', function() {
		var caretPosition, result, predicateCallCount = 0;

		function predicate() {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<p>a</p><p>b</p><p>c</p>');

		caretPosition = new CaretPosition($('#view')[0].lastChild.lastChild, 1);
		result = LineWalker.upUntil($('#view')[0], predicate, caretPosition);

		equal(result.length, 3);
		equal(result[0].line, 0);
		equal(result[1].line, 1);
		equal(result[2].line, 2);
		equal(predicateCallCount, 3);
	});

	test('downUntil', function() {
		var caretPosition, result, predicateCallCount = 0;

		function predicate() {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<p>a</p><p>b</p><p>c</p>');

		caretPosition = new CaretPosition($('#view')[0].firstChild.firstChild, 0);
		result = LineWalker.downUntil($('#view')[0], predicate, caretPosition);

		equal(result.length, 3);
		equal(result[0].line, 0);
		equal(result[1].line, 1);
		equal(result[2].line, 2);
		equal(predicateCallCount, 3);
	});

	test('isAboveLine', function() {
		equal(LineWalker.isAboveLine(5)({line: 10}), true);
		equal(LineWalker.isAboveLine(5)({line: 2}), false);
	});

	test('isLine', function() {
		equal(LineWalker.isLine(3)({line: 3}), true);
		equal(LineWalker.isLine(3)({line: 4}), false);
	});
});
