import { FocusTools, Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarDocument, SugarElement } from '@ephox/sugar';
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
  const pAssertFocusOnItem = (label: string, selectorOrElement: string | SugarElement<Node>) => {
    if (typeof selectorOrElement === 'string') {
      return FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selectorOrElement);
    }
    return FocusTools.pTryOn(`Focus should be on: ${label}`, selectorOrElement);
  };
  const findTargetByLabel = Fun.curry(UiFinder.findTargetByLabel, SugarDocument.getDocument());

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
    await pAssertFocusOnItem('Width', findTargetByLabel('Width').getOrDie());
    pressTabKey(editor);
    await pAssertFocusOnItem('Height', findTargetByLabel('Height').getOrDie());
    pressTabKey(editor);
    await pAssertFocusOnItem('Cell spacing', findTargetByLabel('Cell spacing').getOrDie());
    pressTabKey(editor);
    await pAssertFocusOnItem('Cell padding', findTargetByLabel('Cell padding').getOrDie());
    pressTabKey(editor);
    await pAssertFocusOnItem('Border width', findTargetByLabel('Border width').getOrDie());
    pressTabKey(editor);
    await pAssertFocusOnItem('Caption', 'input[type="checkbox"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('Alignment', findTargetByLabel('Alignment').getOrDie());
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
    await pAssertFocusOnItem('Border style', findTargetByLabel('Border style').getOrDie());
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
