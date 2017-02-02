asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce/Env",
	"tinymce.caret.LineWalker",
	"tinymce.caret.CaretPosition",
	"tinymce.dom.DomQuery"
], function (LegacyUnit, Pipeline, Env, LineWalker, CaretPosition, $) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	if (!Env.ceFalse) {
		return;
	}

	suite.test('positionsUntil', function () {
		var result, predicateCallCount = 0;

		function predicate () {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<span contentEditable="false">a</span><span>b</span>');
		result = LineWalker.positionsUntil(1, $('#view')[0], predicate, $('#view')[0].firstChild);
		LegacyUnit.equal(result.length, 3);
		LegacyUnit.equal(result[0].position.getNode(), $('#view')[0].lastChild);
		LegacyUnit.equal(result[1].position.getNode(), $('#view')[0].lastChild.firstChild);
		LegacyUnit.equal(result[2].position.getNode(), $('#view')[0].lastChild.firstChild);
		LegacyUnit.equal(predicateCallCount, 3);

		predicateCallCount = 0;
		$('#view').html('<span>a</span><span contentEditable="false">b</span>');
		result = LineWalker.positionsUntil(-1, $('#view')[0], predicate, $('#view')[0].lastChild);
		LegacyUnit.equal(result.length, 3);
		LegacyUnit.equal(result[0].position.getNode(), $('#view')[0].lastChild);
		LegacyUnit.equal(result[1].position.getNode(), $('#view')[0].firstChild.firstChild);
		LegacyUnit.equal(result[2].position.getNode(), $('#view')[0].firstChild.firstChild);
		LegacyUnit.equal(predicateCallCount, 3);
	});

	suite.test('upUntil', function () {
		var caretPosition, result, predicateCallCount = 0;

		function predicate () {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<p>a</p><p>b</p><p>c</p>');

		caretPosition = new CaretPosition($('#view')[0].lastChild.lastChild, 1);
		result = LineWalker.upUntil($('#view')[0], predicate, caretPosition);

		LegacyUnit.equal(result.length, 3);
		LegacyUnit.equal(result[0].line, 0);
		LegacyUnit.equal(result[1].line, 1);
		LegacyUnit.equal(result[2].line, 2);
		LegacyUnit.equal(predicateCallCount, 3);
	});

	suite.test('downUntil', function () {
		var caretPosition, result, predicateCallCount = 0;

		function predicate () {
			predicateCallCount++;
			return false;
		}

		$('#view').html('<p>a</p><p>b</p><p>c</p>');

		caretPosition = new CaretPosition($('#view')[0].firstChild.firstChild, 0);
		result = LineWalker.downUntil($('#view')[0], predicate, caretPosition);

		LegacyUnit.equal(result.length, 3);
		LegacyUnit.equal(result[0].line, 0);
		LegacyUnit.equal(result[1].line, 1);
		LegacyUnit.equal(result[2].line, 2);
		LegacyUnit.equal(predicateCallCount, 3);
	});

	suite.test('isAboveLine', function () {
		LegacyUnit.equal(LineWalker.isAboveLine(5)({line: 10}), true);
		LegacyUnit.equal(LineWalker.isAboveLine(5)({line: 2}), false);
	});

	suite.test('isLine', function () {
		LegacyUnit.equal(LineWalker.isLine(3)({line: 3}), true);
		LegacyUnit.equal(LineWalker.isLine(3)({line: 4}), false);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
