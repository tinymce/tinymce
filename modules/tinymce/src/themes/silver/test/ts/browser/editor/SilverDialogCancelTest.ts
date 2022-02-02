import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.SilverDialogCancelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.windowManager.open({
          title: 'test',
          body: {
            type: 'panel',
            items: []
          },
          buttons: [
            {
              type: 'cancel',
              name: 'cancel',
              text: 'Cancel'
            }
          ]
        });
      });
    }
  }, [ Theme ]);

  it('Dialog closes without error using cancel button', async () => {
    const editor = hook.editor();
    await TinyUiActions.pWaitForDialog(editor, 'div[role="dialog"].tox-dialog');
    TinyUiActions.cancelDialog(editor);
  });
});
