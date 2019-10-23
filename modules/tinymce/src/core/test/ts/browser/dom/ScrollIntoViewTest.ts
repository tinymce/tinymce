import { Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, Cursors } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { window } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.dom.ScrollIntoViewTest', (success, failure) => {

  Theme();

  const sScrollReset = function (editor: Editor) {
    return Step.sync(function () {
      editor.getWin().scrollTo(0, 0);
    });
  };

  const sSetContent = function (editor: Editor, tinyApis: TinyApis, html: string) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      Waiter.sTryUntil('Wait for scrollHeight to be updated', Step.sync(function () {
        Assertions.assertEq('Scroll body should be more than 100', true, editor.getBody().scrollHeight > 100);
      }))
    ]);
  };

  const sScrollIntoView = function (editor: Editor, selector: string, alignToTop?: boolean) {
    return Step.sync(function () {
      editor.selection.scrollIntoView(editor.dom.select(selector)[0], alignToTop);
    });
  };

  const sScrollElementIntoView = function (editor: Editor, selector: string, alignToTop?: boolean) {
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

  const sAssertScrollPosition = function (editor: Editor, x: number, y: number) {
    return Step.sync(function () {
      const actualX = Math.round(editor.dom.getViewPort(editor.getWin()).x);
      const actualY = Math.round(editor.dom.getViewPort(editor.getWin()).y);
      Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, x, actualX);
      Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, y, actualY);
    });
  };

  const sAssertApproxScrollPosition = function (editor: Editor, x: number, y: number) {
    return Step.sync(function () {
      const actualX = editor.dom.getViewPort(editor.getWin()).x;
      const actualY = editor.dom.getViewPort(editor.getWin()).y;
      Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, true, Math.abs(x - actualX) < 5);
      Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, true, Math.abs(y - actualY) < 5);
    });
  };

  const mBindScrollIntoViewEvent = function (editor: Editor) {
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

  const mAssertScrollIntoViewEventInfo = function (editor: Editor, expectedElementSelector: string, expectedAlignToTop: boolean) {
    return Step.stateful(function (value: any, next, die) {
      const expectedTarget = Element.fromDom(editor.dom.select(expectedElementSelector)[0]);
      const actualTarget = Element.fromDom(value.state.get().elm);
      Assertions.assertDomEq('Target should be expected element', expectedTarget, actualTarget);
      Assertions.assertEq('Align to top should be expected value', expectedAlignToTop, value.state.get().alignToTop);
      editor.off('ScrollIntoView', value.handler);
      next({});
    });
  };

  const steps = function (editor: Editor, tinyApis: TinyApis) {
    return [
      tinyApis.sFocus(),
      Logger.t('Public Selection API', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollIntoView(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 648)
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollIntoView(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 1000)
        ])),
        Logger.t('Scroll to element already in view shouldn\'t do anything', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 600px">a</div>'),
          Step.sync(() => {
            editor.getWin().scrollTo(0, 900);
          }),
          sScrollIntoView(editor, 'div:nth-child(2)'),
          sAssertScrollPosition(editor, 0, 900)
        ])),
        Logger.t('Scroll to element with height larger than viewport should align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 600px">a</div>'),
          sScrollIntoView(editor, 'div:nth-child(3)'),
          sAssertScrollPosition(editor, 0, 1050)
        ]))
      ])),
      Logger.t('Private ScrollElementIntoView', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollElementIntoView(editor, 'div:nth-child(2)', false),
          sAssertScrollPosition(editor, 0, 648)
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollElementIntoView(editor, 'div:nth-child(2)', true),
          sAssertScrollPosition(editor, 0, 1000)
        ]))
      ])),
      Logger.t('Private ScrollRangeIntoView', GeneralSteps.sequence([
        Logger.t('Scroll up/down', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>'),
          sScrollRangeIntoView(editor, [1, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 618), // Height of the text content/cursor
          sScrollRangeIntoView(editor, [0, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 0),
          sScrollRangeIntoView(editor, [2, 0], 0),
          sAssertApproxScrollPosition(editor, 0, 668)
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
    height: 500,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, success, failure);
});
