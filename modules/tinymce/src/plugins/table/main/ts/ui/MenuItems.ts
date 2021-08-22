/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Fun } from '@ephox/katamari';
import { SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { getCellClassList, getTableBorderStyles, getTableBorderWidths, getTableBackgroundColorMap, getTableBorderColorMap, getTableClassList, hasTableGrid } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, buildMenuItems } from './UiUtils';

const addMenuItems = (editor: Editor, selections: Selections, selectionTargets: SelectionTargets, clipboard: Clipboard): void => {
  const cmd = (command: string) => () => editor.execCommand(command);

  const insertTableAction = (data: { numRows: number; numColumns: number }) => {
    editor.execCommand('mceInsertTable', false, {
      rows: data.numRows,
      columns: data.numColumns
    });
  };

  const tableProperties = {
    text: 'Table properties',
    onSetup: selectionTargets.onSetupTable,
    onAction: cmd('mceTableProps')
  };

  const deleteTable = {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable,
    onAction: cmd('mceTableDelete')
  };

  editor.ui.registry.addMenuItem('tableinsertrowbefore', {
    text: 'Insert row before',
    icon: 'table-insert-row-above',
    onAction: cmd('mceTableInsertRowBefore'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tableinsertrowafter', {
    text: 'Insert row after',
    icon: 'table-insert-row-after',
    onAction: cmd('mceTableInsertRowAfter'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tabledeleterow', {
    text: 'Delete row',
    icon: 'table-delete-row',
    onAction: cmd('mceTableDeleteRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablerowprops', {
    text: 'Row properties',
    icon: 'table-row-properties',
    onAction: cmd('mceTableRowProps'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuItem('tablecutrow', {
    text: 'Cut row',
    icon: 'cut-row',
    onAction: cmd('mceTableCutRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablecopyrow', {
    text: 'Copy row',
    icon: 'duplicate-row',
    onAction: cmd('mceTableCopyRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablepasterowbefore', {
    text: 'Paste row before',
    icon: 'paste-row-before',
    onAction: cmd('mceTablePasteRowBefore'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });
  editor.ui.registry.addMenuItem('tablepasterowafter', {
    text: 'Paste row after',
    icon: 'paste-row-after',
    onAction: cmd('mceTablePasteRowAfter'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  const row: Menu.NestedMenuItemSpec = {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: Fun.constant('tableinsertrowbefore tableinsertrowafter tabledeleterow tablerowprops | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter')
  };

  editor.ui.registry.addMenuItem('tableinsertcolumnbefore', {
    text: 'Insert column before',
    icon: 'table-insert-column-before',
    onAction: cmd('mceTableInsertColBefore'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });
  editor.ui.registry.addMenuItem('tableinsertcolumnafter', {
    text: 'Insert column after',
    icon: 'table-insert-column-after',
    onAction: cmd('mceTableInsertColAfter'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });
  editor.ui.registry.addMenuItem('tabledeletecolumn', {
    text: 'Delete column',
    icon: 'table-delete-column',
    onAction: cmd('mceTableDeleteCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addMenuItem('tablecutcolumn', {
    text: 'Cut column',
    icon: 'cut-column',
    onAction: cmd('mceTableCutCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });
  editor.ui.registry.addMenuItem('tablecopycolumn', {
    text: 'Copy column',
    icon: 'duplicate-column',
    onAction: cmd('mceTableCopyCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });
  editor.ui.registry.addMenuItem('tablepastecolumnbefore', {
    text: 'Paste column before',
    icon: 'paste-column-before',
    onAction: cmd('mceTablePasteColBefore'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onFirst)
  });
  editor.ui.registry.addMenuItem('tablepastecolumnafter', {
    text: 'Paste column after',
    icon: 'paste-column-after',
    onAction: cmd('mceTablePasteColAfter'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onLast)
  });

  const column: Menu.NestedMenuItemSpec = {
    type: 'nestedmenuitem',
    text: 'Column',
    getSubmenuItems: Fun.constant('tableinsertcolumnbefore tableinsertcolumnafter tabledeletecolumn | tablecutcolumn tablecopycolumn tablepastecolumnbefore tablepastecolumnafter')
  };

  editor.ui.registry.addMenuItem('tablecellprops', {
    text: 'Cell properties',
    icon: 'table-cell-properties',
    onAction: cmd('mceTableCellProps'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablemergecells', {
    text: 'Merge cells',
    icon: 'table-merge-cells',
    onAction: cmd('mceTableMergeCells'),
    onSetup: selectionTargets.onSetupMergeable
  });
  editor.ui.registry.addMenuItem('tablesplitcells', {
    text: 'Split cell',
    icon: 'table-split-cells',
    onAction: cmd('mceTableSplitCells'),
    onSetup: selectionTargets.onSetupUnmergeable
  });

  const cell: Menu.NestedMenuItemSpec = {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: Fun.constant('tablecellprops tablemergecells tablesplitcells')
  };

  if (hasTableGrid(editor) === false) {
    editor.ui.registry.addMenuItem('inserttable', {
      text: 'Table',
      icon: 'table',
      onAction: cmd('mceInsertTable')
    });
  } else {
    editor.ui.registry.addNestedMenuItem('inserttable', {
      text: 'Table',
      icon: 'table',
      getSubmenuItems: () => [{ type: 'fancymenuitem', fancytype: 'inserttable', onAction: insertTableAction }]
    });
  }

  // TINY-3636: We want a way to use the dialog even when tablegrid true.
  // If tablegrid false then inserttable and inserttabledialog are the same,
  // but that's preferrable to breaking things at this point.
  editor.ui.registry.addMenuItem('inserttabledialog', {
    text: 'Insert table',
    icon: 'table',
    onAction: cmd('mceInsertTable')
  });

  editor.ui.registry.addMenuItem('tableprops', tableProperties);
  editor.ui.registry.addMenuItem('deletetable', deleteTable);
  editor.ui.registry.addNestedMenuItem('row', row);
  editor.ui.registry.addNestedMenuItem('column', column);
  editor.ui.registry.addNestedMenuItem('cell', cell);

  editor.ui.registry.addContextMenu('table', {
    update: () => {
      // context menu fires before node change, so check the selection here first
      selectionTargets.resetTargets();
      // ignoring element since it's monitored elsewhere
      return selectionTargets.targets().fold(Fun.constant(''), (targets) => {
        // If clicking in a caption, then we shouldn't show the cell/row/column options
        if (SugarNode.name(targets.element) === 'caption') {
          return 'tableprops deletetable';
        } else {
          return 'cell row column | advtablesort | tableprops deletetable';
        }
      });
    }
  });

  const tableClassList = filterNoneItem(getTableClassList(editor));
  if (tableClassList.length !== 0) {
    editor.ui.registry.addNestedMenuItem('tableclass', {
      icon: 'table-classes',
      text: 'Table styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        tableClassList,
        'tableclass',
        (value) => editor.execCommand('mceTableToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = filterNoneItem(getCellClassList(editor));
  if (tableCellClassList.length !== 0) {
    editor.ui.registry.addNestedMenuItem('tablecellclass', {
      icon: 'table-cell-classes',
      text: 'Cell styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        tableCellClassList,
        'tablecellclass',
        (value) => editor.execCommand('mceTableCellToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  editor.ui.registry.addNestedMenuItem('tablecellvalign', {
    icon: 'vertical-align',
    text: 'Vertical align',
    getSubmenuItems: () => buildMenuItems(
      editor,
      selections,
      verticalAlignValues,
      'tablecellverticalalign',
      applyTableCellStyle(editor, 'vertical-align')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addNestedMenuItem('tablecellborderwidth', {
    icon: 'border-width',
    text: 'Border width',
    getSubmenuItems: () => buildMenuItems(
      editor,
      selections,
      getTableBorderWidths(editor),
      'tablecellborderwidth',
      applyTableCellStyle(editor, 'border-width')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addNestedMenuItem('tablecellborderstyle', {
    icon: 'border-style',
    text: 'Border style',
    getSubmenuItems: () => buildMenuItems(
      editor,
      selections,
      getTableBorderStyles(editor),
      'tablecellborderstyle',
      applyTableCellStyle(editor, 'border-style')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleMenuItem('tablecaption', {
    icon: 'table-caption',
    text: 'Table caption',
    onAction: cmd('mceTableToggleCaption'),
    onSetup: selectionTargets.onSetupTableWithCaption
  });

  editor.ui.registry.addNestedMenuItem('tablecellbackgroundcolor', {
    icon: 'cell-background-color',
    text: 'Background color',
    getSubmenuItems: () => buildColorMenu(editor, getTableBackgroundColorMap(editor), 'background-color'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addNestedMenuItem('tablecellbordercolor', {
    icon: 'cell-border-color',
    text: 'Border color',
    getSubmenuItems: () => buildColorMenu(editor, getTableBorderColorMap(editor), 'border-color'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleMenuItem('tablerowheader', {
    text: 'Row header',
    icon: 'table-top-header',
    onAction: changeRowHeader(editor),
    onSetup: selectionTargets.onSetupTableRowHeaders
  });

  editor.ui.registry.addToggleMenuItem('tablecolheader', {
    text: 'Column header',
    icon: 'table-left-header',
    onAction: changeColumnHeader(editor),
    onSetup: selectionTargets.onSetupTableColumnHeaders
  });
};

export {
  addMenuItems
};
