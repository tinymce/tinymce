/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { getCellClassList, getTableBorderStyles, getTableBorderWidths, getTableCellBackgroundColors, getTableCellBorderColors, getTableClassList, getToolbar } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, generateColorSelector, generateItemsCallback } from './UiUtils';

const addButtons = (editor: Editor, selectionTargets: SelectionTargets, clipboard: Clipboard) => {
  editor.ui.registry.addMenuButton('table', {
    tooltip: 'Table',
    icon: 'table',
    fetch: (callback) => callback('inserttable | cell row column | advtablesort | tableprops deletetable')
  });

  const cmd = (command) => () => editor.execCommand(command);

  editor.ui.registry.addButton('tableprops', {
    tooltip: 'Table properties',
    onAction: cmd('mceTableProps'),
    icon: 'table',
    onSetup: selectionTargets.onSetupTable
  });

  editor.ui.registry.addButton('tabledelete', {
    tooltip: 'Delete table',
    onAction: cmd('mceTableDelete'),
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable
  });

  editor.ui.registry.addButton('tablecellprops', {
    tooltip: 'Cell properties',
    onAction: cmd('mceTableCellProps'),
    icon: 'table-cell-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablemergecells', {
    tooltip: 'Merge cells',
    onAction: cmd('mceTableMergeCells'),
    icon: 'table-merge-cells',
    onSetup: selectionTargets.onSetupMergeable
  });

  editor.ui.registry.addButton('tablesplitcells', {
    tooltip: 'Split cell',
    onAction: cmd('mceTableSplitCells'),
    icon: 'table-split-cells',
    onSetup: selectionTargets.onSetupUnmergeable
  });

  editor.ui.registry.addButton('tableinsertrowbefore', {
    tooltip: 'Insert row before',
    onAction: cmd('mceTableInsertRowBefore'),
    icon: 'table-insert-row-above',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertrowafter', {
    tooltip: 'Insert row after',
    onAction: cmd('mceTableInsertRowAfter'),
    icon: 'table-insert-row-after',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tabledeleterow', {
    tooltip: 'Delete row',
    onAction: cmd('mceTableDeleteRow'),
    icon: 'table-delete-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablerowprops', {
    tooltip: 'Row properties',
    onAction: cmd('mceTableRowProps'),
    icon: 'table-row-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertcolbefore', {
    tooltip: 'Insert column before',
    onAction: cmd('mceTableInsertColBefore'),
    icon: 'table-insert-column-before',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });

  editor.ui.registry.addButton('tableinsertcolafter', {
    tooltip: 'Insert column after',
    onAction: cmd('mceTableInsertColAfter'),
    icon: 'table-insert-column-after',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });

  editor.ui.registry.addButton('tabledeletecol', {
    tooltip: 'Delete column',
    onAction: cmd('mceTableDeleteCol'),
    icon: 'table-delete-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablecutrow', {
    tooltip: 'Cut row',
    icon: 'cut-row',
    onAction: cmd('mceTableCutRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablecopyrow', {
    tooltip: 'Copy row',
    icon: 'duplicate-row',
    onAction: cmd('mceTableCopyRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablepasterowbefore', {
    tooltip: 'Paste row before',
    icon: 'paste-row-before',
    onAction: cmd('mceTablePasteRowBefore'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  editor.ui.registry.addButton('tablepasterowafter', {
    tooltip: 'Paste row after',
    icon: 'paste-row-after',
    onAction: cmd('mceTablePasteRowAfter'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  editor.ui.registry.addButton('tablecutcol', {
    tooltip: 'Cut column',
    icon: 'cut-column',
    onAction: cmd('mceTableCutCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablecopycol', {
    tooltip: 'Copy column',
    icon: 'duplicate-column',
    onAction: cmd('mceTableCopyCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablepastecolbefore', {
    tooltip: 'Paste column before',
    icon: 'paste-column-before',
    onAction: cmd('mceTablePasteColBefore'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onFirst)
  });

  editor.ui.registry.addButton('tablepastecolafter', {
    tooltip: 'Paste column after',
    icon: 'paste-column-after',
    onAction: cmd('mceTablePasteColAfter'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onLast)
  });

  editor.ui.registry.addButton('tableinsertdialog', {
    tooltip: 'Insert table',
    onAction: cmd('mceInsertTable'),
    icon: 'table'
  });

  const tableClassList = filterNoneItem(getTableClassList(editor));
  if (tableClassList.length !== 0) {
    editor.ui.registry.addMenuButton('tableclass', {
      icon: 'table-classes',
      tooltip: 'Table styles',
      fetch: generateItemsCallback(
        editor,
        tableClassList,
        'tableclass',
        (item) => item.title,
        (item) => editor.execCommand('mceTableToggleClass', false, item.value)
      ),
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = filterNoneItem(getCellClassList(editor));
  if (tableCellClassList.length !== 0) {
    editor.ui.registry.addMenuButton('tablecellclass', {
      icon: 'table-cell-classes',
      tooltip: 'Cell styles',
      fetch: generateItemsCallback(
        editor,
        tableCellClassList,
        'tablecellclass',
        (item) => item.title,
        (item) => editor.execCommand('mceTableCellToggleClass', false, item.value)
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  editor.ui.registry.addMenuButton('tablecellvalign', {
    icon: 'vertical-align',
    tooltip: 'Vertical align',
    fetch: generateItemsCallback(
      editor,
      verticalAlignValues,
      'tablecellverticalalign',
      (item) => item.text,
      applyTableCellStyle(editor, 'vertical-align')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderWidthsList = getTableBorderWidths(editor);
  editor.ui.registry.addMenuButton('tablecellborderwidth', {
    icon: 'border-width',
    tooltip: 'Border width',
    fetch: generateItemsCallback(
      editor,
      tableCellBorderWidthsList,
      'tablecellborderwidth',
      (item) => item.title,
      applyTableCellStyle(editor, 'border-width')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderStylesList = getTableBorderStyles(editor);
  editor.ui.registry.addMenuButton('tablecellborderstyle', {
    icon: 'border-style',
    tooltip: 'Border style',
    fetch: generateItemsCallback(
      editor,
      tableCellBorderStylesList,
      'tablecellborderstyle',
      (item) => item.text,
      applyTableCellStyle(editor, 'border-style')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleButton('tablecaption', {
    tooltip: 'Table caption',
    onAction: cmd('mceTableToggleCaption'),
    icon: 'table-caption',
    onSetup: selectionTargets.onSetupTableWithCaption
  });

  const tableCellBackgroundColors = getTableCellBackgroundColors(editor);
  editor.ui.registry.addMenuButton('tablecellbackgroundcolor', {
    icon: 'cell-background-color',
    tooltip: 'Background color',
    fetch: (callback) => callback(generateColorSelector(editor, tableCellBackgroundColors, 'background-color')),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderColors = getTableCellBorderColors(editor);
  editor.ui.registry.addMenuButton('tablecellbordercolor', {
    icon: 'cell-border-color',
    tooltip: 'Border color',
    fetch: (callback) => callback(generateColorSelector(editor, tableCellBorderColors, 'border-color')),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleButton('tablerowheader', {
    tooltip: 'Row header',
    icon: 'table-top-header',
    onAction: changeRowHeader(editor),
    onSetup: selectionTargets.onSetupTableRowHeaders
  });

  editor.ui.registry.addToggleButton('tablecolheader', {
    tooltip: 'Column header',
    icon: 'table-left-header',
    onAction: changeColumnHeader(editor),
    onSetup: selectionTargets.onSetupTableColumnHeaders
  });
};

const addToolbars = (editor: Editor) => {
  const isTable = (table: Node) => editor.dom.is(table, 'table') && editor.getBody().contains(table);

  const toolbar = getToolbar(editor);
  if (toolbar.length > 0) {
    editor.ui.registry.addContextToolbar('table', {
      predicate: isTable,
      items: toolbar,
      scope: 'node',
      position: 'node'
    });
  }
};

export {
  addButtons,
  addToolbars
};
