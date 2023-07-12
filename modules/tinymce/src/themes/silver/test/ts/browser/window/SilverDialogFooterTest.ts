import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, context, it, afterEach, beforeEach } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

type ButtonName = 'buttons-undefined' | 'buttons-empty' | 'buttons-nonempty';

describe('browser.tinymce.themes.silver.window.SilverDialogFooterTest', () => {
  const testDialogApi = Singleton.value<Dialog.DialogInstanceApi<{}>>();
  const addTestButtons = (editor: Editor, inline: boolean): void => {
    const addTestButton = (editor: Editor, inline: boolean, name: ButtonName, buttons?: Dialog.DialogFooterButtonSpec[]): void =>
      editor.ui.registry.addButton(name, {
        type: 'button',
        text: name,
        tooltip: name,
        onAction: () => {
          testDialogApi.set(editor.windowManager.open({
            title: 'Test',
            body: {
              type: 'panel',
              items: []
            },
            buttons
          }, inline ? { inline: 'bottom' } : {}));
        }
      });

    addTestButton(editor, inline, 'buttons-undefined');
    addTestButton(editor, inline, 'buttons-empty', []);
    addTestButton(editor, inline, 'buttons-nonempty', [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      }
    ]);
  };

  const makeHook = (inline: boolean) => TinyHooks.bddSetupLight<Editor>({
    toolbar: 'buttons-undefined buttons-empty buttons-nonempty',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => addTestButtons(editor, inline)
  });

  const testFooterPresence = async (editor: Editor, buttonName: ButtonName, hasFooter: boolean): Promise<void> => {
    TinyUiActions.clickOnToolbar(editor, `button[aria-label="${buttonName}"]`);
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Assertions.assertStructure(
      'Checking dialog structure to see if footer is rendered',
      ApproxStructure.build((s, _, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-dialog__header') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-dialog__content-js') ]
          }),
          ...hasFooter ? [ s.element('div', {
            classes: [ arr.has('tox-dialog__footer') ]
          }) ] : []
        ]
      })),
      dialog
    );
  };

  beforeEach(() => testDialogApi.clear());
  afterEach(() => testDialogApi.on((api) => api.close()));

  context('Modal dialogs', () => {
    const hook = makeHook(false);
    it('TINY-9996: Footer should not be rendered if buttons is undefined', () => testFooterPresence(hook.editor(), 'buttons-undefined', false));
    it('TINY-9996: Footer should not be rendered if buttons is empty array', () => testFooterPresence(hook.editor(), 'buttons-empty', false));
    it('TINY-9996: Footer should be rendered if buttons is non-empty array', () => testFooterPresence(hook.editor(), 'buttons-nonempty', true));
  });

  context('Inline dialogs', () => {
    const hook = makeHook(true);
    it('TINY-9996: Footer should not be rendered if buttons is undefined', () => testFooterPresence(hook.editor(), 'buttons-undefined', false));
    it('TINY-9996: Footer should not be rendered if buttons is empty array', () => testFooterPresence(hook.editor(), 'buttons-empty', false));
    it('TINY-9996: Footer should be rendered if buttons is non-empty array', () => testFooterPresence(hook.editor(), 'buttons-nonempty', true));
  });
});
