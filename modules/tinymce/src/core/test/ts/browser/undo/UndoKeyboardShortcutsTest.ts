import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const platform = PlatformDetection.detect();

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const selectAll = (editor: Editor) => {
    editor.execCommand('SelectAll');
  };

  const undoKeystroke = (editor: Editor) => {
    TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), platform.os.isMacOS() ? { metaKey: true } : { ctrl: true });
  };

  const redoKeystroke = (editor: Editor) => {
    TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), platform.os.isMacOS() ? { metaKey: true } : { ctrl: true });
  };

  const deleteCommand = (editor: Editor) => {
    editor.execCommand('Delete');
  };

  it('TINY-2884: should undo and redo action', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    selectAll(editor);
    deleteCommand(editor);
    TinyAssertions.assertContent(editor, '');
    undoKeystroke(editor);
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    redoKeystroke(editor);
    TinyAssertions.assertContent(editor, '');
  });

  const undoKeystrokeRealistic = (editor: Editor) => {
    const isMac = platform.os.isMacOS();
    const modKeyCode = isMac ? Keys.meta() : Keys.control();
    const modifier = isMac ? { metaKey: true } : { ctrl: true };

    TinyContentActions.keydown(editor, modKeyCode, modifier);
    TinyContentActions.keydown(editor, 'Z'.charCodeAt(0), modifier);
    TinyContentActions.keyup(editor, 'Z'.charCodeAt(0), modifier);
    TinyContentActions.keyup(editor, modKeyCode, {});
  };

  const simulateRealDeleteViaKeyboard = (editor: Editor) => {
    TinyContentActions.keydown(editor, Keys.delete());
    // The browser would now delete "bc" itself. Reproduce that DOM mutation:
    (editor.getBody().firstChild as HTMLElement).textContent = 'a';
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyContentActions.keyup(editor, Keys.delete());
  };

  it('TINY-14255: undo shortcut should have the same selection has the undo button after a partial delection', () => {
    const editor = hook.editor();
    editor.resetContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    simulateRealDeleteViaKeyboard(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    undoKeystrokeRealistic(editor);
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.resetContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    simulateRealDeleteViaKeyboard(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);
  });

  const simulateRealBackspaceViaKeyboardWithCtrl = (editor: Editor) => {
    const isMac = platform.os.isMacOS();
    const modKeyCode = isMac ? Keys.meta() : Keys.control();
    const modifier = isMac ? { meta: true, metaKey: true } : { ctrl: true, ctrlKey: true };
    TinyContentActions.keydown(editor, Keys.backspace(), modifier);
    // The browser would now delete "def" itself. Reproduce that DOM mutation:
    (editor.getBody().firstChild as HTMLElement).textContent = 'abc ';
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc '.length);
    TinyContentActions.keyup(editor, Keys.backspace(), modifier);
    TinyContentActions.keyup(editor, modKeyCode, {});
  };

  const simulateRealDeleteViaKeyboardWithCtrl = (editor: Editor) => {
    const isMac = platform.os.isMacOS();
    const modKeyCode = isMac ? Keys.meta() : Keys.control();
    const modifier = isMac ? { meta: true, metaKey: true } : { ctrl: true, ctrlKey: true };
    TinyContentActions.keydown(editor, Keys.delete(), modifier);
    // The browser would now delete "def" itself. Reproduce that DOM mutation:
    (editor.getBody().firstChild as HTMLElement).textContent = 'abc ';
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc '.length);
    TinyContentActions.keyup(editor, Keys.delete(), modifier);
    TinyContentActions.keyup(editor, modKeyCode, {});
  };

  // this is refered to the case in `TINY-8910`
  it('TINY-14255: undo after ctrl+backspace/delete should put the caret in the correct position', async () => {
    // backspace
    const editor = hook.editor();
    editor.resetContent('<p>abc 001</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc 001'.length);
    simulateRealBackspaceViaKeyboardWithCtrl(editor);
    TinyAssertions.assertContent(editor, 'abc ', { format: 'text' });
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>abc 001</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'abc 001'.length);

    editor.resetContent('<p>abc 002</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc 002'.length);
    simulateRealBackspaceViaKeyboardWithCtrl(editor);
    TinyAssertions.assertContent(editor, 'abc ', { format: 'text' });
    undoKeystrokeRealistic(editor);
    TinyAssertions.assertContent(editor, '<p>abc 002</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'abc 002'.length);

    // delete
    editor.resetContent('<p>abc 003</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc '.length);
    simulateRealDeleteViaKeyboardWithCtrl(editor);
    TinyAssertions.assertContent(editor, 'abc ', { format: 'text' });
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>abc 003</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'abc '.length);

    editor.resetContent('<p>abc 004</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abc '.length);
    simulateRealDeleteViaKeyboardWithCtrl(editor);
    TinyAssertions.assertContent(editor, 'abc ', { format: 'text' });
    undoKeystrokeRealistic(editor);
    TinyAssertions.assertContent(editor, '<p>abc 004</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'abc '.length);
  });
});
