import { Waiter } from '@ephox/agar';
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

    await pAssertHeaderWidth(expectedWidth);
  };

  const setupEditor = (remainingWidth: number) => {
    const editor = hook.editor();
    const totalWidth = editor.getDoc().documentElement.clientWidth;
    Css.set(wrapper, 'width', 2 * totalWidth + 'px');
    Css.set(editorTarget, 'margin-left', totalWidth - remainingWidth + 'px');

    return editor;
  };

  const pAssertHeaderWidth = (expected: string) =>
    Waiter.pTryUntil('Could not verify width', () => {
      const header = SelectorFind.descendant(SugarBody.body(), '.tox-editor-header').getOrDie();
      const width = Css.get(header, 'width');
      assert.equal(width, expected, 'Width should be equal');
    });

  it('TINY-8977: If the editor fits with a wide margin it should not set a width', () =>
    pRunToolbarWidthTest(500, '400px')
  );

  it('TINY-8977: If the editor does not fit within the view', () =>
    pRunToolbarWidthTest(200, '200px')
  );

  it('TINY-8977: If the visible editor is smaller than the minimum', () =>
    pRunToolbarWidthTest(50, '150px')
  );

  it('TINY-8977: If the editor is not visible at all', () =>
    pRunToolbarWidthTest(-50, '150px')
  );
});
