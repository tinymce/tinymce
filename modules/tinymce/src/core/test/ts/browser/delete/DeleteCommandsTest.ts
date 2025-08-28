import { context, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as DeleteCommands from 'tinymce/core/delete/DeleteCommands';

describe('browser.tinymce.core.delete.DeleteCommandsTest', () => {
  const caret = Cell<Text | null>(null);
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    extended_valid_elements: 'svg[*]'
  }, [], true);

  it('Delete should merge blocks', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1><p><span style="color: red;">b</span></p>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    DeleteCommands.deleteCommand(editor, caret);
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('ForwardDelete should merge blocks', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red;">a</span></p><h1>b</h1>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    DeleteCommands.forwardDeleteCommand(editor, caret);
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">a</span>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('TINY-9807: If placed between two images the first image should be deleted, not the second one', () => {
    const editor = hook.editor();
    editor.setContent('<p><img id="one" src="about:blank"><img id="two" src="about:blank"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    DeleteCommands.deleteCommand(editor, caret);
    TinyAssertions.assertContent(editor, '<p><img id="two" src="about:blank"></p>');
    TinyAssertions.assertCursor(editor, [ 0 ], 0);
  });

  context('noneditable', () => {
    it('TINY-9477: Delete on noneditable blocks should not do anything', () => {
      const editor = hook.editor();
      const initialContent = '<div contenteditable="false"><p>a</p><p>b</p></div>';
      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 1, 0 ], 1);
      DeleteCommands.deleteCommand(editor, caret);
      TinyAssertions.assertContent(editor, initialContent);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0 ], 1);
    });

    it('TINY-9477: ForwardDelete on noneditable blocks should not do anything', () => {
      const editor = hook.editor();
      const initialContent = '<div contenteditable="false"><p>a</p><p>b</p></div>';
      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 1, 0 ], 1);
      DeleteCommands.forwardDeleteCommand(editor, caret);
      TinyAssertions.assertContent(editor, initialContent);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0 ], 1);
    });

    it('TINY-9477: Delete on blocks in noneditable root should not do anything', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p>a</p><p>b</p>';
        editor.setContent(initialContent);
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
        DeleteCommands.deleteCommand(editor, caret);
        TinyAssertions.assertContent(editor, initialContent);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
      });
    });

    it('TINY-9477: ForwardDelete on blocks in noneditable root should not do anything', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initialContent = '<p>a</p><p>b</p>';
        editor.setContent(initialContent);
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
        DeleteCommands.forwardDeleteCommand(editor, caret);
        TinyAssertions.assertContent(editor, initialContent);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
      });
    });

    it('TINY-10346: Delete on noneditable svg element', () => {
      const editor = hook.editor();
      const initialContent = '<svg width="200" height="100"><text x="20" y="60" font-family="Arial" font-size="24" fill="blue">text</text></svg>';

      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      DeleteCommands.deleteCommand(editor, caret);
      TinyAssertions.assertContent(editor, initialContent);
    });

    it('TINY-10346: ForwardDelete on noneditable svg element', () => {
      const editor = hook.editor();
      const initialContent = '<svg width="200" height="100"><text x="20" y="60" font-family="Arial" font-size="24" fill="blue">text</text></svg>';

      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      DeleteCommands.forwardDeleteCommand(editor, caret);
      TinyAssertions.assertContent(editor, initialContent);
    });
  });
});
