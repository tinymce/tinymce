import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.ArrowKeysContentEndpointTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('Arrow keys in figcaption', () => {
    it('Arrow up from start of figcaption to paragraph before figure', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><figure><figcaption>a</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('Arrow down from end of figcaption to paragraph after figure', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContent(editor, '<figure><figcaption>a</figcaption></figure><p>&nbsp;</p>');
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Arrow up in middle of figcaption', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>ab</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><figure><figcaption>ab</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('Arrow down in middle of figcaption', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>ab</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContent(editor, '<figure><figcaption>ab</figcaption></figure><p>&nbsp;</p>');
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    });

    it('Arrow up at line 2 in figcaption should not insert new block', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a<br />b</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertContent(editor, '<figure><figcaption>a<br>b</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 2 ], 0, [ 0, 0, 2 ], 0);
    });

    it('Arrow down at line 1 in figcaption should not insert new block', () => {
      const editor = hook.editor();
      editor.setContent('<figure><figcaption>a<br />b</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContent(editor, '<figure><figcaption>a<br>b</figcaption></figure>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Arrow down at figcaption with forced_root_block_attrs set', () => {
      const editor = hook.editor();
      editor.options.set('forced_root_block_attrs', { class: 'x' });
      editor.setContent('<figure><figcaption>a</figcaption></figure>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertContent(editor, '<figure><figcaption>a</figcaption></figure><p class="x">&nbsp;</p>');
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      editor.options.unset('forced_root_block_attrs');
    });
  });
});
