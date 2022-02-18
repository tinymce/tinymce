import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.window.SilverDialogBeforeEditorRenderedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  it('TINY-8397: Open dialog while the inline editor is hidden should not throw an exception', async () => {
    const editor = hook.editor();
    UiFinder.notExists(SugarBody.body(), '.tox-tinymce-aux');
    editor.windowManager.open({
      title: 'Test Dialog',
      body: {
        type: 'panel',
        items: []
      },
      buttons: []
    });
    await TinyUiActions.pWaitForDialog(editor, 'div[role="dialog"].tox-dialog');
    TinyUiActions.closeDialog(editor);
  });
});

