/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as FakeClipboard from '../api/Clipboard';
import * as Options from '../api/Options';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, generateMenuItemsCallback } from './UiUtils';

interface AddButtonSpec {
  tooltip: string;
  command: string;
  icon: string;
  onSetup?: (api: Toolbar.ToolbarButtonInstanceApi) => () => void;
}

const addButtons = (editor: Editor, selectionTargets: SelectionTargets): void => {
  editor.ui.registry.addMenuButton('table', {
    tooltip: 'Table',
    icon: 'table',
    fetch: (callback) => callback('inserttable | cell row column | advtablesort | tableprops deletetable')
  });

  const cmd = (command: string) => () => editor.execCommand(command);

  // TODO: TINY-8172 Look at solution to make sure user can't use buttons that won't do anything
  const addButton = (name: string, spec: AddButtonSpec) => {
    editor.ui.registry.addButton(name, {
      ...spec,
      onAction: cmd(spec.command)
    });
  };

  addButton('tableprops', {
    tooltip: 'Table properties',
    command: 'mceTableProps',
    icon: 'table',
    onSetup: selectionTargets.onSetupTable
  });

  addButton('tabledelete', {
    tooltip: 'Delete table',
    command: 'mceTableDelete',
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable
  });

  addButton('tablecellprops', {
    tooltip: 'Cell properties',
    command: 'mceTableCellProps',
    icon: 'table-cell-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tablemergecells', {
    tooltip: 'Merge cells',
    command: 'mceTableMergeCells',
    icon: 'table-merge-cells',
    onSetup: selectionTargets.onSetupMergeable
  });

  addButton('tablesplitcells', {
    tooltip: 'Split cell',
    command: 'mceTableSplitCells',
    icon: 'table-split-cells',
    onSetup: selectionTargets.onSetupUnmergeable
  });

  addButton('tableinsertrowbefore', {
    tooltip: 'Insert row before',
    command: 'mceTableInsertRowBefore',
    icon: 'table-insert-row-above',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tableinsertrowafter', {
    tooltip: 'Insert row after',
    command: 'mceTableInsertRowAfter',
    icon: 'table-insert-row-after',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tabledeleterow', {
    tooltip: 'Delete row',
    command: 'mceTableDeleteRow',
    icon: 'table-delete-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tablerowprops', {
    tooltip: 'Row properties',
    command: 'mceTableRowProps',
    icon: 'table-row-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tableinsertcolbefore', {
    tooltip: 'Insert column before',
    command: 'mceTableInsertColBefore',
    icon: 'table-insert-column-before',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });

  addButton('tableinsertcolafter', {
    tooltip: 'Insert column after',
    command: 'mceTableInsertColAfter',
    icon: 'table-insert-column-after',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });

  addButton('tabledeletecol', {
    tooltip: 'Delete column',
    command: 'mceTableDeleteCol',
    icon: 'table-delete-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButton('tablecutrow', {
    tooltip: 'Cut row',
    command: 'mceTableCutRow',
    icon: 'cut-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tablecopyrow', {
    tooltip: 'Copy row',
    command: 'mceTableCopyRow',
    icon: 'duplicate-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButton('tablepasterowbefore', {
    tooltip: 'Paste row before',
    command: 'mceTablePasteRowBefore',
    icon: 'paste-row-before',
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
  });

  addButton('tablepasterowafter', {
    tooltip: 'Paste row after',
    command: 'mceTablePasteRowAfter',
    icon: 'paste-row-after',
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
  });

  addButton('tablecutcol', {
    tooltip: 'Cut column',
    command: 'mceTableCutCol',
    icon: 'cut-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButton('tablecopycol', {
    tooltip: 'Copy column',
    command: 'mceTableCopyCol',
    icon: 'duplicate-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButton('tablepastecolbefore', {
    tooltip: 'Paste column before',
    command: 'mceTablePasteColBefore',
    icon: 'paste-column-before',
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onFirst)
  });

  addButton('tablepastecolafter', {
    tooltip: 'Paste column after',
    command: 'mceTablePasteColAfter',
    icon: 'paste-column-after',
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onLast)
  });

  addButton('tableinsertdialog', {
    tooltip: 'Insert table',
    command: 'mceInsertTableDialog',
    icon: 'table'
  });

  const tableClassList = filterNoneItem(Options.getTableClassList(editor));
  if (tableClassList.length !== 0) {
    editor.ui.registry.addMenuButton('tableclass', {
      icon: 'table-classes',
      tooltip: 'Table styles',
      fetch: generateMenuItemsCallback(
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
    editor.ui.registry.addMenuButton('tablecellclass', {
      icon: 'table-cell-classes',
      tooltip: 'Cell styles',
      fetch: generateMenuItemsCallback(
        editor,
        tableCellClassList,
        'tablecellclass',
        (value) => editor.execCommand('mceTableCellToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  editor.ui.registry.addMenuButton('tablecellvalign', {
    icon: 'vertical-align',
    tooltip: 'Vertical align',
    fetch: generateMenuItemsCallback(
      editor,
      verticalAlignValues,
      'tablecellverticalalign',
      applyTableCellStyle(editor, 'vertical-align')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuButton('tablecellborderwidth', {
    icon: 'border-width',
    tooltip: 'Border width',
    fetch: generateMenuItemsCallback(
      editor,
      Options.getTableBorderWidths(editor),
      'tablecellborderwidth',
      applyTableCellStyle(editor, 'border-width')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuButton('tablecellborderstyle', {
    icon: 'border-style',
    tooltip: 'Border style',
    fetch: generateMenuItemsCallback(
      editor,
      Options.getTableBorderStyles(editor),
      'tablecellborderstyle',
      applyTableCellStyle(editor, 'border-style')
    ),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuButton('tablecellbackgroundcolor', {
    icon: 'cell-background-color',
    tooltip: 'Background color',
    fetch: (callback) => callback(buildColorMenu(editor, Options.getTableBackgroundColorMap(editor), 'background-color')),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addMenuButton('tablecellbordercolor', {
    icon: 'cell-border-color',
    tooltip: 'Border color',
    fetch: (callback) => callback(buildColorMenu(editor, Options.getTableBorderColorMap(editor), 'border-color')),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleButton('tablecaption', {
    tooltip: 'Table caption',
    onAction: cmd('mceTableToggleCaption'),
    icon: 'table-caption',
    onSetup: selectionTargets.onSetupTableWithCaption
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

const addToolbars = (editor: Editor): void => {
  const isTable = (table: Node) => editor.dom.is(table, 'table') && editor.getBody().contains(table);

  const toolbar = Options.getToolbar(editor);
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
