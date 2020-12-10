import { GeneralSteps, Log, Pipeline, Keyboard, Keys, Chain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

interface ButtonDetails {
  name: string;
  label: string;
}

UnitTest.asynctest('browser.tinymce.plugins.table.LockedColumnDisabledButtonsTest', (success, failure) => {
  Theme();
  Plugin();

  const tableButtons: ButtonDetails[] = [
    { name: 'table', label: 'Table' }
  ];

  const columnButtons: ButtonDetails[] = [
    { name: 'tableinsertcolbefore', label: 'Insert column before' },
    { name: 'tableinsertcolafter', label: 'Insert column after' },
    { name: 'tabledeletecol', label: 'Delete column' },
    { name: 'tablecopycol', label: 'Delete column' },
    { name: 'tablecutcol', label: 'Cut column' },
    { name: 'tablepastecolbefore', label: 'Paste column before' },
    { name: 'tablepastecolafter', label: 'Paste column after' },
  ];

  const rowButtons: ButtonDetails[] = [
    { name: 'tableinsertrowbefore', label: 'Insert row before' },
    { name: 'tableinsertrowafter', label: 'Insert row after' },
    { name: 'tabledeleterow', label: 'Delete row' },
    { name: 'tablecopyrow', label: 'Delete row' },
    { name: 'tablecutrow', label: 'Cut row' },
    { name: 'tablepasterowbefore', label: 'Paste row before' },
    { name: 'tablepasterowafter', label: 'Paste row after' },
  ];

  const cellButtons: ButtonDetails[] = [
    { name: 'tablemergecells', label: 'Merge cells' },
    { name: 'tablesplitcells', label: 'Split cell' },
  ];

  const toolbar = Arr.map([ ...tableButtons, ...columnButtons, ...rowButtons, ...cellButtons ], (buttonDetails) => buttonDetails.name).join(' ');

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const doc = SugarElement.fromDom(document);

    const table = '<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-locked-cols="0">' +
    '<tbody>' +
    '<tr>' +
    `<td style="width: 50%;">a</td>` +
    `<td style="width: 50%;">b</td>` +
    '</tr>' +
    '<tr>' +
    `<td style="width: 50%;">c</td>` +
    `<td style="width: 50%;">d</td>` +
    '</tr>' +
    '</tbody>' +
    '</table>';

    const mergeCellTable = `<table data-snooker-locked-cols="0">` +
    `<tbody>` +
    `<tr>` +
    `<td data-mce-selected="1" data-mce-first-selected="1">a</td>` +
    `<td data-mce-selected="1" data-mce-last-selected="1">b</td>` +
    `</tr>` +
    `</tbody></table>`;

    const splitCellTable = `<table data-snooker-locked-cols="0">` +
    `<tbody>` +
    `<tr>` +
    `<td colspan="2">a</td>` +
    `</tr>` +
    `</tbody>` +
    `</table>`;

    const sAssertToolbarButtonState = (selector: string, disabled: boolean) => tinyUi.sWaitForUi(`${selector} toolbar button should be ${disabled ? 'disabled' : 'enabled'}`, `button[aria-label="${selector}"][aria-disabled="${disabled}"]`);
    const sAssertMenuButtonState = (selector: string, disabled: boolean) => tinyUi.sWaitForUi(`${selector} menu button should be ${disabled ? 'disabled' : 'enabled'}`, `div.tox-collection__item[title="${selector}"][aria-disabled="${disabled}"]`);

    const sAssertToolbarButtons = (buttons: ButtonDetails[], expectedDisabledState: boolean) =>
      GeneralSteps.sequence(Arr.map(buttons, (button) => sAssertToolbarButtonState(button.label, expectedDisabledState)));

    const sAssertMenuButtons = (buttons: ButtonDetails[], expectedDisabledState: boolean) =>
      GeneralSteps.sequence(Arr.map(buttons, (button) => sAssertMenuButtonState(button.label, expectedDisabledState)));

    const sPopulateTableClipboard = (rowOrCol: 'row' | 'col') => GeneralSteps.sequence([
      tinyApis.sSetContent(`<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>`),
      tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
      tinyApis.sExecCommand(rowOrCol === 'col' ? 'mceTableCopyCol' : 'mceTableCopyRow'),
      tinyApis.sSetContent(''),
    ]);

    const sOpenContextMenu = (target: string) => Chain.asStep(editor, [
      tinyUi.cTriggerContextMenu('trigger context menu', target, '.tox-silver-sink [role="menuitem"]'),
      Chain.wait(0)
    ]);

    const sSelectContextMenuItem = (index: number) =>
      GeneralSteps.sequence([
        sOpenContextMenu('td'),
        GeneralSteps.sequence(GeneralSteps.repeat(index, Keyboard.sKeydown(doc, Keys.down(), { }))),
        Keyboard.sKeydown(doc, Keys.right(), {}),
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TINY-6765', 'Column buttons should be disabled when locked column is selected', [
        sPopulateTableClipboard('col'),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        sAssertToolbarButtons(columnButtons, true),
        sSelectContextMenuItem(2),
        sAssertMenuButtons(columnButtons, true)
      ]),
      Log.stepsAsStep('TINY-6765', 'Column buttons should not be disabled when locked column is not selected', [
        sPopulateTableClipboard('col'),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        sAssertToolbarButtons(columnButtons, false),
        sSelectContextMenuItem(2),
        sAssertMenuButtons(columnButtons, false)
      ]),
      Log.stepsAsStep('TINY-6765', 'Row buttons should not be disabled when locked column is in the table', [
        sPopulateTableClipboard('row'),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        sAssertToolbarButtons(rowButtons, false),
        sSelectContextMenuItem(1),
        sAssertMenuButtons(rowButtons, false)
      ]),
      Log.stepsAsStep('TINY-6765', 'Cell buttons should be disabled when locked column is selected', [
        tinyApis.sSetContent(mergeCellTable),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        sAssertToolbarButtonState(cellButtons[0].label, true),
        sSelectContextMenuItem(0),
        sAssertMenuButtonState(cellButtons[0].label, true),
        tinyApis.sSetContent(splitCellTable),
        sAssertToolbarButtonState(cellButtons[1].label, true),
        sSelectContextMenuItem(0),
        sAssertMenuButtonState(cellButtons[1].label, true)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
