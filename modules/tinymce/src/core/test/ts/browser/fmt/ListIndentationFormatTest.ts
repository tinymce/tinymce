import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.ListItemFormatTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'lists'
  }, [], true);

  context('Apply list formatting', () => {

    it('TINY-8961: Apply multiple formats sequentially to entire list', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      editor.formatter.apply('italic');
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });
  });
});
