import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.FakeCaretTypeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ ]);

  it('typing after a noneditable block should remove the fake caret', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false">a</div>');
    TinySelections.setCursor(editor, [], 1);
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="after"]': 1,
      'div.mce-visual-caret': 1
    });

    TinyContentActions.type(editor, 'b');

    TinyAssertions.assertContent(editor, '<div contenteditable="false">a</div><p>b</p>');
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="after"]': 0,
      'div.mce-visual-caret': 0
    });
  });
});
