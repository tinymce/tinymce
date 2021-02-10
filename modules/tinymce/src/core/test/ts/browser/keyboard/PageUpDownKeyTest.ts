import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.HomeEndKeysTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  context('Page Up', () => {
    it('escape outside the node if is an inline element', () => {
      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 5);
      TinyContentActions.keystroke(editor, Keys.pageUp());
      TinyAssertions.assertCursor(editor, [ 0 ], 1);
    });
  });

  context('Page Down', () => {
    it('escape outside the node if is an inline element', () => {
      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 5);
      TinyContentActions.keystroke(editor, Keys.pageDown());
      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });
  });
});
