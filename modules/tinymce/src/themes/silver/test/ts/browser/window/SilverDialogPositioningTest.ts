import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
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
    { label: 'Floating Mode', mode: 'floating' },
    { label: 'Sliding Mode', mode: 'sliding' },
    { label: 'Wrap Mode', mode: 'wrap' }
  ], (toolbarMode) => Arr.each([
    { label: 'Location Top', location: 'top' },
    { label: 'Location Bottom', location: 'bottom' }
  ], (toolbarLocation) => context(`${editorMode.label} ${editorDirectionality.label} Toolbar ${toolbarMode.label} ${toolbarLocation.label}`, () => {
    const inlineHook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      inline: editorMode.inline,
      directionality: editorDirectionality.directionality,
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

    const getComponent = (selector: string) => {
      const component = UiFinder.findIn(SugarBody.body(), selector).getOrDie();
      return Traverse.parent(component).getOr(component) as SugarElement<HTMLElement>;
    };

    const assertWithinViewableArea = (dialog: SugarElement<HTMLElement>) => {
      const { left, right, top, bottom } = dialog.dom.getBoundingClientRect();
      if (left < 0 || right > window.innerWidth || top < 0 || bottom > window.innerHeight) {
        assert.fail('Dialog is outside of the viewable area');
      }
    };

    it(`TINY-9588: Inline toolbar Dialog Positioning`, async () => {
      const editor = inlineHook.editor();
      const api = openDialog(editor, { inline: 'toolbar' });
      await TinyUiActions.pWaitForDialog(editor);
      const dialog = getComponent('.tox-dialog-inline');
      assertWithinViewableArea(dialog);
      api.close();
      await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]'));
    });
  })))));
});
