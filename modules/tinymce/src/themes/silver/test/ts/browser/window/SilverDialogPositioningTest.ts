import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogPositioningTest', () => {
  Arr.each([
    { label: 'Inline Mode', inline: true },
    { label: 'Iframe Mode', inline: false }
  ], (editorMode) => Arr.each([
    { label: 'Floating Mode', mode: 'floating' },
    { label: 'Sliding Mode', mode: 'sliding' },
    { label: 'Wrap Mode', mode: 'wrap' }
  ], (toolbarMode) => Arr.each([
    { label: 'Toolbar Top', location: 'top' },
    { label: 'Toolbar Bottom', location: 'bottom' }
  ], (toolbarLocation) => context(`${editorMode.label} ${toolbarMode.label} ${toolbarLocation.label}`, () => {
    const inlineHook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      inline: editorMode.inline,
      toolbar_mode: toolbarMode.mode,
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

    const openDialog = (editor: Editor, params: WindowParams) => DialogUtils.open(editor, dialogSpec, params);

    it(`TINY-9588: Inline 'toolbar' Dialog Positioning`, async () => {
      const editor = inlineHook.editor();

      const api = openDialog(editor, { inline: 'toolbar' });
      await TinyUiActions.pWaitForDialog(editor);
      debugger;
      api.close();
      await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]'));
    });
  }))));
});
