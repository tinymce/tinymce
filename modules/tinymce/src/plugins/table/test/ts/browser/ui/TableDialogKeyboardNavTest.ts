import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.TableDialogKeyboardNavTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    toolbar: 'tableprops',
    base_url: '/project/tinymce/js/tinymce',
    table_advtab: true
  }, [ Plugin ]);

  // Table html structure
  const htmlEmptyTable = '<table><tr><td>X</td></tr></table>';

  // Tab key press
  const pressTabKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.tab());

  // Assert focus is on the expected form element
  const pAssertFocusOnItem = (label: string, selector: string) => FocusTools.pTryOnSelector(
    `Focus should be on: ${label}`,
    SugarDocument.getDocument(),
    selector
  );

  const pAssertFocusOnItemByLabel = (label: string) => FocusTools.pTryOnByLabel(
    `Focus should be on input with label: ${label}`,
    SugarDocument.getDocument(),
    label
  );

  it('TBA: Open dialog, test the tab key navigation cycles through all focusable fields in General and Advanced tabs', async () => {
    const editor = hook.editor();
    // Create table and set focus
    editor.setContent(htmlEmptyTable);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    // Open table dialog
    editor.execCommand('mceTableProps');

    // Keyboard nav within the General tab
    await pAssertFocusOnItem('General Tab', '.tox-dialog__body-nav-item:contains("General")');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Width');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Height');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Cell spacing');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Cell padding');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Border width');
    pressTabKey(editor);
    await pAssertFocusOnItem('Caption', 'input[type="checkbox"]');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Alignment');
    pressTabKey(editor);
    await pAssertFocusOnItem('Cancel', '.tox-button:contains("Cancel")');
    pressTabKey(editor);
    await pAssertFocusOnItem('Save', '.tox-button:contains("Save")');
    pressTabKey(editor);
    await pAssertFocusOnItem('x Close Button', '.tox-button[data-mce-name="close"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('General Tab', '.tox-dialog__body-nav-item:contains("General")');

    // Press arrow keys to nav between tabs
    TinyUiActions.keydown(editor, Keys.down());

    // Keyboard nav within the Advanced tab
    await pAssertFocusOnItem('Advanced Tab', '.tox-dialog__body-nav-item:contains("Advanced")');
    pressTabKey(editor);
    await pAssertFocusOnItemByLabel('Border style');
    pressTabKey(editor);
    await pAssertFocusOnItem('Border color', '.tox-form div:nth-child(2) input');
    pressTabKey(editor);
    await pAssertFocusOnItem('Border colorpicker', '.tox-form div:nth-child(2) span');
    pressTabKey(editor);
    await pAssertFocusOnItem('Background color', '.tox-form div:nth-child(3) input');
    pressTabKey(editor);
    await pAssertFocusOnItem('Background colorpicker', '.tox-form div:nth-child(3) span');
    pressTabKey(editor);
    await pAssertFocusOnItem('Cancel', '.tox-button:contains("Cancel")');
    pressTabKey(editor);
    await pAssertFocusOnItem('Save', '.tox-button:contains("Save")');
    pressTabKey(editor);
    await pAssertFocusOnItem('x Close Button', '.tox-button[data-mce-name="close"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('Advanced Tab', '.tox-dialog__body-nav-item:contains("Advanced")');
  });
});
