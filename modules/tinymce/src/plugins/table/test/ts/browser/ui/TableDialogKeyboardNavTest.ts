import { FocusTools, Keyboard, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDialogKeyboardNavTest', (success, failure) => {

  Plugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = Element.fromDom(document);

    // Table html structure
    const htmlEmptyTable = '<table><tr><td>X</td></tr></table>';

    const sSetTable = tinyApis.sSetContent(htmlEmptyTable);
    const sSetCursor = tinyApis.sSetCursor([ 0, 0, 0 ], 0);
    // Tab key press
    const sPressTabKey = Keyboard.sKeydown(doc, Keys.tab(), { });

    // Assert focus is on the expected form element
    const sAssertFocusOnItem = (label, selector) => FocusTools.sTryOnSelector(
      `Focus should be on: ${label}`,
      doc,
      selector
    );

    Pipeline.async({}, Log.steps('TBA', 'Table: Open dialog, test the tab key navigation cycles through all focusable fields in General and Advanced tabs', [
      // Create table and set focus
      sSetTable,
      sSetCursor,

      // Open table dialog
      tinyApis.sExecCommand('mceTableProps'),

      // Keyboard nav within the General tab
      sAssertFocusOnItem('General Tab', '.tox-dialog__body-nav-item:contains("General")'),
      sPressTabKey,
      sAssertFocusOnItem('Width', 'label:contains("Width") + input'),
      sPressTabKey,
      sAssertFocusOnItem('Height', 'label:contains("Height") + input'),
      sPressTabKey,
      sAssertFocusOnItem('Cell spacing', 'label:contains("Cell spacing") + input'),
      sPressTabKey,
      sAssertFocusOnItem('Cell padding', 'label:contains("Cell padding") + input'),
      sPressTabKey,
      sAssertFocusOnItem('Border width', 'label:contains("Border width") + input'),
      sPressTabKey,
      sAssertFocusOnItem('Caption', 'input[type="checkbox"]'),
      sPressTabKey,
      sAssertFocusOnItem('Alignment', 'label:contains("Alignment") + .tox-selectfield select'),
      sPressTabKey,
      sAssertFocusOnItem('Cancel', '.tox-button:contains("Cancel")'),
      sPressTabKey,
      sAssertFocusOnItem('Save', '.tox-button:contains("Save")'),
      sPressTabKey,
      sAssertFocusOnItem('General Tab', '.tox-dialog__body-nav-item:contains("General")'),

      // Press arrow keys to nav between tabs
      Keyboard.sKeydown(doc, Keys.down(), { }),

      // Keyboard nav within the Advanced tab
      sAssertFocusOnItem('Advanced Tab', '.tox-dialog__body-nav-item:contains("Advanced")'),
      sPressTabKey,
      sAssertFocusOnItem('Border style', 'label:contains("Border style") + .tox-selectfield select'),
      sPressTabKey,
      sAssertFocusOnItem('Border color', '.tox-form div:nth-child(2) input'),
      sPressTabKey,
      sAssertFocusOnItem('Border colorpicker', '.tox-form div:nth-child(2) span'),
      sPressTabKey,
      sAssertFocusOnItem('Background color', '.tox-form div:nth-child(3) input'),
      sPressTabKey,
      sAssertFocusOnItem('Background colorpicker', '.tox-form div:nth-child(3) span'),
      sPressTabKey,
      sAssertFocusOnItem('Cancel', '.tox-button:contains("Cancel")'),
      sPressTabKey,
      sAssertFocusOnItem('Save', '.tox-button:contains("Save")'),
      sPressTabKey,
      sAssertFocusOnItem('Advanced Tab', '.tox-dialog__body-nav-item:contains("Advanced")')
    ]), onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar: 'tableprops',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    table_advtab: true
  }, success, failure);
});
