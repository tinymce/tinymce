import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

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
});
