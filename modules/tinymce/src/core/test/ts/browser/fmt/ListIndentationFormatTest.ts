import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.ListItemFormatTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'lists'
  }, [], true);

  const checkCss = () => {
    const item2 = hook.editor().dom.select('li.testClass')[0];

    const sugarItem2 = SugarElement.fromDom(item2);

    const color = Css.get(sugarItem2, 'color') === 'rgb(34, 47, 62)';
    const backgroundColor = Css.get(sugarItem2, 'background-color') === 'rgba(0, 0, 0, 0)';
    const fontStyle = Css.get(sugarItem2, 'font-style') === 'normal';
    const fontWeight = Css.get(sugarItem2, 'font-weight') === '400';
    const fontFamily = Css.get(sugarItem2, 'font-family') === '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

    return color && backgroundColor && fontStyle && fontWeight && fontFamily;
  };

  context('Apply list formatting', () => {

    it('TINY-11217: Apply multiple formats sequentially to entire list', async () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li class="testClass">Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      editor.formatter.apply('italic');
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Apply format to partial selection of list item', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li class="testClass">Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 4);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Apply format to nested lists', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1<ul><li>Subitem 1</li><li>Subitem 2</li></ul></li><li class="testClass">Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Apply format to list with mixed content', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item <em>1</em></li><li class="testClass">Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Remove all formats from list', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li><strong><em><u>Item 1</u></em></strong></li><li class="testClass"><strong><em><u>Item 2</u></em></strong></li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.remove('bold');
      editor.formatter.remove('italic');
      editor.formatter.remove('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Apply format to ordered list', () => {
      const editor = hook.editor();

      editor.setContent('<ol><li>Item 1</li><li class="testClass">Item 2</li></ol>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
    });

    it('TINY-11217: Apply custom format to list', () => {
      const editor = hook.editor();

      editor.formatter.register('custom_format', { inline: 'span', classes: 'custom-class' });
      editor.setContent('<ul><li>Item 1</li><li class="testClass">Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('custom_format');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      checkCss();
      editor.formatter.unregister('custom_format');
    });
  });
});
