/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Option, Thunk } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import { Selections } from 'tinymce/plugins/table/selection/Selections';
import InsertTable from '../actions/InsertTable';
import { hasTableGrid } from '../api/Settings';
import TableTargets from '../queries/TableTargets';

const addMenuItems = (editor: Editor, selections: Selections) => {
  let targets = Option.none;

  // AP-172 AP-65 TODO functionality functions. do we even need half of these now?
  const noTargetDisable = (ctrl) => {
    ctrl.setDisabled(true);
  };

  const ctrlEnable = (ctrl) => {
    ctrl.setDisabled(false);
  };

  const setEnabled = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      ctrlEnable(api);
    });

    return () => { };
  };

  const setEnabledMerge = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      api.setDisabled(targets.mergable().isNone());
    });

    return () => { };
  };

  const setEnabledUnmerge = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      api.setDisabled(targets.unmergable().isNone());
    });

    return () => { };
  };

  const resetTargets = () => {
    targets = Thunk.cached(() => {
      const cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      return cellOpt.bind((cellDom) => {
        const cell = Element.fromDom(cellDom);
        const table = TableLookup.table(cell);
        return table.map((table) => {
          return TableTargets.forMenu(selections, table, cell);
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
    onSetup: setEnabled,
    onAction: cmd('mceTableProps')
  };

  const deleteTable = {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: setEnabled,
    onAction: cmd('mceTableDelete')
  };

  const row: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert row before', icon: 'table-insert-row-above', onAction: cmd('mceTableInsertRowBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Insert row after', icon: 'table-insert-row-after', onAction: cmd('mceTableInsertRowAfter'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Delete row', icon: 'table-delete-row', onAction: cmd('mceTableDeleteRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Row properties', icon: 'table-row-properties', onAction: cmd('mceTableRowProps'), onSetup: setEnabled },
      { type: 'separator' },
      { type: 'menuitem', text: 'Cut row', onAction: cmd('mceTableCutRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Copy row', onAction: cmd('mceTableCopyRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Paste row before', onAction: cmd('mceTablePasteRowBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Paste row after', onAction: cmd('mceTablePasteRowAfter'), onSetup: setEnabled }
    ]
  };

  const column: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Column',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert column before', icon: 'table-insert-column-before', onAction: cmd('mceTableInsertColBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Insert column after', icon: 'table-insert-column-after', onAction: cmd('mceTableInsertColAfter'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Delete column', icon: 'table-delete-column', onAction: cmd('mceTableDeleteCol'), onSetup: setEnabled }
    ]
  };

  const cell: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Cell properties', icon: 'table-cell-properties', onAction: cmd('mceTableCellProps'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Merge cells', icon: 'table-merge-cells', onAction: cmd('mceTableMergeCells'), onSetup: setEnabledMerge },
      { type: 'menuitem', text: 'Split cell', icon: 'table-split-cells', onAction: cmd('mceTableSplitCells'), onSetup: setEnabledUnmerge }
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
    update: () => {
      // context menu fires before node change, so check the selection here first
      resetTargets();
      // ignoring element since it's monitored elsewhere
      return targets().fold(() => '', () => {
        return 'cell row column | tableprops deletetable';
      });
    }
  });
};

export default {
  addMenuItems
};