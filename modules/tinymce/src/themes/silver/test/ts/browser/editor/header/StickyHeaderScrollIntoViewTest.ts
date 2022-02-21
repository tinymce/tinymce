import { Cursors, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Scroll, SugarLocation, SugarPosition } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';

describe('browser.tinymce.themes.silver.editor.header.StickyHeaderScrollIntoViewTest', () => {

  const hook = TinyHooks.bddSetup<Editor>({
    add_unload_trigger: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body, .mce-content-body p { margin: 0 }'
  }, [], true);

  const scrollReset = (editor: Editor) => {
    editor.getWin().scrollTo(0, 0);
  };

  const pSetContent = async (editor: Editor, html: string) => {
    editor.setContent(html);
    await Waiter.pTryUntil('Wait for scrollHeight to be updated', () => {
      assert.isAbove(editor.getBody().scrollHeight, 100, 'Scroll body should be more than 100');
    });
  };

  const scrollElementIntoView = (editor: Editor, selector: string, alignToTop: boolean) => {
    ScrollIntoView.scrollElementIntoView(editor, editor.dom.select(selector)[0], alignToTop);
  };

  const scrollRangeIntoView = (editor: Editor, path: number[], offset: number, alignToTop?: boolean) => {
    const x = Cursors.calculateOne(TinyDom.body(editor), path);
    const rng = editor.dom.createRng();
    rng.setStart(x.dom, offset);
    rng.setEnd(x.dom, offset);

    ScrollIntoView.scrollRangeIntoView(editor, rng, alignToTop);
  };

  const assertApproxScrollPosition = (editor: Editor, x: number, y: number) => {
    const scrollPos = Scroll.get(TinyDom.document(editor));
    const actualX = scrollPos.left;
    const actualY = scrollPos.top;
    assert.approximately(actualX, x, 5, `Scroll position X should be expected value: ${x} got ${actualX}`);
    assert.approximately(actualY, y, 5, `Scroll position Y should be expected value: ${y} got ${actualY}`);
  };

  const headerHeight = 85;
  let initialContainerPos: SugarPosition;
  let expectedSecondParaScrollBottomPos: number;
  let expectedSecondParaScrollTopPos: number;
  beforeEach(() => {
    const editor = hook.editor();
    scrollReset(editor);
    const container = TinyDom.contentAreaContainer(editor);
    const viewHeight = window.innerHeight;
    initialContainerPos = SugarLocation.absolute(container);

    expectedSecondParaScrollBottomPos = 2000 - viewHeight + initialContainerPos.top;
    expectedSecondParaScrollTopPos = 2000 + initialContainerPos.top - headerHeight;
  });

  context('ScrollElementIntoView', () => {
    it('Scroll to element align to bottom', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>');
      scrollElementIntoView(editor, 'p:nth-child(2)', false);
      assertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 50); // expected pos + para height
    });

    it('Scroll to element align to top', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>');
      scrollElementIntoView(editor, 'p:nth-child(2)', true);
      assertApproxScrollPosition(editor, 0, expectedSecondParaScrollTopPos);
    });
  });

  context('ScrollRangeIntoView', () => {
    it('Scroll up/down', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<p style="height: 2000px">a</p><p style="height: 50px">b</p><p style="height: 2000px">c</p>');
      // Scroll to second paragraph
      scrollRangeIntoView(editor, [ 1, 0 ], 0);
      assertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 17); // expected pos + para line height
      // Scroll back to first paragraph
      scrollRangeIntoView(editor, [ 0, 0 ], 0);
      assertApproxScrollPosition(editor, 0, initialContainerPos.top - headerHeight);
      // Scroll to last paragraph
      scrollRangeIntoView(editor, [ 2, 0 ], 0);
      assertApproxScrollPosition(editor, 0, expectedSecondParaScrollBottomPos + 50 + 17); // expected pos + second para height + para line height,
      // Scroll back to first paragraph
      scrollRangeIntoView(editor, [ 0, 0 ], 0);
      assertApproxScrollPosition(editor, 0, initialContainerPos.top - headerHeight);
      // Scroll to second paragraph to the top
      scrollRangeIntoView(editor, [ 1, 0 ], 0, true);
      assertApproxScrollPosition(editor, 0, expectedSecondParaScrollTopPos);
    });
  });
});
