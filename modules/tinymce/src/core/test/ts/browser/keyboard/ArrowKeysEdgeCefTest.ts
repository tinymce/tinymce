import { Keys } from '@ephox/agar';
import { describe, it, context } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';

// these tests cover the cases with cef at the start/end of the editor content

describe('browser.tinymce.core.keyboard.ArrowKeysEdgeCefTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const assertStartContainer = (editor: Editor, f: (node: Node) => boolean) => {
    const startContainer = editor.selection.getRng().startContainer;
    assert.isTrue(f(startContainer), 'Check selection is in caret container');
  };
  context('Cmd+Shift+Up/Down should expand selection to the edge of the content', () => {
    it('TINY-7795: Cmd+Shift+Up when cef block at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
      // actual content: <p data-mce-caret="before"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinySelections.setCursor(editor, [ 2, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.up(), { metaKey: true, shiftKey: true });
      TinyAssertions.assertSelection(editor, [ ], 0, [ 1, 0 ], 2);
    });

    it('TINY-7795: Cmd+Shift+Down when cef block at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down(), { metaKey: true, shiftKey: true });
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ ], 2);
    });

    it('TINY-7795: Cmd+Shift+Up/Down when cef block at the start and at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');
      TinyContentActions.keystroke(editor, Keys.down(), { metaKey: true, shiftKey: true });
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ ], 4);

      TinySelections.setCursor(editor, [ ], 4);
      TinyContentActions.keystroke(editor, Keys.up(), { metaKey: true, shiftKey: true });
      // actual content:<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 3 ], 0);
    });
  });

  context('Left/Right arrow key should collapse selection', () => {
    it('TINY-7795: cef block at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.left());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
    });

    it('TINY-7795: cef block at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.right());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content: <p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 2 ], 0);
    });

    it('TINY-7795: cef block at the start and end ', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.left());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.right());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 3 ], 0);
    });
  });

  context('Up/Down arrow key should collapse and move selection', () => {
    it('TINY-7795: cef block at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.up());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
    });

    it('TINY-7795: cef block at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.down());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content: <p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after""><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 2 ], 0);
    });

    it('TINY-7795: cef block at the start and the end', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.up());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      editor.execCommand('SelectAll');
      TinyContentActions.keystroke(editor, Keys.down());
      assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
      // actual content:<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 3 ], 0);
    });
  });

});

