import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions } from '@ephox/mcagar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('TINY-2884: shoud undo and redo action', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinyContentActions.keystroke(editor, 'A'.charCodeAt(0), { meta: true });
    editor.execCommand('Delete');
    TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), { meta: true });
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), { meta: true });
    TinyAssertions.assertContent(editor, '');
  });
});
