/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import { getToolbar } from '../api/Settings';
import { SelectionTargets } from '../selection/SelectionTargets';

const addButtons = (editor: Editor, selectionTargets: SelectionTargets) => {
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
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertcolafter', {
    tooltip: 'Insert column after',
    onAction: cmd('mceTableInsertColAfter'),
    icon: 'table-insert-column-after',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tabledeletecol', {
    tooltip: 'Delete column',
    onAction: cmd('mceTableDeleteCol'),
    icon: 'table-delete-column',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  // TODO: Need icons!!
  editor.ui.registry.addButton('tablecutrow', {
    tooltip: 'Cut row',
    onAction: cmd('mceTableCutRow'),
    icon: 'temporary-placeholder',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablecopyrow', {
    tooltip: 'Copy row',
    onAction: cmd('mceTableCopyRow'),
    icon: 'temporary-placeholder',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablepasterowbefore', {
    tooltip: 'Paste row before',
    onAction: cmd('mceTablePasteRowBefore'),
    icon: 'temporary-placeholder',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablepasterowafter', {
    tooltip: 'Paste row after',
    onAction: cmd('mceTablePasteRowAfter'),
    icon: 'temporary-placeholder',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertdialog', {
    tooltip: 'Insert table',
    onAction: cmd('mceInsertTable'),
    icon: 'table'
  });

};

const addToolbars = (editor: Editor) => {
  const isTable = (table: Node) => {
    return editor.dom.is(table, 'table') && editor.getBody().contains(table);
  };

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

export default {
  addButtons,
  addToolbars
};