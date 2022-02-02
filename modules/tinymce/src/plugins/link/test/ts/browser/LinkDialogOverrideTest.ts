import { UiFinder, UiControls } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Dialog } from '@ephox/bridge';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/link/Plugin';
import { LinkDialogData } from 'tinymce/plugins/link/ui/DialogTypes';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.link.LinkDialogOverrideTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
    toolbar: 'link',
    setup: (editor: Editor) => {
      editor.on('PreInit', () => {
        const originalWindowManager = editor.windowManager;
        editor.windowManager = Tools.extend({}, originalWindowManager, {
          open: (spec: Dialog.DialogSpec<LinkDialogData>) => {
            if (spec.title === 'Insert/Edit Link') {
              const newSpec = Tools.extend({}, spec, {
                onChange: (api: Dialog.DialogInstanceApi<LinkDialogData>, details: Dialog.DialogChangeDetails<LinkDialogData>) => {
                  spec.onChange(api, details);
                  if (details.name === 'url' || details.name === 'link' || details.name === 'anchor') {
                    const data = api.getData();
                    if (data.url.value.length === 0) {
                      api.disable('save');
                    } else {
                      api.enable('save');
                    }
                  }
                }
              });
              const api = originalWindowManager.open(newSpec);
              if (spec.initialData.url.value.length === 0) {
                api.disable('save');
              }

              return api;
            } else {
              return originalWindowManager.open(spec);
            }
          }
        });
      });
    }
  }, [ Theme, Plugin ]);

  it('TINY-7738: Regression test for supported dialog validation workaround', async () => {
    const editor = hook.editor();
    const sugarBody = SugarBody.body();
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Insert/edit link"]');
    await TinyUiActions.pWaitForDialog(editor);

    // Assert save button disabled
    UiFinder.exists(sugarBody, 'button[title="Save"][disabled="disabled"]');
    const input = UiFinder.findIn(sugarBody, 'input[type="url"]').getOrDie();

    // Set value and fire 'input' event
    UiControls.setValue(input, 'https://www.google.com', 'input');

    // Button is now enabled
    UiFinder.exists(sugarBody, 'button[title="Save"]:not([disabled])');

    // Button is disabled again when field is empty
    UiControls.setValue(input, '', 'input');
    UiFinder.exists(sugarBody, 'button[title="Save"][disabled="disabled"]');
    TinyUiActions.closeDialog(editor);
  });
});
