/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import * as FakeClipboard from '../api/Clipboard';
import * as Options from '../api/Options';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, buildMenuItems } from './UiUtils';

interface AddMenuSpec {
  text: string;
  command: string;
  icon?: string;
  onSetup?: (api: Menu.MenuItemInstanceApi) => () => void;
}

const addMenuItems = (editor: Editor, selectionTargets: SelectionTargets): void => {
  const cmd = (command: string) => () => editor.execCommand(command);

  // TODO: TINY-8172 Look at solution to make sure user can't use buttons that won't do anything
  const addMenuItem = (name: string, spec: AddMenuSpec) => {
    editor.ui.registry.addMenuItem(name, {
      ...spec,
      onAction: cmd(spec.command)
    });
  };

  const insertTableAction = (data: { numRows: number; numColumns: number }) => {
    editor.execCommand('mceInsertTable', false, {
      rows: data.numRows,
      columns: data.numColumns
    });
  };

  addMenuItem('tableinsertrowbefore', {
    text: 'Insert row before',
    icon: 'table-insert-row-above',
    command: 'mceTableInsertRowBefore',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tableinsertrowafter', {
    text: 'Insert row after',
    icon: 'table-insert-row-after',
    command: 'mceTableInsertRowAfter',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tabledeleterow', {
    text: 'Delete row',
    icon: 'table-delete-row',
    command: 'mceTableDeleteRow',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tablerowprops', {
    text: 'Row properties',
    icon: 'table-row-properties',
    command: 'mceTableRowProps',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tablecutrow', {
    text: 'Cut row',
    icon: 'cut-row',
    command: 'mceTableCutRow',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tablecopyrow', {
    text: 'Copy row',
    icon: 'duplicate-row',
    command: 'mceTableCopyRow',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tablepasterowbefore', {
    text: 'Paste row before',
    icon: 'paste-row-before',
    command: 'mceTablePasteRowBefore',
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
  });

  addMenuItem('tablepasterowafter', {
    text: 'Paste row after',
    icon: 'paste-row-after',
    command: 'mceTablePasteRowAfter',
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
  });

  addMenuItem('tableinsertcolumnbefore', {
    text: 'Insert column before',
    icon: 'table-insert-column-before',
    command: 'mceTableInsertColBefore',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });

  addMenuItem('tableinsertcolumnafter', {
    text: 'Insert column after',
    icon: 'table-insert-column-after',
    command: 'mceTableInsertColAfter',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });

  addMenuItem('tabledeletecolumn', {
    text: 'Delete column',
    icon: 'table-delete-column',
    command: 'mceTableDeleteCol',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addMenuItem('tablecutcolumn', {
    text: 'Cut column',
    icon: 'cut-column',
    command: 'mceTableCutCol',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addMenuItem('tablecopycolumn', {
    text: 'Copy column',
    icon: 'duplicate-column',
    command: 'mceTableCopyCol',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addMenuItem('tablepastecolumnbefore', {
    text: 'Paste column before',
    icon: 'paste-column-before',
    command: 'mceTablePasteColBefore',
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onFirst)
  });

  addMenuItem('tablepastecolumnafter', {
    text: 'Paste column after',
    icon: 'paste-column-after',
    command: 'mceTablePasteColAfter',
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onLast)
  });

  addMenuItem('tablecellprops', {
    text: 'Cell properties',
    icon: 'table-cell-properties',
    command: 'mceTableCellProps',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addMenuItem('tablemergecells', {
    text: 'Merge cells',
    icon: 'table-merge-cells',
    command: 'mceTableMergeCells',
    onSetup: selectionTargets.onSetupMergeable
  });

  addMenuItem('tablesplitcells', {
    text: 'Split cell',
    icon: 'table-split-cells',
    command: 'mceTableSplitCells',
    onSetup: selectionTargets.onSetupUnmergeable
  });

  if (!Options.hasTableGrid(editor)) {
    addMenuItem('inserttable', {
      text: 'Table',
      icon: 'table',
      command: 'mceInsertTableDialog'
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
  addMenuItem('inserttabledialog', {
    text: 'Insert table',
    icon: 'table',
    command: 'mceInsertTableDialog'
  });

  addMenuItem('tableprops', {
    text: 'Table properties',
    onSetup: selectionTargets.onSetupTable,
    command: 'mceTableProps'
  });
  addMenuItem('deletetable', {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable,
    command: 'mceTableDelete'
  });

  editor.ui.registry.addNestedMenuItem('row', {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: Fun.constant('tableinsertrowbefore tableinsertrowafter tabledeleterow tablerowprops | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter')
  });

  editor.ui.registry.addNestedMenuItem('column', {
    type: 'nestedmenuitem',
    text: 'Column',
    getSubmenuItems: Fun.constant('tableinsertcolumnbefore tableinsertcolumnafter tabledeletecolumn | tablecutcolumn tablecopycolumn tablepastecolumnbefore tablepastecolumnafter')
  });

  editor.ui.registry.addNestedMenuItem('cell', {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: Fun.constant('tablecellprops tablemergecells tablesplitcells')
  });

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

  const tableClassList = filterNoneItem(Options.getTableClassList(editor));
  if (tableClassList.length !== 0) {
    editor.ui.registry.addNestedMenuItem('tableclass', {
      icon: 'table-classes',
      text: 'Table styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
        tableClassList,
        'tableclass',
        (value) => editor.execCommand('mceTableToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = filterNoneItem(Options.getCellClassList(editor));
  if (tableCellClassList.length !== 0) {
    editor.ui.registry.addNestedMenuItem('tablecellclass', {
      icon: 'table-cell-classes',
      text: 'Cell styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
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
      Options.getTableBorderWidths(editor),
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
      Options.getTableBorderStyles(editor),
      'tablecellborderstyle',
      applyTableCellStyle(editor, 'border-style')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addNestedMenuItem('tablecellbackgroundcolor', {
    icon: 'cell-background-color',
    text: 'Background color',
    getSubmenuItems: () => buildColorMenu(editor, Options.getTableBackgroundColorMap(editor), 'background-color'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addNestedMenuItem('tablecellbordercolor', {
    icon: 'cell-border-color',
    text: 'Border color',
    getSubmenuItems: () => buildColorMenu(editor, Options.getTableBorderColorMap(editor), 'border-color'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleMenuItem('tablecaption', {
    icon: 'table-caption',
    text: 'Table caption',
    onAction: cmd('mceTableToggleCaption'),
    onSetup: selectionTargets.onSetupTableWithCaption
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
