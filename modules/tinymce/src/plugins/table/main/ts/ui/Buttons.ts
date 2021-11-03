/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';
import { SelectionTargets, LockedDisable } from 'tinymce/models/dom/table/main/ts/selection/SelectionTargets';

import * as Options from '../api/Options';
import { Clipboard } from '../core/Clipboard';
// import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, generateMenuItemsCallback } from './UiUtils';

interface AddButtonSpec {
  tooltip: string;
  command: string;
  icon: string;
  onSetup?: (api: Toolbar.ToolbarButtonInstanceApi) => () => void;
}

const addButtons = (editor: Editor, selections: Selections, selectionTargets: SelectionTargets, clipboard: Clipboard): void => {
  editor.ui.registry.addMenuButton('table', {
    tooltip: 'Table',
    icon: 'table',
    fetch: (callback) => callback('inserttable | cell row column | advtablesort | tableprops deletetable')
  });

  const cmd = (command: string) => () => editor.execCommand(command);

  // TODO TINY-8172: unwind this before merging the feature branch
  const addButtonIfRegistered = (name: string, spec: AddButtonSpec) => {
    if (editor.editorCommands.hasCustomCommand(spec.command)) {
      editor.ui.registry.addButton(name, {
        ...spec,
        onAction: cmd(spec.command)
      });
    }
  };

  addButtonIfRegistered('tableprops', {
    tooltip: 'Table properties',
    command: 'mceTableProps',
    icon: 'table',
    onSetup: selectionTargets.onSetupTable
  });

  addButtonIfRegistered('tabledelete', {
    tooltip: 'Delete table',
    command: 'mceTableDelete',
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable
  });

  addButtonIfRegistered('tablecellprops', {
    tooltip: 'Cell properties',
    command: 'mceTableCellProps',
    icon: 'table-cell-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tablemergecells', {
    tooltip: 'Merge cells',
    command: 'mceTableMergeCells',
    icon: 'table-merge-cells',
    onSetup: selectionTargets.onSetupMergeable
  });

  addButtonIfRegistered('tablesplitcells', {
    tooltip: 'Split cell',
    command: 'mceTableSplitCells',
    icon: 'table-split-cells',
    onSetup: selectionTargets.onSetupUnmergeable
  });

  addButtonIfRegistered('tableinsertrowbefore', {
    tooltip: 'Insert row before',
    command: 'mceTableInsertRowBefore',
    icon: 'table-insert-row-above',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tableinsertrowafter', {
    tooltip: 'Insert row after',
    command: 'mceTableInsertRowAfter',
    icon: 'table-insert-row-after',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tabledeleterow', {
    tooltip: 'Delete row',
    command: 'mceTableDeleteRow',
    icon: 'table-delete-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tablerowprops', {
    tooltip: 'Row properties',
    command: 'mceTableRowProps',
    icon: 'table-row-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tableinsertcolbefore', {
    tooltip: 'Insert column before',
    command: 'mceTableInsertColBefore',
    icon: 'table-insert-column-before',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });

  addButtonIfRegistered('tableinsertcolafter', {
    tooltip: 'Insert column after',
    command: 'mceTableInsertColAfter',
    icon: 'table-insert-column-after',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });

  addButtonIfRegistered('tabledeletecol', {
    tooltip: 'Delete column',
    command: 'mceTableDeleteCol',
    icon: 'table-delete-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButtonIfRegistered('tablecutrow', {
    tooltip: 'Cut row',
    command: 'mceTableCutRow',
    icon: 'cut-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tablecopyrow', {
    tooltip: 'Copy row',
    command: 'mceTableCopyRow',
    icon: 'duplicate-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  addButtonIfRegistered('tablepasterowbefore', {
    tooltip: 'Paste row before',
    command: 'mceTablePasteRowBefore',
    icon: 'paste-row-before',
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  addButtonIfRegistered('tablepasterowafter', {
    tooltip: 'Paste row after',
    command: 'mceTablePasteRowAfter',
    icon: 'paste-row-after',
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  addButtonIfRegistered('tablecutcol', {
    tooltip: 'Cut column',
    command: 'mceTableCutCol',
    icon: 'cut-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButtonIfRegistered('tablecopycol', {
    tooltip: 'Copy column',
    command: 'mceTableCopyCol',
    icon: 'duplicate-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  addButtonIfRegistered('tablepastecolbefore', {
    tooltip: 'Paste column before',
    command: 'mceTablePasteColBefore',
    icon: 'paste-column-before',
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onFirst)
  });

  addButtonIfRegistered('tablepastecolafter', {
    tooltip: 'Paste column after',
    command: 'mceTablePasteColAfter',
    icon: 'paste-column-after',
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onLast)
  });

  addButtonIfRegistered('tableinsertdialog', {
    tooltip: 'Insert table',
    command: 'mceInsertTable',
    icon: 'table'
  });

  const tableClassList = filterNoneItem(Options.getTableClassList(editor));
  if (tableClassList.length !== 0 && editor.editorCommands.hasCustomCommand('mceTableToggleClass')) {
    editor.ui.registry.addMenuButton('tableclass', {
      icon: 'table-classes',
      tooltip: 'Table styles',
      fetch: generateMenuItemsCallback(
        editor,
        selections,
        tableClassList,
        'tableclass',
        (value) => editor.execCommand('mceTableToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = filterNoneItem(Options.getCellClassList(editor));
  if (tableCellClassList.length !== 0 && editor.editorCommands.hasCustomCommand('mceTableCellToggleClass')) {
    editor.ui.registry.addMenuButton('tablecellclass', {
      icon: 'table-cell-classes',
      tooltip: 'Cell styles',
      fetch: generateMenuItemsCallback(
        editor,
        selections,
        tableCellClassList,
        'tablecellclass',
        (value) => editor.execCommand('mceTableCellToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableApplyCellStyle')) {
    editor.ui.registry.addMenuButton('tablecellvalign', {
      icon: 'vertical-align',
      tooltip: 'Vertical align',
      fetch: generateMenuItemsCallback(
        editor,
        selections,
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
        selections,
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
        selections,
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
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableToggleCaption')) {
    editor.ui.registry.addToggleButton('tablecaption', {
      tooltip: 'Table caption',
      onAction: cmd('mceTableToggleCaption'),
      icon: 'table-caption',
      onSetup: selectionTargets.onSetupTableWithCaption
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableRowType')) {
    editor.ui.registry.addToggleButton('tablerowheader', {
      tooltip: 'Row header',
      icon: 'table-top-header',
      onAction: changeRowHeader(editor),
      onSetup: selectionTargets.onSetupTableRowHeaders
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableColType')) {
    editor.ui.registry.addToggleButton('tablecolheader', {
      tooltip: 'Column header',
      icon: 'table-left-header',
      onAction: changeColumnHeader(editor),
      onSetup: selectionTargets.onSetupTableColumnHeaders
    });
  }
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
