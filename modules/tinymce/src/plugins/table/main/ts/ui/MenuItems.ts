/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Node } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import InsertTable from '../actions/InsertTable';
import { hasTableGrid } from '../api/Settings';
import { SelectionTargets } from '../selection/SelectionTargets';

const addMenuItems = (editor: Editor, selectionTargets: SelectionTargets) => {
  const cmd = (command) => () => editor.execCommand(command);

  const insertTableAction = ({numRows, numColumns}) => {
    editor.undoManager.transact(function () {
      InsertTable.insert(editor, numColumns, numRows);
    });

    editor.addVisual();
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

  const rowItems = [
    { type: 'menuitem', text: 'Insert row before', icon: 'table-insert-row-above', onAction: cmd('mceTableInsertRowBefore'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Insert row after', icon: 'table-insert-row-after', onAction: cmd('mceTableInsertRowAfter'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Delete row', icon: 'table-delete-row', onAction: cmd('mceTableDeleteRow'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Row properties', icon: 'table-row-properties', onAction: cmd('mceTableRowProps'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'separator' },
    { type: 'menuitem', text: 'Cut row', onAction: cmd('mceTableCutRow'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Copy row', onAction: cmd('mceTableCopyRow'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Paste row before', onAction: cmd('mceTablePasteRowBefore'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Paste row after', onAction: cmd('mceTablePasteRowAfter'), onSetup:  selectionTargets.onSetupCellOrRow }
  ] as Array<Menu.NestedMenuItemContents>;

  const row: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: () => rowItems
  };

  const columnItems = [
    { type: 'menuitem', text: 'Insert column before', icon: 'table-insert-column-before', onAction: cmd('mceTableInsertColBefore'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Insert column after', icon: 'table-insert-column-after', onAction: cmd('mceTableInsertColAfter'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Delete column', icon: 'table-delete-column', onAction: cmd('mceTableDeleteCol'), onSetup:  selectionTargets.onSetupCellOrRow }
  ] as Array<Menu.NestedMenuItemContents>;

  const column: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Column',
    getSubmenuItems: () => columnItems
  };

  const cellItems = [
    { type: 'menuitem', text: 'Cell properties', icon: 'table-cell-properties', onAction: cmd('mceTableCellProps'), onSetup:  selectionTargets.onSetupCellOrRow },
    { type: 'menuitem', text: 'Merge cells', icon: 'table-merge-cells', onAction: cmd('mceTableMergeCells'), onSetup: selectionTargets.onSetupMergeable },
    { type: 'menuitem', text: 'Split cell', icon: 'table-split-cells', onAction: cmd('mceTableSplitCells'), onSetup: selectionTargets.onSetupUnmergeable }
  ] as Array<Menu.NestedMenuItemContents>;

  const cell: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: () => cellItems
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
      getSubmenuItems: () => [{type: 'fancymenuitem', fancytype: 'inserttable', onAction: insertTableAction}]
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
      return selectionTargets.targets().fold(() => '', (targets) => {
        // If clicking in a caption, then we shouldn't show the cell/row/column options
        if (Node.name(targets.element()) === 'caption') {
          return 'tableprops deletetable';
        } else {
          return 'cell row column | advtablesort | tableprops deletetable';
        }
      });
    }
  });
};

export default {
  addMenuItems
};