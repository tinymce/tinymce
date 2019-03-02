/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Node } from '@ephox/dom-globals';
import { Option, Thunk, Fun } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Node as SugarNode } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import { Selections } from '../selection/Selections';
import * as TableSelection from '../selection/TableSelection';
import InsertTable from '../actions/InsertTable';
import { hasTableGrid } from '../api/Settings';
import TableTargets from '../queries/TableTargets';

const addMenuItems = (editor: Editor, selections: Selections) => {
  let targets = Option.none;

  const setupEnabled = (activeCallback: (api: Menu.MenuItemInstanceApi, targets) => void, api: Menu.MenuItemInstanceApi) => {
    targets().fold(() => {
      api.setDisabled(true);
    }, (targets) => {
      activeCallback(api, targets);
    });

    return () => { };
  };

  const setupTable = Fun.curry(setupEnabled, (api) => api.setDisabled(false));
  const setupCell = Fun.curry(setupEnabled, (api, targets) => api.setDisabled(SugarNode.name(targets.element()) === 'caption'));
  const setupMergeable = Fun.curry(setupEnabled, (api, targets) => api.setDisabled(targets.mergable().isNone()));
  const setupUnmergeable = Fun.curry(setupEnabled, (api, targets) => api.setDisabled(targets.unmergable().isNone()));

  const resetTargets = () => {
    targets = Thunk.cached(() => {
      return TableSelection.getSelectionStartCellOrCaption(editor).bind((cellOrCaption) => {
        const table = TableLookup.table(cellOrCaption);
        return table.map((table) => {
          if (SugarNode.name(cellOrCaption) === 'caption') {
            return TableTargets.notCell(cellOrCaption);
          } else {
            return TableTargets.forMenu(selections, table, cellOrCaption);
          }
        });
      });
    });
  };

  editor.on('nodechange', resetTargets);

  const cmd = (command) => () => editor.execCommand(command);

  const insertTableAction = ({numRows, numColumns}) => {
    editor.undoManager.transact(function () {
      InsertTable.insert(editor, numColumns, numRows);
    });

    editor.addVisual();
  };

  const tableProperties = {
    text: 'Table properties',
    onSetup: setupTable,
    onAction: cmd('mceTableProps')
  };

  const deleteTable = {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: setupTable,
    onAction: cmd('mceTableDelete')
  };

  const row: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert row before', icon: 'table-insert-row-above', onAction: cmd('mceTableInsertRowBefore'), onSetup: setupCell },
      { type: 'menuitem', text: 'Insert row after', icon: 'table-insert-row-after', onAction: cmd('mceTableInsertRowAfter'), onSetup: setupCell },
      { type: 'menuitem', text: 'Delete row', icon: 'table-delete-row', onAction: cmd('mceTableDeleteRow'), onSetup: setupCell },
      { type: 'menuitem', text: 'Row properties', icon: 'table-row-properties', onAction: cmd('mceTableRowProps'), onSetup: setupCell },
      { type: 'separator' },
      { type: 'menuitem', text: 'Cut row', onAction: cmd('mceTableCutRow'), onSetup: setupCell },
      { type: 'menuitem', text: 'Copy row', onAction: cmd('mceTableCopyRow'), onSetup: setupCell },
      { type: 'menuitem', text: 'Paste row before', onAction: cmd('mceTablePasteRowBefore'), onSetup: setupCell },
      { type: 'menuitem', text: 'Paste row after', onAction: cmd('mceTablePasteRowAfter'), onSetup: setupCell }
    ]
  };

  const column: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Column',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert column before', icon: 'table-insert-column-before', onAction: cmd('mceTableInsertColBefore'), onSetup: setupCell },
      { type: 'menuitem', text: 'Insert column after', icon: 'table-insert-column-after', onAction: cmd('mceTableInsertColAfter'), onSetup: setupCell },
      { type: 'menuitem', text: 'Delete column', icon: 'table-delete-column', onAction: cmd('mceTableDeleteCol'), onSetup: setupCell }
    ]
  };

  const cell: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Cell properties', icon: 'table-cell-properties', onAction: cmd('mceTableCellProps'), onSetup: setupCell },
      { type: 'menuitem', text: 'Merge cells', icon: 'table-merge-cells', onAction: cmd('mceTableMergeCells'), onSetup: setupMergeable },
      { type: 'menuitem', text: 'Split cell', icon: 'table-split-cells', onAction: cmd('mceTableSplitCells'), onSetup: setupUnmergeable }
    ]
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

  editor.ui.registry.addMenuItem('tableprops', tableProperties);
  editor.ui.registry.addMenuItem('deletetable', deleteTable);
  editor.ui.registry.addNestedMenuItem('row', row);
  editor.ui.registry.addNestedMenuItem('column', column);
  editor.ui.registry.addNestedMenuItem('cell', cell);

  editor.ui.registry.addContextMenu('table', {
    update: (node: Node) => {
      // context menu fires before node change, so check the selection here first
      resetTargets();
      // ignoring element since it's monitored elsewhere
      return targets().fold(() => '', (targets) => {
        // If clicking in a caption, then we shouldn't show the cell/row/column options
        if (SugarNode.name(targets.element()) === 'caption') {
          return 'tableprops deletetable';
        } else {
          return 'cell row column | tableprops deletetable';
        }
      });
    }
  });
};

export default {
  addMenuItems
};