import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.api.commands.NewBlockCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('InsertNewBlockBefore command', () => {
    it('TINY-10022: empty editor', () => {
      const editor = hook.editor();
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><p>&nbsp;</p>');
    });

    it('TINY-10022: should insert empty block after paragrpaph with text', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>AAA</p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><p>AAA</p>');
    });

    it('TINY-10022: should insert empty block before paragraph with inline elements', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>AAA</em></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p><em>AAA</em></p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><p><em>AAA</em></p>');
    });

    it('TINY-10022: should insert empty block before blockquote', () => {
      const editor = hook.editor();
      editor.setContent('<blockquote><p>AAA</p></blockquote>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><blockquote><p>AAA</p></blockquote>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><blockquote><p>AAA</p></blockquote>');
    });

    it('TINY-10022: should insert new empty block between two paragraphs', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p><p>BBB</p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>&nbsp;</p><p>BBB</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>X</p><p>BBB</p>');
    });

    it('TINY-10022: should insert new empty block between two blockquotes', () => {
      const editor = hook.editor();
      editor.setContent('<blockquote><p>AAA</p></blockquote><blockquote><p>BBB</p></blockquote>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>&nbsp;</p><blockquote><p>BBB</p></blockquote>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>X</p><blockquote><p>BBB</p></blockquote>');
    });

    it('TINY-10022: insert new empty block within CET root', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="true"><p>AAA</p><p>BBB</p></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<div contenteditable="true"><p>&nbsp;</p><p>AAA</p><p>BBB</p></div>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<div contenteditable="true"><p>X</p><p>AAA</p><p>BBB</p></div>');
    });

    it('TINY-10022: insert new empty block before start container of ranged selection', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p><p>BBB</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 1, 0 ], 2);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>AAA</p><p>BBB</p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><p>AAA</p><p>BBB</p>');
    });

    it('TINY-10022: insert new empty block before noneditable block', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">AAA</p><p>BBB</p>');
      TinySelections.select(editor, '[contenteditable]', []);
      editor.execCommand('InsertNewBlockBefore');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p contenteditable="false">AAA</p><p>BBB</p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>X</p><p contenteditable="false">AAA</p><p>BBB</p>');
    });

    it('TINY-10022: should not split editing host in noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p contenteditable="true">ab</p>';
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.execCommand('InsertNewBlockBefore');
        TinyAssertions.assertContent(editor, initialContent);
      });
    });

    it('TINY-10022: should not insert new block in in noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p>ab</p>';
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.execCommand('InsertNewBlockBefore');
        TinyAssertions.assertContent(editor, initialContent);
      });
    });
  });

  context('InsertNewBlockAfter command', () => {
    it('TINY-10022: empty editor', () => {
      const editor = hook.editor();
      editor.resetContent();
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><p>X</p>');
    });

    it('TINY-10022: should insert empty block after paragrpaph with text', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>X</p>');
    });

    it('TINY-10022: should insert empty block after paragraph with inline elements', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>AAA</em></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p><em>AAA</em></p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p><em>AAA</em></p><p>X</p>');
    });

    it('TINY-10022: should insert empty block after blockquote', () => {
      const editor = hook.editor();
      editor.setContent('<blockquote><p>AAA</p></blockquote>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>X</p>');
    });

    it('TINY-10022: should insert new empty block between two paragraphs', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p><p>BBB</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>&nbsp;</p><p>BBB</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>X</p><p>BBB</p>');
    });

    it('TINY-10022: should insert new empty block between two blockquotes', () => {
      const editor = hook.editor();
      editor.setContent('<blockquote><p>AAA</p></blockquote><blockquote><p>BBB</p></blockquote>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>&nbsp;</p><blockquote><p>BBB</p></blockquote>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<blockquote><p>AAA</p></blockquote><p>X</p><blockquote><p>BBB</p></blockquote>');
    });

    it('TINY-10022: insert new empty block within CET root', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="true"><p>AAA</p><p>BBB</p></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<div contenteditable="true"><p>AAA</p><p>&nbsp;</p><p>BBB</p></div>');
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<div contenteditable="true"><p>AAA</p><p>X</p><p>BBB</p></div>');
    });

    it('TINY-10022: insert new empty block after end container of ranged selection', () => {
      const editor = hook.editor();
      editor.setContent('<p>AAA</p><p>BBB</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 1, 0 ], 2);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>BBB</p><p>&nbsp;</p>');
      TinyAssertions.assertCursor(editor, [ 2 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p>AAA</p><p>BBB</p><p>X</p>');
    });

    it('TINY-10022: insert new empty block after noneditable block', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">AAA</p><p>BBB</p>');
      TinySelections.select(editor, '[contenteditable]', []);
      editor.execCommand('InsertNewBlockAfter');
      TinyAssertions.assertContent(editor, '<p contenteditable="false">AAA</p><p>&nbsp;</p><p>BBB</p>');
      TinyAssertions.assertCursor(editor, [ 1 ], 0);
      editor.insertContent('X');
      TinyAssertions.assertContent(editor, '<p contenteditable="false">AAA</p><p>X</p><p>BBB</p>');
    });

    it('TINY-10022: should not split editing host in noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p contenteditable="true">ab</p>';
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.execCommand('InsertNewBlockAfter');
        TinyAssertions.assertContent(editor, initialContent);
      });
    });

    it('TINY-10022: should not insert new block in in noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p>ab</p>';
        editor.setContent(initialContent);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        editor.execCommand('InsertNewBlockAfter');
        TinyAssertions.assertContent(editor, initialContent);
      });
    });
  });
});

