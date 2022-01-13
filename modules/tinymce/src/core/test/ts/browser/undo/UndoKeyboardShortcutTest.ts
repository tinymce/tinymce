import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions } from '@ephox/mcagar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('shoud undo and redo action', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Delete');
    TinyContentActions.keystroke(editor, 90, { meta: true });
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    TinyContentActions.keystroke(editor, 89, { meta: true });
    TinyAssertions.assertContent(editor, '');
  });
});
