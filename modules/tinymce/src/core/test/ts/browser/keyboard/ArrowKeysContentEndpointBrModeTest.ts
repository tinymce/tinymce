import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.keyboard.ArrowKeysContentEndpointBrModeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    forced_root_block: false,
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  context('Arrow keys in figcaption', () => {
    it('Arrow up from start of figcaption to paragraph before figure', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContent(editor, '<br /><figure><figcaption>a</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [], 0, [], 0);
    });

    it('Arrow down from end of figcaption to paragraph after figure', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertRawContent(editor, '<figure><figcaption>a</figcaption></figure><br>');
      TinyAssertions.assertSelection(editor, [], 1, [], 1);
    });

    it('Arrow up in middle of figcaption', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>ab</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertRawContent(editor, '<br><figure><figcaption>ab</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [], 0, [], 0);
    });

    it('Arrow down in middle of figcaption', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>ab</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertRawContent(editor, '<figure><figcaption>ab</figcaption></figure><br>');
      TinyAssertions.assertSelection(editor, [], 1, [], 1);
    });
  });
});
