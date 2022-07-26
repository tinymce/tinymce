import { UiFinder, UiControls } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Dialog } from '@ephox/bridge';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/link/Plugin';
import { LinkDialogData } from 'tinymce/plugins/link/ui/DialogTypes';

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
                  spec.onChange?.(api, details);
                  if (details.name === 'url' || details.name === 'link' || details.name === 'anchor') {
                    const data = api.getData();
                    api.setEnabled('save', data.url.value.length > 0);
                  }
                }
              });
              const api = originalWindowManager.open(newSpec);
              const urlValue = spec.initialData?.url?.value ?? '';
              if (urlValue.length === 0) {
                api.setEnabled('save', false);
              }

              return api;
            } else {
              return originalWindowManager.open(spec);
            }
          }
        });
      });
    }
  }, [ Plugin ]);

  it('TINY-7738: Regression test for supported dialog validation workaround', async () => {
    const editor = hook.editor();
    const sugarBody = SugarBody.body();
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Insert/edit link"]');
    await TinyUiActions.pWaitForDialog(editor);

    // Assert save button disabled
    UiFinder.exists(sugarBody, 'button[title="Save"][disabled="disabled"]');
    const input = UiFinder.findIn<HTMLInputElement>(sugarBody, 'input[type="url"]').getOrDie();

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
