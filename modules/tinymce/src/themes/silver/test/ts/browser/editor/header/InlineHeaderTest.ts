import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.InlineHeaderTest', () => {
  const wrapper = SugarElement.fromTag('div');
  const editorTarget = SugarElement.fromTag('div');
  const hook = TinyHooks.bddSetupFromElement<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo sidebar1 | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl',
    inline: true,
    width: '400px'
  }, () => {
    Insert.append(wrapper, editorTarget);
    Insert.append(SugarBody.body(), wrapper);

    return {
      element: editorTarget,
      teardown: () => {
        Remove.remove(wrapper);
      }
    };
  });

  const pRunToolbarWidthTest = async (remainingWidth: number, expectedWidth: string) => {
    const editor = setupEditor(remainingWidth);

    editor.setContent('<p>Content</p>');
    editor.focus();
    editor.fire('ScrollWindow');

    await pAssertHeaderWidth(expectedWidth, '400px');
  };

  const setupEditor = (remainingWidth: number) => {
    const editor = hook.editor();
    const totalWidth = editor.getDoc().documentElement.clientWidth;
    Css.set(wrapper, 'width', 2 * totalWidth + 'px');
    Css.set(editorTarget, 'margin-left', totalWidth - remainingWidth + 'px');

    return editor;
  };

  const pAssertHeaderWidth = (expectedWidth: string, expectedMaxWidth: string) =>
    Waiter.pTryUntil('Could not verify width', () => {
      const header = SelectorFind.descendant(SugarBody.body(), '.tox-editor-header').getOrDie();
      const headerWrapper = SelectorFind.descendant(SugarBody.body(), '.tox-tinymce--toolbar-sticky-off').getOrDie();
      const width = Css.getRaw(headerWrapper, 'width');
      const maxWidth = Css.getRaw(header, 'max-width');
      if (maxWidth.getOrDie() !== expectedMaxWidth) {
        throw new Error(`maxWidth is ${maxWidth.isSome()}, ${maxWidth.getOrNull()} and expectedMaxWidth is ${expectedMaxWidth}`);
      }
      if (width.getOrDie() !== expectedWidth) {
        throw new Error(`Width is ${width.isSome()}, ${width.getOrNull()} and expectedWidth is ${expectedWidth}`);
      }
    });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-9646: The width should remain on the editor', () =>
    pRunToolbarWidthTest(500, '400px')
  );

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-8977: If the editor does not fit within the view', () =>
    pRunToolbarWidthTest(200, '200px')
  );

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-8977: If the visible editor is smaller than the minimum', () =>
    pRunToolbarWidthTest(50, '150px')
  );

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-8977: If the editor is not visible at all', () =>
    pRunToolbarWidthTest(-50, '150px')
  );

  it('TINY-10580: when the inline editor is on the edge the bottom of the toolbar should be close to the top of the content', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Content</p>');
    const totalWidth = editor.getDoc().documentElement.clientWidth;
    Css.set(editorTarget, 'margin-left', totalWidth - 250 + 'px');
    editor.focus();

    const toolbar = await UiFinder.pWaitFor('the toolbar should be visible', SugarBody.body(), '.tox-editor-header');
    const toolbarRect = editor.dom.getRect(toolbar.dom as HTMLElement);
    const toolbarBottom = toolbarRect.y + toolbarRect.h;

    const editorTargetRect = editor.dom.getRect(editorTarget.dom);
    const editorTargetTop = editorTargetRect.y;

    assert.approximately(editorTargetTop, toolbarBottom, 5, 'toolbarBottom should be above editorBodyTop');
  });
});
