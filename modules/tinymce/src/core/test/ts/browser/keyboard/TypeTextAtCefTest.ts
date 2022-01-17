import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.TypeTextAtCef', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('Type text before cef inline element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span></p>');
    TinySelections.select(editor, 'p', [ 1 ]);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyContentActions.type(editor, 'bc');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
    TinyAssertions.assertContent(editor, '<p>bc<span contenteditable="false">a</span></p>');
  });

  it('Type after cef inline element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span></p>');
    TinySelections.select(editor, 'p', [ 1 ]);
    TinyContentActions.keystroke(editor, Keys.right());
    TinyContentActions.type(editor, 'bc');
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 3);
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">a</span>bc</p>');
  });

  it('Type between cef inline elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span>&nbsp;<span contenteditable="false">b</span></p>');
    TinySelections.select(editor, 'p', [ 3 ]);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyContentActions.keystroke(editor, Keys.left());
    TinyContentActions.type(editor, 'bc');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 3, [ 0, 1 ], 3);
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">a</span>bc&nbsp;<span contenteditable="false">b</span></p>');
  });
});
