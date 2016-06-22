asynctest('browser/alien/BookmarkTest', [
	'ephox/tinymce',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Chain',
	'ephox.agar.api.Cursors',
	'ephox.agar.api.Assertions',
	'ephox.mcagar.api.TinyDom',
	'tinymce/inlite/alien/Bookmark'
], function (tinymce, Pipeline, Chain, Cursors, Assertions, TinyDom, Bookmark) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var toNativeRange = function (range) {
		var domRange = document.createRange();
		domRange.setStart(range.start().dom(), range.soffset());
		domRange.setEnd(range.finish().dom(), range.foffset());
		return domRange;
	};

	var rangeToBookmark = function (dom) {
		return function (range) {
			return Bookmark.create(dom, range);
		};
	};

	var bookmarkToRange = function (dom) {
		return function (bookmark) {
			return Bookmark.resolve(dom, bookmark);
		};
	};

	var cAssertRangeEq = function (expected) {
		return Chain.op(function (actual) {
			Assertions.assertEq(expected.start().dom(), actual.startContainer, 'Not equal startContainer');
			Assertions.assertEq(expected.soffset(), actual.startOffset, 'Not equal startOffset');
			Assertions.assertEq(expected.finish().dom(), actual.endContainer, 'Not equal endContainer');
			Assertions.assertEq(expected.foffset(), actual.endOffset, 'Not equal endOffset');
		});
	};

	var sTestBookmark = function (html, path) {
		var dom = tinymce.DOM;
		var elm = TinyDom.fromDom(dom.create('div', {}, html));

		return Chain.asStep(elm, [
			Cursors.cFollowPath(Cursors.pathFrom(path)),
			Chain.mapper(toNativeRange),
			Chain.mapper(rangeToBookmark(dom)),
			Chain.mapper(bookmarkToRange(dom)),
			cAssertRangeEq(Cursors.calculate(elm, Cursors.pathFrom(path)))
		]);
	};

	Pipeline.async({}, [
		sTestBookmark('abc', {element: [0], offset: 0}),
		sTestBookmark('abc', {element: [0], offset: 1}),
		sTestBookmark('abc', {start: {element: [0], offset: 0}, finish: {element: [0], offset: 1}}),
		sTestBookmark('<b>a</b>', {element: [0, 0], offset: 0}),
		sTestBookmark('<b>a</b>', {element: [0, 0], offset: 0}),
		sTestBookmark('<b>a</b>', {start: {element: [0, 0], offset: 0}, finish: {element: [0, 0], offset: 1}}),
		sTestBookmark('<b>a</b><b>b</b>', {start: {element: [0, 0], offset: 0}, finish: {element: [1, 0], offset: 1}})
	], function () {
		success();
	}, failure);
});
