import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.HomeEndKeysTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('Home key', () => {
    it('Home key should move caret before cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456</p>');
      TinySelections.setCursor(editor, [ 1, 1 ], 3);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('Home key should move caret from after cef to before cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('Home key should move caret to before cef from the start of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span>456<br>789</p>');
      TinySelections.setSelection(editor, [ 1, 1 ], 3, [ 1, 1 ], 3);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    it('Home key should not move caret before cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p><p><span contenteditable="false">CEF</span><br>456</p>');
      TinySelections.setCursor(editor, [ 1, 2 ], 3);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 1, 2 ], 3);
    });

    it('Home key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-8201: Home key should not move caret outside of closest editing host', () => {
      const editor = hook.editor();
      editor.setContent('<p>x</p><div contenteditable="false"><div contenteditable="true"><p>123</p></div></div>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 1, 0, 0, 0 ], 1);
    });

    it('TINY-8201: Home key should move caret to closest cef inside the closest editing host', () => {
      const editor = hook.editor();
      editor.setContent('<p>x</p><div contenteditable="false"><div contenteditable="true"><p><span contenteditable="false">CEF</span>123</p></div></div>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 1 ], 1);
      TinyContentActions.keystroke(editor, Keys.home());
      TinyAssertions.assertCursor(editor, [ 1, 0, 0, 0 ], 0);
    });

    context('Inline boundaries', () => {
      it('TINY-4612: move caret out and at the beginning of the element', () => {
        const editor = hook.editor();
        editor.setContent('<p><a href="google.com">link</a>test</p>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
        TinyContentActions.keystroke(editor, Keys.home());
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });

      it('TINY-4612: move caret at the beginning of the line (parent) if the first element is an inline element', () => {
        const editor = hook.editor();
        editor.setContent('<p><a href="google.com">link1</a>test</p>');
        TinySelections.setCursor(editor, [ 0, 1 ], 3);
        TinyContentActions.keystroke(editor, Keys.home());
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });
    });
  });

  context('End key', () => {
    it('End key should move caret after cef within the same block', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    });

    it('End key should move caret from before cef to after cef', () => {
      const editor = hook.editor();
      editor.setContent('<p><span contenteditable="false">CEF</span></p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    });

    it('End key should move caret to after cef from the end of range', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br>456<span contenteditable="false">CEF</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 0, 4 ], 1);
    });

    it('End key should not move caret after cef within the same block if there is a BR in between', () => {
      const editor = hook.editor();
      editor.setContent('<p>123<br><span contenteditable="false">CEF</span></p><p>456</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('End key should not move caret if there is no cef', () => {
      const editor = hook.editor();
      editor.setContent('<p>123</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-8201: End key should not move caret outside of closest editing host', () => {
      const editor = hook.editor();
      editor.setContent('<p>x</p><div contenteditable="false"><div contenteditable="true"><p>123</p></div></div>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 1, 0, 0, 0 ], 1);
    });

    it('TINY-8201: End key should move caret to closest cef inside the closest editing host', () => {
      const editor = hook.editor();
      editor.setContent('<p>x</p><div contenteditable="false"><div contenteditable="true"><p>123<span contenteditable="false">CEF</span></p></div></div>');
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.end());
      TinyAssertions.assertCursor(editor, [ 1, 0, 0, 2 ], 1);
    });

    context('Inline boundaries', () => {
      it('TINY-4612: move caret out and at end of the element', () => {
        const editor = hook.editor();
        editor.setContent('<p>test<a href="google.com">link</a></p>');
        TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
        TinyContentActions.keystroke(editor, Keys.end());
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
      });

      it('TINY-4612: move caret at the end of the line (parent) if the last element is an inline element', () => {
        const editor = hook.editor();
        editor.setContent('<p>test<a href="google.com">link 2</a></p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        TinyContentActions.keystroke(editor, Keys.end());
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
      });
    });
  });
});
