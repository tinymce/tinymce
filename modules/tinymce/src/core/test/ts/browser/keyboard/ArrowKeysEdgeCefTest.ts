import { Keys } from '@ephox/agar';
import { describe, it, context } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';

describe('browser.tinymce.core.keyboard.ArrowKeysEdgeCefTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const os = PlatformDetection.detect().os;

  const assertRangeInCaretContainerBlock = (editor: Editor) =>
    assert.isTrue(CaretContainer.isRangeInCaretContainerBlock(editor.selection.getRng()));

  const selectToBeginning = (editor: Editor) => {
    if (os.isMacOS()) {
      TinyContentActions.keystroke(editor, Keys.up(), { metaKey: true, shiftKey: true });
    } else {
      TinyContentActions.keystroke(editor, Keys.home(), { ctrlKey: true, shiftKey: true });
    }
  };

  const selectToEnd = (editor: Editor) => {
    if (os.isMacOS()) {
      TinyContentActions.keystroke(editor, Keys.down(), { metaKey: true, shiftKey: true });
    } else {
      TinyContentActions.keystroke(editor, Keys.end(), { ctrlKey: true, shiftKey: true });
    }
  };

  context('Cmd+Shift+Up/Down should expand selection to the edge of the content', () => {
    it('TINY-7795: Cmd+Shift+Up when a cef block is at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
      // actual content: <p data-mce-caret="before"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinySelections.setCursor(editor, [ 2, 0 ], 2);
      selectToBeginning(editor);
      TinyAssertions.assertSelection(editor, [ ], 0, [ 1, 0 ], 2);
    });

    it('TINY-7795: Cmd+Shift+Down when a cef block is at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ ], 2);
    });

    it('TINY-7795: Cmd+Shift+Up/Down when a cef block is at the start and at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');

      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      selectToEnd(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ ], 4);

      TinySelections.setCursor(editor, [ ], 4);
      selectToBeginning(editor);
      // actual content:<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 3 ], 0);
    });

    it('TINY-7795: Cmd+Shift+Up when a cef block is at the start and content is wrapped in div', () => {
      const editor = hook.editor();
      editor.setContent('<div><p contenteditable="false">CEF</p><p>abc</p></div>');
      // actual content: <div><p data-mce-caret="before"></p><p contenteditable="false">CEF</p><p>abc</p></div>
      TinySelections.setCursor(editor, [ 0, 2, 0 ], 2);
      selectToBeginning(editor);
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0, 1, 0 ], 2);
    });

    it('TINY-7795: Cmd+Shift+Down when a cef block is at the end and content is wrapped in div', () => {
      const editor = hook.editor();
      editor.setContent('<div><p>abc</p><p contenteditable="false">CEF</p></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0 ], 2);
    });

    it('TINY-7795: Cmd+Shift+Up/Down when a cef block is at the start and at the end and content is wrapped in div', () => {
      const editor = hook.editor();
      editor.setContent('<div><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p></div>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      selectToEnd(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><div>
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0 ], 4);

      TinySelections.setCursor(editor, [ 0 ], 4);
      selectToBeginning(editor);
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p></div>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0, 3 ], 0);
    });
  });

  context('Left/Right arrow key should collapse selection', () => {
    it('TINY-7795: cef block at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');

      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinySelections.setCursor(editor, [ 2, 0 ], 2);

      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 1, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.right());
      // actual content: <p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 2);

      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 1, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.left());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-7795: a cef block is at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');

      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ ], 2);

      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);

      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ ], 2);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 2 ], 0);
    });

    it('TINY-7795: a cef block is at the start and at the end ', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');

      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      selectToEnd(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ ], 4);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 3 ], 0);

      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 3 ], 0);

      TinyContentActions.keystroke(editor, Keys.left());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-7795: a cef block is at the start and content is wrapped in div', () => {
      const editor = hook.editor();
      editor.setContent('<div><p contenteditable="false">CEF</p><p>abc</p></div>');

      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p></div>
      TinySelections.setCursor(editor, [ 0, 2, 0 ], 2);

      selectToBeginning(editor);
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p></div>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0, 1, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.right());
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p></div>
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 2);

      selectToBeginning(editor);
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p></div>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0, 1, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.left());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p></div>
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('TINY-7795: a cef block is at the end and content is wrapped in div ', () => {
      const editor = hook.editor();
      editor.setContent('<div><p>abc</p><p contenteditable="false">CEF</p></div>');

      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.left());
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);

      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p></div>
      TinyAssertions.assertCursor(editor, [ 0, 2 ], 0);
    });

    it('TINY-7795: a cef block is at the start and at the end and content is wrapped in div ', () => {
      const editor = hook.editor();
      editor.setContent('<div><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p></div>');

      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p></div>
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);

      selectToEnd(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p></div>
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0 ], 4);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p></div>
      TinyAssertions.assertCursor(editor, [ 0, 3 ], 0);

      selectToBeginning(editor);
      // actual content: <div><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p></div>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0, 3 ], 0);

      TinyContentActions.keystroke(editor, Keys.left());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <div><p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p></div>
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });
  });

  context('Up/Down arrow key should collapse the selection and move the caret above/below', () => {
    it('TINY-7795: a cef block is at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p>def</p>');
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p>def</p>

      TinySelections.setCursor(editor, [ 2, 0 ], 2);
      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p>def</p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 1, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.down());
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p>def</p>
      TinyAssertions.assertCursor(editor, [ 2, 0 ], 2);

      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p>def</p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 2, 0 ], 2);

      TinyContentActions.keystroke(editor, Keys.up());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p>def</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-7795: a cef block is at the end', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p>def</p><p contenteditable="false">CEF</p>');

      TinySelections.setCursor(editor, [ 1, 0 ], 2);
      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 2, [ ], 3);

      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);

      selectToEnd(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ ], 3);

      TinyContentActions.keystroke(editor, Keys.down());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p>abc</p><p>def</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 3 ], 0);
    });

    it('TINY-7795: a cef block is at the start and the end', () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>');

      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      selectToEnd(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ ], 4);

      TinyContentActions.keystroke(editor, Keys.down());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertCursor(editor, [ 3 ], 0);

      selectToBeginning(editor);
      // actual content: <p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p><p data-mce-caret="after"><br data-mce-bogus="1"></p>
      TinyAssertions.assertSelection(editor, [ ], 0, [ 3 ], 0);

      TinyContentActions.keystroke(editor, Keys.up());
      assertRangeInCaretContainerBlock(editor);
      // actual content: <p data-mce-caret="before"><br data-mce-bogus="1"></p><p contenteditable="false">CEF</p><p>abc</p><p contenteditable="false">CEF</p>
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });
  });
});

