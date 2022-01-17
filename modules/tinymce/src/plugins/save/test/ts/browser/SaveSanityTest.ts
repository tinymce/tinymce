import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/save/Plugin';

describe('browser.tinymce.plugins.save.SaveSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'save',
    toolbar: 'save',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  it('TBA: Assert Save button is disabled when editor is opened.', async () => {
    const editor = hook.editor();
    // button is disabled
    await TinyUiActions.pWaitForUi(editor, 'button.tox-tbtn--disabled[aria-label="Save"]');
  });

  it('TBA: Add content and assert Save button is enabled.', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    // button no longer disabled
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Save"]:not(.tox-tbtn--disabled)');
  });
});
