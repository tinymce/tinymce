import { Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, Cursors } from '@ephox/agar';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor } from 'tinymce/core/api/Editor';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.dom.ScrollIntoViewTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sScrollReset = function (editor) {
    return Step.sync(function () {
      editor.getWin().scrollTo(0, 0);
    });
  };

  const sSetContent = function (editor, tinyApis, html) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      Waiter.sTryUntil('Wait for scrollHeight to be updated', Step.sync(function () {
        Assertions.assertEq('Scroll body should be more than 100', true, editor.getBody().scrollHeight > 100);
      }), 100, 1000)
    ]);
  };

  const sScrollIntoView = function (editor, selector, alignToTop) {
    return Step.sync(function () {
      editor.selection.scrollIntoView(editor.dom.select(selector)[0], alignToTop);
    });
  };

  const sScrollElementIntoView = function (editor, selector, alignToTop) {
    return Step.sync(function () {
      ScrollIntoView.scrollElementIntoView(editor, editor.dom.select(selector)[0], alignToTop);
    });
  };

  const sScrollRangeIntoView = (editor: Editor, path: number[], offset: number) => {
    return Step.sync(function () {
      const x = Cursors.calculateOne(Element.fromDom(editor.getBody()), path);
      const rng = editor.dom.createRng();
      rng.setStart(x.dom(), offset);
      rng.setEnd(x.dom(), offset);

      ScrollIntoView.scrollRangeIntoView(editor, rng);
    });
  };

  const sAssertScrollPosition = function (editor, x, y) {
    return Step.sync(function () {
      Assertions.assertEq('Scroll position X should be expected value', x, editor.dom.getViewPort(editor.getWin()).x);
      Assertions.assertEq('Scroll position Y should be expected value', y, editor.dom.getViewPort(editor.getWin()).y);
    });
  };

  const sAssertApproxScrollPosition = function (editor, x, y) {
    return Step.sync(function () {
      const actualX = editor.dom.getViewPort(editor.getWin()).x;
      const actualY = editor.dom.getViewPort(editor.getWin()).y;
      Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, true, Math.abs(x - actualX) < 5);
      Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, true, Math.abs(y - actualY) < 5);
    });
  };

  const mBindScrollIntoViewEvent = function (editor) {
    return Step.stateful(function (value, next, die) {
      const state = Cell({});

      const handler = function (e) {
        e.preventDefault();
        state.set({
          elm: e.elm,
          alignToTop: e.alignToTop
        });
      };

      editor.on('ScrollIntoView', handler);

      next({
        handler,
        state
      });
    });
  };

  const mAssertScrollIntoViewEventInfo = function (editor, expectedElementSelector, expectedAlignToTop) {
    return Step.stateful(function (value: any, next, die) {
      const expectedTarget = Element.fromDom(editor.dom.select(expectedElementSelector)[0]);
      const actualTarget = Element.fromDom(value.state.get().elm);
      Assertions.assertDomEq('Target should be expected element', expectedTarget, actualTarget);
      Assertions.assertEq('Align to top should be expected value', expectedAlignToTop, value.state.get().alignToTop);
      editor.off('ScrollIntoView', value.handler);
      next({});
    });
  };

  const steps = function (editor, tinyApis) {
    return [
      tinyApis.sFocus,
      Logger.t('Public Selection API', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollIntoView(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 975)
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollIntoView(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 925)
        ]))
      ])),
      Logger.t('Private ScrollElementIntoView', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollElementIntoView(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 975)
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollElementIntoView(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 925)
        ]))
      ])),
      Logger.t('Private ScrollRangeIntoView', GeneralSteps.sequence([
        Logger.t('Scroll up/down', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollRangeIntoView(editor, [1, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 921),
          sScrollRangeIntoView(editor, [0, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 0),
          sScrollRangeIntoView(editor, [2, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 971)
        ]))
      ])),
      Logger.t('Override scrollIntoView event', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          mBindScrollIntoViewEvent(editor),
          sScrollIntoView(editor, 'div:nth-child(2)', false),
          mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 0)
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          mBindScrollIntoViewEvent(editor),
          sScrollIntoView(editor, 'div:nth-child(2)', true),
          mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 0)
        ])),
        Logger.t('Scroll to element align to bottom (private api)', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          mBindScrollIntoViewEvent(editor),
          sScrollElementIntoView(editor, 'div:nth-child(2)', false),
          mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 0)
        ])),
        Logger.t('Scroll to element align to top (private api)', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          mBindScrollIntoViewEvent(editor),
          sScrollElementIntoView(editor, 'div:nth-child(2)', true),
          mAssertScrollIntoViewEventInfo(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 0)
        ]))
      ]))
    ];
  };

  const isPhantomJs = function () {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // Only run scrolling tests on real browsers doesn't seem to work on phantomjs for some reason
    Pipeline.async({}, isPhantomJs() ? [ ] : steps(editor, tinyApis), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    skin_url: '/project/js/tinymce/skins/lightgray',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, success, failure);
});
