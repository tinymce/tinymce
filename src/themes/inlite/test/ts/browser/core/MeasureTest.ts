import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Measure from 'tinymce/themes/inlite/core/Measure';
import InliteTheme from 'tinymce/themes/inlite/Theme';

UnitTest.asynctest('browser/core/MeasureTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  InliteTheme();

  const containsXY = function (r, x, y, loose) {
    const x1 = r.x - loose;
    const y1 = r.y - loose;
    const x2 = r.x + r.w + loose * 2;
    const y2 = r.y + r.h + loose * 2;

    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  };

  const contains = function (a, b, loose) {
    return containsXY(a, b.x, b.y, loose) && containsXY(a, b.x + b.w, b.y + b.h, loose);
  };

  const sAssertRect = function (editor, measure) {
    return Step.sync(function () {
      const elementRect = measure();
      const pageAreaRect = Measure.getPageAreaRect(editor);
      const contentAreaRect = Measure.getContentAreaRect(editor);

      Assertions.assertEq('Rect is not in page area rect', contains(pageAreaRect, elementRect, 1), true);
      Assertions.assertEq('Rect is not in content area rect', contains(contentAreaRect, elementRect, 1), true);
      Assertions.assertEq('Rect should have width', elementRect.w > 0, true);
      Assertions.assertEq('Rect should have height', elementRect.h > 0, true);
    });
  };

  const getElementRectFromSelector = function (editor, selector) {
    return function () {
      const elm = editor.dom.select(selector)[0];
      const rect = Measure.getElementRect(editor, elm);
      return rect;
    };
  };

  const getSelectionRectFromSelector = function (editor) {
    return function () {
      const rect = Measure.getSelectionRect(editor);
      return rect;
    };
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<p>a</p><p>b</p><div style="width: 50px; height: 300px">c</div><p>d</p>'),
      sAssertRect(editor, getElementRectFromSelector(editor, 'p:nth-child(1)')),
      tinyApis.sSetCursor([1, 0], 0),
      sAssertRect(editor, getSelectionRectFromSelector(editor))
    ], onSuccess, onFailure);
  }, {
    inline: true,
    theme: 'inlite',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
