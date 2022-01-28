import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  const platform = PlatformDetection.detect();

  // idk why but it works, seperate test command for macOS, Firefox, and the rest
  const selectAll = (editor: Editor) => {
    editor.execCommand('SelectAll');
  };
  const Undo = (editor: Editor) => {
    TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), platform.os.isMacOS() ? { metaKey: true } : { ctrl: true });

  };
  const Redo = (editor: Editor) => {
    TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), platform.os.isMacOS() ? { metaKey: true } : { ctrl: true });

  };
  const Delete = (editor: Editor) => {
    editor.execCommand('Delete');
  };

  it('TINY-2884: shoud undo and redo action', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    selectAll(editor);
    Delete(editor);
    TinyAssertions.assertContent(editor, '');
    Undo(editor);
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    Redo(editor);
    TinyAssertions.assertContent(editor, '');
  });
});
