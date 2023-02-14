import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Optional, Optionals } from '@ephox/katamari';
import { Css, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

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

  const pRunToolbarWidthTest = async (remainingWidth: number, expectedWidth: Optional<string>) => {
    const editor = setupEditor(remainingWidth);

    editor.setContent('<p>Content</p>');
    editor.focus();
    editor.fire('ScrollWindow');

    await pAssertHeaderWidth(expectedWidth, Optional.some('400px'));
  };

  const setupEditor = (remainingWidth: number) => {
    const editor = hook.editor();
    const totalWidth = editor.getDoc().documentElement.clientWidth;
    Css.set(wrapper, 'width', 2 * totalWidth + 'px');
    Css.set(editorTarget, 'margin-left', totalWidth - remainingWidth + 'px');

    return editor;
  };

  const pAssertHeaderWidth = (expectedWidth: Optional<string>, expectedMaxWidth: Optional<string>) =>
    Waiter.pTryUntil('Could not verify width', () => {
      const header = SelectorFind.descendant(SugarBody.body(), '.tox-editor-header').getOrDie();
      const headerWrapper = SelectorFind.descendant(SugarBody.body(), '.tox-tinymce--toolbar-sticky-off').getOrDie();
      const width = Css.getRaw(headerWrapper, 'width');
      const maxWidth = Css.getRaw(header, 'max-width');
      if (!Optionals.equals(maxWidth, expectedMaxWidth) ) {
        throw new Error(`maxWidth is ${maxWidth.isSome()}, ${maxWidth.getOrNull()} and expectedMaxWidth is ${expectedMaxWidth.isSome()}, ${expectedMaxWidth.getOrNull()}`);
      }
      if (!Optionals.equals(width, expectedWidth)) {
        throw new Error(`Width is ${width.isSome()}, ${width.getOrNull()} and expectedWidth is ${expectedWidth.isSome()}, ${expectedWidth.getOrNull()}`);
      }
    });

  it('TINY-8977: If the editor fits with a wide margin it should not set a width', () =>
    pRunToolbarWidthTest(500, Optional.none())
  );

  it('TINY-8977: If the editor does not fit within the view', () =>
    pRunToolbarWidthTest(200, Optional.some('200px'))
  );

  it('TINY-8977: If the visible editor is smaller than the minimum', () =>
    pRunToolbarWidthTest(50, Optional.some('150px'))
  );

  it('TINY-8977: If the editor is not visible at all', () =>
    pRunToolbarWidthTest(-50, Optional.some('150px'))
  );
});
