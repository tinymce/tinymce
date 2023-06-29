import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

type ButtonName = 'buttons-undefined' | 'buttons-empty' | 'buttons-nonempty';

describe('browser.tinymce.themes.silver.window.SilverDialogFooterTest', () => {
  let testDialogApi: Dialog.DialogInstanceApi<{}>;
  const addTestButton = (editor: Editor, name: ButtonName, buttons?: Dialog.DialogFooterButtonSpec[]): void =>
    editor.ui.registry.addButton(name, {
      type: 'button',
      text: name,
      tooltip: name,
      onAction: () => {
        testDialogApi = editor.windowManager.open({
          title: 'Test',
          body: {
            type: 'panel',
            items: []
          },
          buttons
        });
      }
    });

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'buttons-undefined buttons-empty buttons-nonempty',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      addTestButton(editor, 'buttons-undefined');
      addTestButton(editor, 'buttons-empty', []);
      addTestButton(editor, 'buttons-nonempty', [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ]);
    }
  });

  const testForFooterPresence = (buttonName: ButtonName, hasFooter: boolean) => async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, `button[aria-label="${buttonName}"]`);
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Assertions.assertStructure(
      'Checking dialog structure to see if footer is rendered',
      hasFooter
        ? ApproxStructure.build((s, _, arr) => s.element('div', {
          classes: [ arr.has('tox-dialog') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-dialog__header') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-dialog__content-js') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-dialog__footer') ]
            })
          ]
        }))
        : ApproxStructure.build((s, _, arr) => s.element('div', {
          classes: [ arr.has('tox-dialog') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-dialog__header') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-dialog__content-js') ]
            })
          ]
        })),
      dialog
    );
    testDialogApi.close();
  };

  it('TINY-9996: Footer should not be rendered if buttons is undefined', testForFooterPresence('buttons-undefined', false));
  it('TINY-9996: Footer should not be rendered if buttons is empty array', testForFooterPresence('buttons-empty', false));
  it('TINY-9996: Footer should be rendered if buttons is non-empty array', testForFooterPresence('buttons-nonempty', true));
});
