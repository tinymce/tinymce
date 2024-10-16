import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.ListItemFormatTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'lists'
  }, [], true);

  const checkCss = () => {
    const content = '<li>Item 2</li>';
    const colorCss = (Css.get(SugarElement.fromHtml(content), 'color') === 'black') ? true : false;
    const backgroundColorCss = (Css.get(SugarElement.fromHtml(content), 'background-color') === 'transparent') ? true : false;
    const fontStyleCss = (Css.get(SugarElement.fromHtml(content), 'font-style') === 'normal') ? true : false;
    const fontWeightCss = (Css.get(SugarElement.fromHtml(content), 'font-weight') === 'normal') ? true : false;
    const fontFamilyCss = (Css.get(SugarElement.fromHtml(content), 'font-family') === '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif') ? true : false;
    return colorCss && backgroundColorCss && fontStyleCss && fontWeightCss && fontFamilyCss;
  };

  context('Apply list formatting', () => {

    it('TINY-11217: Apply multiple formats sequentially to entire list', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      editor.formatter.apply('italic');
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Apply format to partial selection of list item', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 4);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Apply format to nested lists', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item 1<ul><li>Subitem 1</li><li>Subitem 2</li></ul></li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Apply format to list with mixed content', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li>Item <em>1</em></li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Remove all formats from list', () => {
      const editor = hook.editor();

      editor.setContent('<ul><li><strong><em><u>Item 1</u></em></strong></li><li><strong><em><u>Item 2</u></em></strong></li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.remove('bold');
      editor.formatter.remove('italic');
      editor.formatter.remove('underline');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Apply format to ordered list', () => {
      const editor = hook.editor();

      editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('bold');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
    });

    it('TINY-11217: Apply custom format to list', () => {
      const editor = hook.editor();

      editor.formatter.register('custom_format', { inline: 'span', classes: 'custom-class' });
      editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      editor.formatter.apply('custom_format');
      TinySelections.setCursor(editor, [ 0, 1 ], 1);

      TinyContentActions.keydown(editor, Keys.tab());

      const expected = editor.getContent();
      checkCss();
      TinyAssertions.assertContent(editor, expected);
      editor.formatter.unregister('custom_format');
    });
  });
});
