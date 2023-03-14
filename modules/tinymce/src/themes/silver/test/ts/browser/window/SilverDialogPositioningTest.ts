import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogPositioningTest', () => {
  Arr.each([
    { label: 'Inline Mode', inline: true },
    { label: 'Iframe Mode', inline: false }
  ], (editorMode) => Arr.each([
    { label: 'LTR Direction', directionality: 'ltr' },
    { label: 'RTL Direction', directionality: 'rtl' },
  ], (editorDirectionality) => Arr.each([
    { label: 'Location Top', location: 'top' },
    { label: 'Location Bottom', location: 'bottom' }
  ], (toolbarLocation) => context(`${editorMode.label} ${editorDirectionality.label} Toolbar ${toolbarLocation.label}`, () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      inline: editorMode.inline,
      directionality: editorDirectionality.directionality,
      toolbar_location: toolbarLocation.location,
      toolbar: 'bold italic underline | forecolor backcolor outdent indent',
      menubar: false
    }, [], true);

    const dialogSpec: Dialog.DialogSpec<{}> = {
      title: 'inlinedialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'panel',
            items: [
              {
                type: 'htmlpanel',
                html: '<h1>Heading</h1><p>paragraph</p>',
                presets: 'presentation'
              }
            ]
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'ok',
          text: 'OK',
          primary: true
        }
      ],
      onSubmit: (api) => api.close(),
    };

    const pTestOpenDialogAssertPosition = async (params: WindowParams) => {
      const editor = hook.editor();
      const api = DialogUtils.open(editor, dialogSpec, params);
      await TinyUiActions.pWaitForDialog(editor);
      const dialog = UiFinder.findIn(SugarBody.body(), '.tox-dialog').getOrDie() as SugarElement<HTMLElement>;
      const { left, right, top, bottom } = dialog.dom.getBoundingClientRect();
      if (left < 0 || right > window.innerWidth || top < 0 || bottom > window.innerHeight) {
        assert.fail('Dialog is outside of the viewable area');
      }
      api.close();
      await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]'));
    };

    it('TINY-9588: Modal dialog positioning', async () =>
      await pTestOpenDialogAssertPosition({})
    );

    it('TINY-9588: Inline toolbar dialog positioning', async () =>
      await pTestOpenDialogAssertPosition({ inline: 'toolbar' })
    );
  }))));
});
