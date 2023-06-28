import { Cursors, Keys, Mouse, UiFinder } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

interface TestSpec {
  label: string;
  location: 'toolbar' | 'bottom';
}

describe('browser.tinymce.themes.silver.window.SilverInlineDialogPersistenceTest', () => {
  Arr.each([
    { label: 'Inline Mode', inline: true },
    { label: 'Iframe Mode', inline: false }
  ], (editorMode) => {
    Arr.each([
      { label: 'Inline dialog (bottom)', location: 'bottom' },
      { label: 'Inline dialog (toolbar)', location: 'toolbar' }
    ], (dialogLocation: TestSpec) => {
      Arr.each([
        { label: 'Persistent mode: true', persistent: true },
        { label: 'Persistent mode: false', persistent: false }
      ], (persistentMode) => {
        context(`${editorMode.label} ${dialogLocation.label} - ${persistentMode.label} `, () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            inline: editorMode.inline,
            toolbar: 'bold italic underline | forecolor backcolor outdent indent',
            setup: (ed: Editor) => {
              ed.ui.registry.addContextToolbar('test-context-toolbar', {
                predicate: (_) => true,
                items: 'bold',
                position: 'selection',
                scope: 'node'
              });
            }
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
                name: 'save',
                text: 'Save',
                primary: true
              },
              {
                type: 'cancel',
                name: 'cancel',
                text: 'Cancel',
              }
            ],
            onSubmit: (api) => api.close(),
          };

          const assertDialogVisibility = (isVisible: boolean) => {
            const existsFn = isVisible ? UiFinder.exists : UiFinder.notExists;
            existsFn(SugarBody.body(), '.tox-dialog-inline');
          };

          const closeMenu = (editor: Editor): void => {
            const uiRoot = TinyUiActions.getUiRoot(editor);
            TinyUiActions.keystroke(editor, Keys.escape());
            UiFinder.notExists(uiRoot, '[role=menu]');
          };

          beforeEach(() => {
            const editor = hook.editor();
            editor.setContent(Arr.range(50, (index) => index === 5 ? '<a href="google.com">Google</a>' : '<p>Some content...</p>').join('\n'));
          });

          it('TINY-9991: Inline toolbar dialog persistent - clicking on the editor container', async () => {
            const editor = hook.editor();
            const api = DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            await TinyUiActions.pWaitForDialog(editor);

            // Clicking on the editor container
            Mouse.trueClickOn(TinyDom.body(editor), 'p');
            assertDialogVisibility(persistentMode.persistent);
            api.close();
          });

          it('TINY-9991: Inline toolbar dialog persistent - clicking on dialogs buttons to close dialog', async () => {
            const editor = hook.editor();
            const api = DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            await TinyUiActions.pWaitForDialog(editor);
            Mouse.trueClickOn(TinyDom.body(editor), 'p');
            assertDialogVisibility(persistentMode.persistent);
            api.close();

            // Dialog should be closed when pressing escape
            DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            TinyUiActions.keystroke(editor, Keys.escape());
            assertDialogVisibility(false);

            // Dialog should be closed when clicking on cancel button
            DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            TinyUiActions.closeDialog(editor);
            assertDialogVisibility(false);

            // Dialog should be closed when submitting
            DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            TinyUiActions.submitDialog(editor);
            assertDialogVisibility(false);

            // Dialog should be closed when cancelling
            DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            TinyUiActions.cancelDialog(editor);
            assertDialogVisibility(false);
          });

          it('TINY-9991: Inline toolbar dialog persistent - clicking on menu bar', async () => {
            const editor = hook.editor();
            const api = DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            await TinyUiActions.pWaitForDialog(editor);
            Mouse.trueClickOn(TinyDom.container(editor), 'button:contains("File")');
            assertDialogVisibility(persistentMode.persistent);
            closeMenu(editor);
            api.close();
          });

          it('TINY-9991: Inline toolbar dialog persistent - clicking on toolbar', async () => {
            const editor = hook.editor();
            const api = DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            await TinyUiActions.pWaitForDialog(editor);
            Mouse.trueClickOn(TinyDom.container(editor), '.tox-tbtn[title="Bold"]');
            assertDialogVisibility(persistentMode.persistent);
            api.close();
          });

          it('TINY-9991: Inline toolbar dialog persistent - clicking on the editor content to show context toolbar', async () => {
            const editor = hook.editor();
            const api = DialogUtils.open(editor, dialogSpec, { inline: dialogLocation.location, persistent: persistentMode.persistent });
            await TinyUiActions.pWaitForDialog(editor);

            // Clicking on the editor container
            editor.focus();
            const elem = UiFinder.findIn(TinyDom.body(editor), 'a').getOrDie();
            const target = Cursors.follow(elem, [ 0 ]).getOrDie();
            editor.selection.select(target.dom);
            Mouse.click(target);

            await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Bold"]');
            assertDialogVisibility(persistentMode.persistent);
            api.close();
          });
        });
      });
    });
  });
});
