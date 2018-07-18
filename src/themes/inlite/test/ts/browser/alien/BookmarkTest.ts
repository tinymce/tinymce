import { Assertions, Chain, Cursors, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyDom } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Bookmark from 'tinymce/themes/inlite/alien/Bookmark';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.alien.BookmarkTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const toNativeRange = function (range) {
    const domRange = document.createRange();
    domRange.setStart(range.start().dom(), range.soffset());
    domRange.setEnd(range.finish().dom(), range.foffset());
    return domRange;
  };

  const rangeToBookmark = function (dom) {
    return function (range) {
      return Bookmark.create(dom, range);
    };
  };

  const bookmarkToRange = function (dom) {
    return function (bookmark) {
      return Bookmark.resolve(dom, bookmark);
    };
  };

  const cAssertRangeEq = function (expected) {
    return Chain.op(function (actual: any) {
      Assertions.assertDomEq('Not equal startContainer', expected.start(), TinyDom.fromDom(actual.startContainer));
      Assertions.assertEq('Not equal startOffset', expected.soffset(), actual.startOffset);
      Assertions.assertDomEq('Not equal endContainer', expected.finish(), TinyDom.fromDom(actual.endContainer));
      Assertions.assertEq('Not equal endOffset', expected.foffset(), actual.endOffset);
    });
  };

  const sTestBookmark = function (html, path) {
    const dom = DOMUtils.DOM;
    const elm = TinyDom.fromDom(dom.create('div', {}, html));

    return Chain.asStep(elm, [
      Cursors.cFollowPath(Cursors.pathFrom(path)),
      Chain.mapper(toNativeRange),
      Chain.mapper(rangeToBookmark(dom)),
      Chain.mapper(bookmarkToRange(dom)),
      cAssertRangeEq(Cursors.calculate(elm, Cursors.pathFrom(path)))
    ]);
  };

  Pipeline.async({}, [
    sTestBookmark('abc', { element: [0], offset: 0 }),
    sTestBookmark('abc', { element: [0], offset: 1 }),
    sTestBookmark('abc', { start: { element: [0], offset: 0 }, finish: { element: [0], offset: 1 } }),
    sTestBookmark('<b>a</b>', { element: [0, 0], offset: 0 }),
    sTestBookmark('<b>a</b>', { element: [0, 0], offset: 0 }),
    sTestBookmark('<b>a</b>', { start: { element: [0, 0], offset: 0 }, finish: { element: [0, 0], offset: 1 } }),
    sTestBookmark('<b>a</b><b>b</b>', { start: { element: [0, 0], offset: 0 }, finish: { element: [1, 0], offset: 1 } })
  ], function () {
    success();
  }, failure);
});
