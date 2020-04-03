import { Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, Cursors } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { window } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Location, Scroll } from '@ephox/sugar';
import * as ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.header.StickyHeaderScrollIntoViewTest', (success, failure) => {
  Theme();

  const sScrollReset = (editor: Editor) => Step.sync(() => {
    editor.getWin().scrollTo(0, 0);
  });

  const sSetContent = (editor: Editor, tinyApis, html: string) => GeneralSteps.sequence([
    tinyApis.sSetContent(html),
    Waiter.sTryUntil('Wait for scrollHeight to be updated', Step.sync(() => {
      Assertions.assertEq('Scroll body should be more than 100', true, editor.getBody().scrollHeight > 100);
    }))
  ]);

  const sScrollElementIntoView = (editor: Editor, selector: string, alignToTop: boolean) => Step.sync(() => {
    ScrollIntoView.scrollElementIntoView(editor, editor.dom.select(selector)[0], alignToTop);
  });

  const sScrollRangeIntoView = (editor: Editor, path: number[], offset: number, alignToTop?: boolean) => Step.sync(() => {
    const x = Cursors.calculateOne(Element.fromDom(editor.getBody()), path);
    const rng = editor.dom.createRng();
    rng.setStart(x.dom(), offset);
    rng.setEnd(x.dom(), offset);

    ScrollIntoView.scrollRangeIntoView(editor, rng, alignToTop);
  });

  const sAssertApproxScrollPosition = (editor: Editor, x: number, y: number) => Step.sync(() => {
    const scrollPos = Scroll.get(Element.fromDom(editor.getDoc()));
    const actualX = scrollPos.left();
    const actualY = scrollPos.top();
    Assertions.assertEq(`Scroll position X should be expected value: ${x} got ${actualX}`, true, Math.abs(x - actualX) < 5);
    Assertions.assertEq(`Scroll position Y should be expected value: ${y} got ${actualY}`, true, Math.abs(y - actualY) < 5);
  });

  const isPhantomJs = () => /PhantomJS/.test(window.navigator.userAgent);

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const container = Element.fromDom(editor.getContentAreaContainer());
    const viewHeight = window.innerHeight;
    const initialContainerPos = Location.absolute(container);
    const headerHeight = 79;

    const expectedSecondParaScrollBottomPos = 2000 - viewHeight + initialContainerPos.top();
    const expectedSecondParaScrollTopPos = 2000 + initialContainerPos.top() - headerHeight;

    const steps = [
      tinyApis.sFocus(),
      Logger.t('ScrollElementIntoView', GeneralSteps.sequence([
        Logger.t('Scroll to element align to bottom', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>'),
          sScrollElementIntoView(editor, 'p:nth-child(2)', false),
          sAssertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 50) // expected pos + para height
        ])),
        Logger.t('Scroll to element align to top', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>'),
          sScrollElementIntoView(editor, 'p:nth-child(2)', true),
          sAssertApproxScrollPosition(editor, 0, expectedSecondParaScrollTopPos)
        ]))
      ])),
      Logger.t('ScrollRangeIntoView', GeneralSteps.sequence([
        Logger.t('Scroll up/down', GeneralSteps.sequence([
          sScrollReset(editor),
          sSetContent(editor, tinyApis, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>'),
          Step.label('Scroll to second paragraph', sScrollRangeIntoView(editor, [ 1, 0 ], 0)),
          sAssertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 17), // expected pos + para line height
          Step.label('Scroll back to first paragraph', sScrollRangeIntoView(editor, [ 0, 0 ], 0)),
          sAssertApproxScrollPosition(editor, 0, initialContainerPos.top() - headerHeight),
          Step.label('Scroll to last paragraph', sScrollRangeIntoView(editor, [ 2, 0 ], 0)),
          sAssertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 50 + 17), // expected pos + second para height + para line height,
          Step.label('Scroll back to first paragraph', sScrollRangeIntoView(editor, [ 0, 0 ], 0)),
          sAssertApproxScrollPosition(editor, 0, initialContainerPos.top() - headerHeight),
          Step.label('Scroll to second paragraph to the top', sScrollRangeIntoView(editor, [ 1, 0 ], 0, true)),
          sAssertApproxScrollPosition(editor, 0, expectedSecondParaScrollTopPos)
        ]))
      ]))
    ];

    // Only run scrolling tests on real browsers doesn't seem to work on phantomjs for some reason
    Pipeline.async({}, isPhantomJs() ? [ ] : steps, onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body, .mce-content-body p { margin: 0 }'
  }, success, failure);
});
