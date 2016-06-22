asynctest('browser/core/SelectionMatcherTest', [
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Step',
	'ephox.agar.api.Assertions',
	'tinymce/inlite/core/SelectionMatcher',
	'tinymce/inlite/core/PredicateId',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, TinyApis, Step, Assertions, SelectionMatcher, PredicateId, GeneralSteps, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var assertResult = function (expectedResultState, result) {
		Assertions.assertEq(result !== null, expectedResultState, 'Should not be null');

		if (expectedResultState === true) {
			Assertions.assertEq(result.id, 'a', 'Should be matching a');
			Assertions.assertEq(result.rect.w > 0, true, 'Should be have width');
		}
	};

	var sTextSelectionTest = function (tinyApis, editor, inputHtml, spath, soffset, fpath, foffset, expectedResultState) {
		var sAssertTextSelectionResult = Step.sync(function () {
			var result = SelectionMatcher.textSelection('a')(editor);
			assertResult(expectedResultState, result);
		});

		return GeneralSteps.sequence([
			tinyApis.sSetContent(inputHtml),
			tinyApis.sSetSelection(spath, soffset, fpath, foffset),
			sAssertTextSelectionResult
		]);
	};

	var sTextSelectionTests = function (tinyApis, editor) {
		return GeneralSteps.sequence([
			sTextSelectionTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 1, true),
			sTextSelectionTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 0, false)
		]);
	};

	var sEmptyTextBlockTest = function (tinyApis, editor, inputHtml, spath, soffset, fpath, foffset, expectedResultState) {
		var sAssertTextSelectionResult = Step.sync(function () {
			var elements = editor.dom.getParents(editor.selection.getStart());
			var result = SelectionMatcher.emptyTextBlock(elements, 'a')(editor);
			assertResult(expectedResultState, result);
		});

		return GeneralSteps.sequence([
			tinyApis.sSetContent(inputHtml),
			tinyApis.sSetSelection(spath, soffset, fpath, foffset),
			sAssertTextSelectionResult
		]);
	};

	var sEmptyTextBlockTests = function (tinyApis, editor) {
		return GeneralSteps.sequence([
			sEmptyTextBlockTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 0, false),
			sEmptyTextBlockTest(tinyApis, editor, '<p>a</p>', [0], 0, [0], 1, false),
			sEmptyTextBlockTest(tinyApis, editor, '<p><br></p>', [0], 0, [0], 0, true),
			sEmptyTextBlockTest(tinyApis, editor, '<p><em><br></em></p>', [0, 0], 0, [0, 0], 0, true)
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var tinyApis = TinyApis(editor);

		Pipeline.async({}, [
			sTextSelectionTests(tinyApis, editor),
			sEmptyTextBlockTests(tinyApis, editor)
		], onSuccess, onFailure);
	}, {
		inline: true
	}, success, failure);
});
