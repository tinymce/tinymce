import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  const SelectAll = (editor: Editor) => {
    const platform = PlatformDetection.detect().os.current;
    if (platform === 'macOS') {
      TinyContentActions.keystroke(editor, 'A'.charCodeAt(0), { meta: true });
    } else {
      TinyContentActions.keystroke(editor, 'A'.charCodeAt(0), { ctrl: true });
    }
  };
  const Undo = (editor: Editor) => {
    const platform = PlatformDetection.detect().os.current;
    if (platform === 'macOS') {
      TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), { meta: true });
    } else {
      TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), { ctrl: true });
    }
  };
  const Redo = (editor: Editor) => {
    const platform = PlatformDetection.detect().os.current;
    if (platform === 'macOS') {
      TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), { meta: true });
    } else {
      TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), { ctrl: true });
    }
  };
  it('TINY-2884: shoud undo and redo action', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    SelectAll(editor);
    editor.execCommand('Delete');
    Undo(editor);
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    Redo(editor);
    TinyAssertions.assertContent(editor, '');
  });
});
