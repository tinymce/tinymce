import { UiControls, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Dialog } from '@ephox/bridge';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Tools } from 'tinymce/core/api/PublicApi';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import { LinkDialogData } from 'tinymce/plugins/link/ui/DialogTypes';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.WindowManagerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('OpenWindow/CloseWindow events', () => {
    const editor = hook.editor();
    let openWindowArgs, closeWindowArgs;

    editor.on('CloseWindow', (e) => {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', (e) => {
      openWindowArgs = e;
      editor.windowManager.close();
    });

    editor.windowManager.open({
      title: 'Find and Replace',
      body: {
        type: 'panel',
        items: []
      },
      buttons: []
    });

    assert.equal(openWindowArgs.type, 'openwindow');
    assert.equal(closeWindowArgs.type, 'closewindow');

    editor.off('CloseWindow OpenWindow');
  });

  context('WindowManager dialog validation workaround', () => {
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
    }, [ Theme, LinkPlugin ]);

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
      UiFinder.exists(sugarBody, 'button[title="Save"]');
      UiFinder.notExists(sugarBody, 'button[title="Save"][disabled="disabled"]');

      // Button is disabled again when field is empty
      UiControls.setValue(input, '', 'input');
      UiFinder.exists(sugarBody, 'button[title="Save"][disabled="disabled"]');
    });
  });
});
