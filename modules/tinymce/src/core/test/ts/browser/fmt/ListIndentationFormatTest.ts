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

    it('TINY-8961: Apply format to partial selection of list item', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 4);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-8961: Apply format to nested lists', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1<ul><li>Subitem 1</li><li>Subitem 2</li></ul></li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-8961: Apply format to list with mixed content', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item <em>1</em></li><li><strong>Item</strong> 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-8961: Remove all formats from list', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li><strong><em><u>Item 1</u></em></strong></li><li><strong><em><u>Item 2</u></em></strong></li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.remove('bold');
      editor.formatter.remove('italic');
      editor.formatter.remove('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-8961: Apply format to ordered list', () => {
      const editor = hook.editor();

      editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-8961: Apply custom format to list', () => {
      const editor = hook.editor();

      editor.formatter.register('custom_format', { inline: 'span', classes: 'custom-class' });
      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('custom_format');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      TinyAssertions.assertContent(editor, expected);
      editor.formatter.unregister('custom_format');
    });
  });
});
