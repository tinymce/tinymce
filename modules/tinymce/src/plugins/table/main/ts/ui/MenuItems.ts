/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Node } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as InsertTable from '../actions/InsertTable';
import { hasTableGrid } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets } from '../selection/SelectionTargets';

const addMenuItems = (editor: Editor, selectionTargets: SelectionTargets, clipboard: Clipboard) => {
  const cmd = (command) => () => editor.execCommand(command);

  const insertTableAction = ({ numRows, numColumns }) => {
    editor.undoManager.transact(function () {
      InsertTable.insert(editor, numColumns, numRows, 0, 0);
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

  const row: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Row',
    getSubmenuItems: () => 'tableinsertrowbefore tableinsertrowafter tabledeleterow tablerowprops | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter'
  };

  editor.ui.registry.addMenuItem('tableinsertcolumnbefore', {
    text: 'Insert column before',
    icon: 'table-insert-column-before',
    onAction: cmd('mceTableInsertColBefore'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tableinsertcolumnafter', {
    text: 'Insert column after',
    icon: 'table-insert-column-after',
    onAction: cmd('mceTableInsertColAfter'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tabledeletecolumn', {
    text: 'Delete column',
    icon: 'table-delete-column',
    onAction: cmd('mceTableDeleteCol'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuItem('tablecutcolumn', {
    text: 'Cut column',
    icon: 'cut-column',
    onAction: cmd('mceTableCutCol'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablecopycolumn', {
    text: 'Copy column',
    icon: 'duplicate-column',
    onAction: cmd('mceTableCopyCol'),
    onSetup: selectionTargets.onSetupCellOrRow
  });
  editor.ui.registry.addMenuItem('tablepastecolumnbefore', {
    text: 'Paste column before',
    icon: 'paste-column-before',
    onAction: cmd('mceTablePasteColBefore'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getColumns)
  });
  editor.ui.registry.addMenuItem('tablepastecolumnafter', {
    text: 'Paste column after',
    icon: 'paste-column-after',
    onAction: cmd('mceTablePasteColAfter'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getColumns)
  });

  const column: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Column',
    // TODO: Add the column cut/copy/paste menu items in TinyMCE 5.5 or whenever we are able to get them translated
    getSubmenuItems: () => 'tableinsertcolumnbefore tableinsertcolumnafter tabledeletecolumn' // | tablecutcolumn tablecopycolumn tablepastecolumnbefore tablepastecolumnafter'
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

  const cell: Menu.NestedMenuItemApi = {
    type: 'nestedmenuitem',
    text: 'Cell',
    getSubmenuItems: () => 'tablecellprops tablemergecells tablesplitcells'
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

export {
  addMenuItems
};
