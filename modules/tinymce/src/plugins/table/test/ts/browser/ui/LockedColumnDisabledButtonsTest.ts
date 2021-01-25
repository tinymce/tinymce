import { GeneralSteps, Log, Pipeline, Keyboard, Keys, Chain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

interface ButtonDetails {
  readonly name: string;
  readonly label: string;
}

enum TableContextMenu {
  Cell,
  Row,
  Column
}

UnitTest.asynctest('browser.tinymce.plugins.table.LockedColumnDisabledButtonsTest', (success, failure) => {
  Theme();
  Plugin();

  const tableButtons: ButtonDetails[] = [
    { name: 'table', label: 'Table' }
  ];

  const colBeforeButtons: ButtonDetails[] = [
    { name: 'tableinsertcolbefore', label: 'Insert column before' },
    { name: 'tablepastecolbefore', label: 'Paste column before' },
  ];

  const colAfterButtons: ButtonDetails[] = [
    { name: 'tableinsertcolafter', label: 'Insert column after' },
    { name: 'tablepastecolafter', label: 'Paste column after' }
  ];

  const colRemoveButtons: ButtonDetails[] = [
    { name: 'tabledeletecol', label: 'Delete column' },
    { name: 'tablecutcol', label: 'Cut column' },
  ];

  const colCopyButton: ButtonDetails[] = [
    { name: 'tablecopycol', label: 'Copy column' }
  ];

  const columnButtons: ButtonDetails[] = [
    ...colBeforeButtons,
    ...colAfterButtons,
    ...colRemoveButtons,
    ...colCopyButton
  ];

  const rowButtons: ButtonDetails[] = [
    { name: 'tableinsertrowbefore', label: 'Insert row before' },
    { name: 'tableinsertrowafter', label: 'Insert row after' },
    { name: 'tabledeleterow', label: 'Delete row' },
    { name: 'tablecopyrow', label: 'Copy row' },
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

    const table = (lockedColumns: number[] = [ 0 ]) =>
      `<table data-snooker-locked-cols="${lockedColumns.join(',')}">` +
    '<tbody>' +
    '<tr>' +
    `<td>a</td>` +
    `<td>b</td>` +
    `<td>c</td>` +
    '</tr>' +
    '<tr>' +
    `<td>d</td>` +
    `<td>e</td>` +
    `<td>f</td>` +
    '</tr>' +
    '</tbody>' +
    '</table>';

    const multiCellSelectionTable = (lockedColumns: number[] = [ 0 ]) =>
      `<table data-snooker-locked-cols="${lockedColumns.join(',')}">` +
    '<tbody>' +
    '<tr>' +
    `<td data-mce-selected="1" data-mce-first-selected="1">a</td>` +
    `<td data-mce-selected="1">b</td>` +
    `<td data-mce-selected="1" data-mce-last-selected="1">c</td>` +
    '</tr>' +
    '<tr>' +
    `<td>d</td>` +
    `<td>e</td>` +
    `<td>f</td>` +
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
      Log.stepsAsStep('TINY-6765', 'ColBefore, ColRemove, ColCopy buttons should be disabled when locked column is selected and it is the first column in the table',
        Arr.bind([ table(), multiCellSelectionTable() ], (tableHtml) => {
          return [
            sPopulateTableClipboard('col'),
            tinyApis.sSetContent(tableHtml),
            tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
            sAssertToolbarButtons([ ...colBeforeButtons, ...colRemoveButtons, ...colCopyButton ], true),
            sSelectContextMenuItem(TableContextMenu.Column),
            sAssertMenuButtons([ ...colBeforeButtons, ...colRemoveButtons, ...colCopyButton ], true)
          ];
        })
      ),
      Log.stepsAsStep('TINY-6765', 'ColAfter, ColRemove, ColCopy buttons should be disabled when locked column is selected and it is the last column in the table',
        Arr.bind([ table, multiCellSelectionTable ], (tableHtml) => {
          return [
            sPopulateTableClipboard('col'),
            tinyApis.sSetContent(tableHtml([ 2 ])),
            tinyApis.sSetCursor([ 0, 0, 0, 2 ], 0),
            sAssertToolbarButtons([ ...colAfterButtons, ...colRemoveButtons, ...colCopyButton ], true),
            sSelectContextMenuItem(TableContextMenu.Column),
            sAssertMenuButtons([ ...colAfterButtons, ...colRemoveButtons, ...colCopyButton ], true)
          ];
        })
      ),
      Log.stepsAsStep('TINY-6765', ' ColRemove, ColCopy buttons should be disabled when locked column is selected',
        Arr.bind([ table(), multiCellSelectionTable() ], (tableHtml) => {
          return [
            sPopulateTableClipboard('col'),
            tinyApis.sSetContent(tableHtml),
            tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
            sAssertToolbarButtons([ ...colRemoveButtons, ...colCopyButton ], true),
            sSelectContextMenuItem(TableContextMenu.Column),
            sAssertMenuButtons([ ...colRemoveButtons, ...colCopyButton ], true)
          ];
        })
      ),
      Log.stepsAsStep('TINY-6765', 'ColBefore, ColAfter buttons should not be disabled when locked column is selected but is not the first or last column in the table', [
        sPopulateTableClipboard('col'),
        tinyApis.sSetContent(table()),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        sAssertToolbarButtons([ ...colBeforeButtons, ...colAfterButtons ], false),
        sSelectContextMenuItem(TableContextMenu.Column),
        sAssertMenuButtons([ ...colBeforeButtons, ...colAfterButtons ], false)
      ]),
      Log.stepsAsStep('TINY-6765', 'Column buttons should not be disabled when locked column is not selected', [
        sPopulateTableClipboard('col'),
        tinyApis.sSetContent(table()),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        sAssertToolbarButtons(columnButtons, false),
        sSelectContextMenuItem(TableContextMenu.Column),
        sAssertMenuButtons(columnButtons, false)
      ]),
      Log.stepsAsStep('TINY-6765', 'Row buttons should not be disabled when locked column is in the table', [
        sPopulateTableClipboard('row'),
        tinyApis.sSetContent(table()),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        sAssertToolbarButtons(rowButtons, false),
        sSelectContextMenuItem(TableContextMenu.Row),
        sAssertMenuButtons(rowButtons, false)
      ]),
      Log.stepsAsStep('TINY-6765', 'Cell buttons should be disabled when locked column is selected', [
        tinyApis.sSetContent(mergeCellTable),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        sAssertToolbarButtonState(cellButtons[0].label, true),
        sSelectContextMenuItem(TableContextMenu.Cell),
        sAssertMenuButtonState(cellButtons[0].label, true),
        tinyApis.sSetContent(splitCellTable),
        sAssertToolbarButtonState(cellButtons[1].label, true),
        sSelectContextMenuItem(TableContextMenu.Cell),
        sAssertMenuButtonState(cellButtons[1].label, true)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
