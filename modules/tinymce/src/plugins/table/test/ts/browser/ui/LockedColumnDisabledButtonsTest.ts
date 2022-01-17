import { Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

interface ButtonDetails {
  readonly name: string;
  readonly label: string;
}

enum TableContextMenu {
  Cell,
  Row,
  Column
}

describe('browser.tinymce.plugins.table.LockedColumnDisabledButtonsTest', () => {
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

  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

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

  const pAssertToolbarButtonState = (editor: Editor, selector: string, disabled: boolean) =>
    TinyUiActions.pWaitForUi(editor, `button[aria-label="${selector}"][aria-disabled="${disabled}"]`);

  const pAssertMenuButtonState = (editor: Editor, selector: string, disabled: boolean) =>
    TinyUiActions.pWaitForUi(editor, `div.tox-collection__item[title="${selector}"][aria-disabled="${disabled}"]`);

  const pAssertToolbarButtons = async (editor: Editor, buttons: ButtonDetails[], expectedDisabledState: boolean) => {
    for (const button of buttons) {
      await pAssertToolbarButtonState(editor, button.label, expectedDisabledState);
    }
  };

  const pAssertMenuButtons = async (editor: Editor, buttons: ButtonDetails[], expectedDisabledState: boolean) => {
    for (const button of buttons) {
      await pAssertMenuButtonState(editor, button.label, expectedDisabledState);
    }
  };

  const populateTableClipboard = (editor: Editor, rowOrCol: 'row' | 'col') => {
    editor.setContent(`<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>`);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    editor.execCommand(rowOrCol === 'col' ? 'mceTableCopyCol' : 'mceTableCopyRow');
    editor.setContent('');
  };

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
    await Waiter.pWait(0);
  };

  const pSelectContextMenuItem = async (editor: Editor, index: number) => {
    await pOpenContextMenu(editor, 'td');
    Arr.range(index, () => TinyUiActions.keydown(editor, Keys.down()));
    TinyUiActions.keydown(editor, Keys.right());
  };

  it('TINY-6765: ColBefore, ColRemove, ColCopy buttons should be disabled when locked column is selected and it is the first column in the table', async () => {
    const editor = hook.editor();
    for (const tableHtml of [ table, multiCellSelectionTable ]) {
      populateTableClipboard(editor, 'col');
      editor.setContent(tableHtml());
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      await pAssertToolbarButtons(editor, [ ...colBeforeButtons, ...colRemoveButtons, ...colCopyButton ], true);
      await pSelectContextMenuItem(editor, TableContextMenu.Column);
      await pAssertMenuButtons(editor, [ ...colBeforeButtons, ...colRemoveButtons, ...colCopyButton ], true);
    }
  });

  it('TINY-6765: ColAfter, ColRemove, ColCopy buttons should be disabled when locked column is selected and it is the last column in the table', async () => {
    const editor = hook.editor();
    for (const tableHtml of [ table, multiCellSelectionTable ]) {
      populateTableClipboard(editor, 'col');
      editor.setContent(tableHtml([ 2 ]));
      TinySelections.setCursor(editor, [ 0, 0, 0, 2 ], 0);
      await pAssertToolbarButtons(editor, [ ...colAfterButtons, ...colRemoveButtons, ...colCopyButton ], true);
      await pSelectContextMenuItem(editor, TableContextMenu.Column);
      await pAssertMenuButtons(editor, [ ...colAfterButtons, ...colRemoveButtons, ...colCopyButton ], true);
    }
  });

  it('TINY-6765: ColRemove, ColCopy buttons should be disabled when locked column is selected', async () => {
    const editor = hook.editor();
    for (const tableHtml of [ table, multiCellSelectionTable ]) {
      populateTableClipboard(editor, 'col');
      editor.setContent(tableHtml());
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      await pAssertToolbarButtons(editor, [ ...colRemoveButtons, ...colCopyButton ], true);
      await pSelectContextMenuItem(editor, TableContextMenu.Column);
      await pAssertMenuButtons(editor, [ ...colRemoveButtons, ...colCopyButton ], true);
    }
  });

  it('TINY-6765: ColBefore, ColAfter buttons should not be disabled when locked column is selected but is not the first or last column in the table', async () => {
    const editor = hook.editor();
    populateTableClipboard(editor, 'col');
    editor.setContent(table());
    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
    await pAssertToolbarButtons(editor, [ ...colBeforeButtons, ...colAfterButtons ], false);
    await pSelectContextMenuItem(editor, TableContextMenu.Column);
    await pAssertMenuButtons(editor, [ ...colBeforeButtons, ...colAfterButtons ], false);
  });

  it('TINY-6765: Column buttons should not be disabled when locked column is not selected', async () => {
    const editor = hook.editor();
    populateTableClipboard(editor, 'col');
    editor.setContent(table());
    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
    await pAssertToolbarButtons(editor, columnButtons, false);
    await pSelectContextMenuItem(editor, TableContextMenu.Column);
    await pAssertMenuButtons(editor, columnButtons, false);
  });

  it('TINY-6765: Row buttons should not be disabled when locked column is in the table', async () => {
    const editor = hook.editor();
    populateTableClipboard(editor, 'row');
    editor.setContent(table());
    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
    await pAssertToolbarButtons(editor, rowButtons, false);
    await pSelectContextMenuItem(editor, TableContextMenu.Row);
    await pAssertMenuButtons(editor, rowButtons, false);
  });

  it('TINY-6765: Cell buttons should be disabled when locked column is selected', async () => {
    const editor = hook.editor();
    editor.setContent(mergeCellTable);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    await pAssertToolbarButtonState(editor, cellButtons[0].label, true);
    await pSelectContextMenuItem(editor, TableContextMenu.Cell);
    await pAssertMenuButtonState(editor, cellButtons[0].label, true);
    editor.setContent(splitCellTable);
    await pAssertToolbarButtonState(editor, cellButtons[1].label, true);
    await pSelectContextMenuItem(editor, TableContextMenu.Cell);
    await pAssertMenuButtonState(editor, cellButtons[1].label, true);
  });
});
