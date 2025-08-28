import { Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.editor.SilverDialogButtonContextTest', () => {
  const assertButtonEnabled = (menuItemLabel: string) => UiFinder.notExists(SugarBody.body(), `[aria-label="${menuItemLabel}"][aria-disabled="true"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[aria-label="${selector}"][aria-disabled="true"]`);

  const assertButtonNativelyDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][disabled="disabled"]`);

  const assertButtonNativelyEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);

  const store = TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 't1 t2 t3 t4',
    setup: (ed: Editor) => {
      const getDialogSpec = (context?: string): Dialog.DialogSpec<{}> => {
        return {
          title: 'Test',
          body: {
            type: 'panel',
            items: [
              {
                type: 'htmlpanel',
                html: '<div><p>Test</p></div>'
              }
            ]
          },
          buttons: [
            {
              type: 'togglebutton',
              name: 'toggle-button',
              icon: 'toggle-button',
              text: 'toggle-button',
              align: 'start',
              context
            },
            {
              type: 'custom',
              name: 'custom-button',
              text: 'custom-button',
              icon: 'custom-button',
              align: 'start',
              context
            },
            {
              type: 'cancel',
              text: 'Cancel',
            },
            {
              type: 'submit',
              text: 'Submit',
              buttonType: 'primary',
              context
            }
          ],
          onSubmit: (api: Dialog.DialogInstanceApi<{}>) => {
            store.add('onSubmit');
            api.close();
          }
        };
      };

      ed.ui.registry.addButton('t1', {
        icon: 'italic',
        text: 'Test Menu Item 1',
        context: 'any',
        onAction: () => {
          ed.windowManager.open(getDialogSpec('mode:design'));
        }
      });

      ed.ui.registry.addButton('t2', {
        icon: 'italic',
        text: 'Test Menu Item 1',
        context: 'any',
        onAction: () => {
          ed.windowManager.open(getDialogSpec('any'));
        }
      });

      ed.ui.registry.addButton('t3', {
        icon: 'italic',
        text: 'Test Menu Item 1',
        context: 'any',
        onAction: () => {
          ed.windowManager.open(getDialogSpec());
        }
      });
    }
  }, [], true);

  afterEach(() => {
    hook.editor().mode.set('design');
    store.clear();
  });

  it('TINY-11211: Dialog footer buttons enabled in the correct context', async () => {
    const editor = hook.editor();

    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t1"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyEnabled('Submit');
    assertButtonNativelyEnabled('custom-button');
    assertButtonNativelyEnabled('toggle-button');
    TinyUiActions.closeDialog(editor);

    editor.mode.set('readonly');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t1"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyDisabled('Submit');
    assertButtonNativelyDisabled('custom-button');
    assertButtonNativelyDisabled('toggle-button');
    TinyUiActions.closeDialog(editor);

    editor.mode.set('design');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t3"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyEnabled('Submit');
    assertButtonNativelyEnabled('custom-button');
    assertButtonNativelyEnabled('toggle-button');
    TinyUiActions.closeDialog(editor);

    editor.mode.set('readonly');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t3"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyDisabled('Submit');
    assertButtonNativelyDisabled('custom-button');
    assertButtonNativelyDisabled('toggle-button');
    TinyUiActions.closeDialog(editor);

    editor.mode.set('design');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t2"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyEnabled('custom-button');
    assertButtonNativelyEnabled('toggle-button');
    TinyUiActions.closeDialog(editor);

    editor.mode.set('readonly');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="t2"]');
    await TinyUiActions.pWaitForDialog(editor);
    assertButtonNativelyEnabled('Cancel');
    assertButtonNativelyEnabled('Submit');
    assertButtonNativelyEnabled('custom-button');
    assertButtonNativelyEnabled('toggle-button');

    TinyUiActions.clickOnUi(editor, '[data-mce-name="Submit"]');
    store.assertEq('Clicking on submit should call onSubmit', [ 'onSubmit' ]);
  });

  it('TINY-11211: Alert dialog buttons should only be disabled in readonly mode', async () => {
    const editor = hook.editor();
    const callback = (state: boolean) => {
      state ? store.add('onYes') : store.add('onNo');
    };

    editor.mode.set('readonly');
    editor.windowManager.confirm('Test', callback);
    store.assertEq('Store should still be empty', []);
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="Yes"');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    store.assertEq('Clicking on yes should call the callback fn', [ 'onYes' ]);

    editor.windowManager.confirm('Test', callback);
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="No"');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    store.assertEq('Clicking on no should call the callback fn', [ 'onYes', 'onNo' ]);
  });

  it('TINY-11211: Confirm dialog buttons should only be disabled in readonly mode', async () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    const callback = () => store.add('OK');
    editor.windowManager.alert('Test', callback);
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="OK"');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    store.assertEq('Clicking on ok should call the callback fn', [ 'OK' ]);
  });

  it('TINY-11211: Dialog panel button should be enabled when not in readonly mode, clicking button should be possible', async () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    editor.windowManager.open(
      {
        title: 'Test',
        body: {
          type: 'panel',
          items: [
            {
              type: 'button',
              name: 'prev',
              text: 'Previous',
              icon: 'action-prev',
              borderless: true,
              context: 'any'
            },
            {
              type: 'button',
              name: 'next',
              text: 'Next',
              icon: 'action-next',
              borderless: true,
              context: 'any'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Cancel',
          },
          {
            type: 'submit',
            text: 'Submit',
            buttonType: 'primary',
          }
        ],
        onSubmit: (api: Dialog.DialogInstanceApi<{}>) => {
          store.add('onSubmit');
          api.close();
        },
        onAction: (_, details) => {
          store.add(details.name);
        }
      }
    );
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="Next"]');
    store.assertEq('Clicking on next should call onAction', [ 'next' ]);
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="Previous"]');
    store.assertEq('Clicking on previous should call onAction', [ 'next', 'prev' ]);
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  });

  it('TINY-11211: Dialog button setEnabled should overwrite context state', async () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    editor.windowManager.open(
      {
        title: 'Test',
        body: {
          type: 'panel',
          items: [
            {
              type: 'button',
              name: 'prev',
              text: 'Previous',
              icon: 'action-prev',
              borderless: true,
              context: 'any',
              enabled: false
            },
            {
              type: 'button',
              name: 'next',
              text: 'Next',
              icon: 'action-next',
              borderless: true,
              context: 'any'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Cancel',
          },
          {
            type: 'submit',
            text: 'Submit',
            buttonType: 'primary',
          }
        ],
        onSubmit: (api: Dialog.DialogInstanceApi<{}>) => {
          store.add('onSubmit');
          api.close();
        },
        onAction: (api) => {
          api.setEnabled('prev', true);
        }
      }
    );
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="Next"]');
    assertButtonNativelyEnabled('Previous');
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  });

  it('TINY-11211: Dialog footer togglemenuitem context should reflect button state', async () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    editor.windowManager.open(
      {
        title: 'Test',
        body: {
          type: 'panel',
          items: []
        },
        buttons: [
          {
            type: 'menu',
            name: 'options',
            icon: 'preferences',
            tooltip: 'Preferences',
            align: 'start',
            items: [
              {
                type: 'togglemenuitem',
                name: 'matchcase',
                text: 'Match case',
                context: 'any'
              }, {
                type: 'togglemenuitem',
                name: 'wholewords',
                text: 'Find whole words only',
                context: 'mode:design',
              },
            ]
          },
        ],
        onSubmit: (api: Dialog.DialogInstanceApi<{}>) => {
          store.add('onSubmit');
          api.close();
        },
        onAction: (_, details) => {
          store.add(details.name);
        }
      }
    );
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="Preferences"]');
    await TinyUiActions.pWaitForPopup(editor, '.tox-menu');
    assertButtonEnabled('Match case');
    assertButtonDisabled('Find whole words only');
    Mouse.clickOn(SugarBody.body(), '[aria-label="Match case"]');
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    store.assertEq('Clicking on togglemenuitem should call onAction', [ 'matchcase' ]);
  });

  it('TINY-11211: Button next to urlinput in should be context:design and disabled when not in design mode', async () => {
    const editor = hook.editor();
    editor.options.set('file_picker_callback', Fun.noop);
    editor.windowManager.open({
      title: 'Dialog Test',
      body: {
        type: 'panel',
        items: [
          {
            name: 'url1',
            type: 'urlinput',
            filetype: 'file',
            label: 'Url'
          }
        ]
      },
      initialData: {
        url1: { value: '' }
      },
      buttons: [ ]
    });
    assertButtonNativelyEnabled('Url');

    editor.mode.set('readonly');
    assertButtonNativelyDisabled('Url');

    editor.options.unset('file_picker_callback');
    Mouse.clickOn(SugarBody.body(), '[data-mce-name="close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  });
});
