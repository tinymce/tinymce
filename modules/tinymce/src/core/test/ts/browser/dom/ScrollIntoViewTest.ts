import { Assertions, Cursors, GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.dom.ScrollIntoViewTest', (success, failure) => {

  Theme();

  const sScrollReset = (editor: Editor) => {
    return Step.sync(() => {
      editor.getWin().scrollTo(0, 0);
    });
  };

  const sSetContent = (editor: Editor, tinyApis: TinyApis, html: string) => {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      Waiter.sTryUntil('Wait for scrollHeight to be updated', Step.sync(() => {
        Assertions.assertEq('Scroll body should be more than 100', true, editor.getBody().scrollHeight > 100);
      }))
    ]);
  };

  const sScrollIntoView = (editor: Editor, selector: string, alignToTop?: boolean) => {
    return Step.sync(() => {
      editor.selection.scrollIntoView(editor.dom.select(selector)[0], alignToTop);
    });
  };

  const sScrollElementIntoView = (editor: Editor, selector: string, alignToTop?: boolean) => {
    return Step.sync(() => {
      ScrollIntoView.scrollElementIntoView(editor, editor.dom.select(selector)[0], alignToTop);
    });
  };

  const sScrollRangeIntoView = (editor: Editor, path: number[], offset: number) => Step.sync(() => {
    const x = Cursors.calculateOne(SugarElement.fromDom(editor.getBody()), path);
    const rng = editor.dom.createRng();
    rng.setStart(x.dom, offset);
    rng.setEnd(x.dom, offset);

    ScrollIntoView.scrollRangeIntoView(editor, rng);
  });

  const sAssertScrollPosition = (editor: Editor, x: number, y: number) => {
    return Step.sync(() => {
      const actualX = Math.round(editor.dom.getViewPort(editor.getWin()).x);
      const actualY = Math.round(editor.dom.getViewPort(editor.getWin()).y);
      Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, x, actualX);
      Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, y, actualY);
    });
  };

  const sAssertApproxScrollPosition = (editor: Editor, x: number, y: number) => {
    return Step.sync(() => {
      const actualX = editor.dom.getViewPort(editor.getWin()).x;
      const actualY = editor.dom.getViewPort(editor.getWin()).y;
      Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, true, Math.abs(x - actualX) < 5);
      Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, true, Math.abs(y - actualY) < 5);
    });
  };

  const mBindScrollIntoViewEvent = (editor: Editor) => {
    return Step.stateful((_value, next, _die) => {
      const state = Cell({});

      const handler = (e) => {
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

  const mAssertScrollIntoViewEventInfo = (editor: Editor, expectedElementSelector: string, expectedAlignToTop: boolean) => {
    return Step.stateful((value: any, next, _die) => {
      const expectedTarget = SugarElement.fromDom(editor.dom.select(expectedElementSelector)[0]);
      const actualTarget = SugarElement.fromDom(value.state.get().elm);
      Assertions.assertDomEq('Target should be expected element', expectedTarget, actualTarget);
      Assertions.assertEq('Align to top should be expected value', expectedAlignToTop, value.state.get().alignToTop);
      editor.off('ScrollIntoView', value.handler);
      next({});
    });
  };

  const steps = (editor: Editor, tinyApis: TinyApis) => {
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
        Logger.t(`Scroll to element already in view shouldn't do anything`, GeneralSteps.sequence([
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
          sScrollRangeIntoView(editor, [ 1, 0 ], 0),
          sAssertApproxScrollPosition(editor, 0, 618), // Height of the text content/cursor
          sScrollRangeIntoView(editor, [ 0, 0 ], 0),
          sAssertApproxScrollPosition(editor, 0, 0),
          sScrollRangeIntoView(editor, [ 2, 0 ], 0),
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

  const isPhantomJs = () => {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
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
