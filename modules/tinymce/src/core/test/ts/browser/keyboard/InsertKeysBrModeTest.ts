import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.InsertKeysBrModeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    forced_root_block: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const fireInsert = (editor: Editor) => {
    editor.fire('input', { isComposing: false } as InputEvent);
  };

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Insert key in text with in nbsp text node', () => {
    context('Nbsp at first character position', () => {
      it('Insert in text node with nbsp at start of body', () => {
        const editor = hook.editor();
        editor.setContent('&nbsp;a', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 2);
        TinyAssertions.assertContent(editor, '&nbsp;a');
      });

      it('Insert in text in node with leading nbsp after inline with trailing space', () => {
        const editor = hook.editor();
        editor.setContent('a<em>b </em>&nbsp;c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 2 ], 2, [ 2 ], 2);
        TinyAssertions.assertContent(editor, 'a<em>b </em>&nbsp;c');
      });

      it('Insert in text in node with leading nbsp after inline', () => {
        const editor = hook.editor();
        editor.setContent('a<em>b</em>&nbsp;c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 2 ], 2, [ 2 ], 2);
        TinyAssertions.assertContent(editor, 'a<em>b</em> c');
      });

      it('Insert in text in node with leading nbsp after inline with trailing nbsp', () => {
        const editor = hook.editor();
        editor.setContent('a<em>b&nbsp;</em>&nbsp;c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 2 ], 2);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 2 ], 2, [ 2 ], 2);
        TinyAssertions.assertContent(editor, 'a<em>b&nbsp;</em> c');
      });

      it('Insert at beginning of text node with leading nbsp after a br', () => {
        const editor = hook.editor();
        editor.setContent('a<br />&nbsp;b', { format: 'raw' });
        TinySelections.setCursor(editor, [ 2 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 2 ], 0, [ 2 ], 0);
        TinyAssertions.assertContent(editor, 'a<br />&nbsp;b');
      });

      it('Insert at beginning of text node with leading nbsp within inline element followed by br', () => {
        const editor = hook.editor();
        editor.setContent('a<br /><em>&nbsp;b</em>', { format: 'raw' });
        TinySelections.setCursor(editor, [ 2, 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 2, 0 ], 0, [ 2, 0 ], 0);
        TinyAssertions.assertContent(editor, 'a<br /><em>&nbsp;b</em>');
      });
    });

    context('Nbsp at last character position', () => {
      it('Insert in text node with nbsp at end of body', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
        TinyAssertions.assertContent(editor, 'a&nbsp;');
      });

      it('Insert in text in node with leading nbsp after inline with trailing space', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;<em> b</em>c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
        TinyAssertions.assertContent(editor, 'a&nbsp;<em> b</em>c');
      });

      it('Insert in text in node with trailing nbsp before inline', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;<em>b</em>c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
        TinyAssertions.assertContent(editor, 'a <em>b</em>c');
      });

      it('Insert in text in node with trailing nbsp before inline with leading nbsp', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;<em>&nbsp;b</em>c', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 0);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
        TinyAssertions.assertContent(editor, 'a <em>&nbsp;b</em>c');
      });

      it('Insert in text in node with single middle nbsp', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;b', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 3);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 3, [ 0 ], 3);
        TinyAssertions.assertContent(editor, 'a b');
      });

      it('Insert in text in node with multiple middle nbsp', () => {
        const editor = hook.editor();
        editor.setContent('a&nbsp;b&nbsp;c&nbsp;d', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0 ], 7);
        fireInsert(editor);
        TinyAssertions.assertSelection(editor, [ 0 ], 7, [ 0 ], 7);
        TinyAssertions.assertContent(editor, 'a b c d');
      });
    });
  });
});
