asynctest('browser/core/MeasureTest', [
	'ephox.mcagar.api.TinyLoader',
	'tinymce/inlite/core/Measure',
	'ephox.agar.api.Pipeline',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Step',
	'ephox.agar.api.Chain',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.Assertions'
], function (TinyLoader, Measure, Pipeline, TinyApis, Step, Chain, UiFinder, Assertions) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var containsXY = function (r, x, y) {
		return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
	};

	var contains = function (a, b) {
		return containsXY(a, b.x, b.y) && containsXY(a, b.x + b.w, b.y + b.h);
	};

	var sAssertRect = function (editor, measure) {
		return Step.sync(function () {
			var elementRect = measure();
			var pageAreaRect = Measure.getPageAreaRect(editor);
			var contentAreaRect = Measure.getContentAreaRect(editor);

			Assertions.assertEq(contains(pageAreaRect, elementRect), true, 'Rect is not in page area rect');
			Assertions.assertEq(contains(contentAreaRect, elementRect), true, 'Rect is not in content area rect');
			Assertions.assertEq(elementRect.w > 0, true, 'Rect should have width');
			Assertions.assertEq(elementRect.h > 0, true, 'Rect should have height');
		});
	};

	var getElementRectFromSelector = function (editor, selector) {
		return function () {
			var elm = editor.dom.select(selector)[0];
			var rect = Measure.getElementRect(editor, elm);
			return rect;
		};
	};

	var getSelectionRectFromSelector = function (editor) {
		return function () {
			var rect = Measure.getSelectionRect(editor);
			return rect;
		};
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var tinyApis = TinyApis(editor);

		Pipeline.async({}, [
			tinyApis.sSetContent('<p>a</p><div style="width: 50px; height: 300px">b</div><p>c</p>'),
			sAssertRect(editor, getElementRectFromSelector(editor, 'p:nth-child(1)')),
			tinyApis.sSetCursor([0, 0], 0),
			sAssertRect(editor, getSelectionRectFromSelector(editor))
		], onSuccess, onFailure);
	}, {
		inline: true
	}, success, failure);
});
