import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as FakeClipboard from '../api/Clipboard';
import * as Options from '../api/Options';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, generateMenuItemsCallback } from './UiUtils';

interface AddButtonSpec<T> {
  readonly tooltip: string;
  readonly command: string;
  readonly icon: string;
  readonly onSetup?: (api: T) => () => void;
  readonly onAction?: (api: T) => void;
}

const onSetupEditable = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable());
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const addButtons = (editor: Editor, selectionTargets: SelectionTargets): void => {
  editor.ui.registry.addMenuButton('table', {
    tooltip: 'Table',
    icon: 'table',
    onSetup: onSetupEditable(editor),
    fetch: (callback) => callback('inserttable | cell row column | advtablesort | tableprops deletetable')
  });

  const cmd = (command: string) => () => editor.execCommand(command);

  // TODO: TINY-8172 Unwind this when an alternative solution is found
  const addButtonIfRegistered = (name: string, spec: AddButtonSpec<Toolbar.ToolbarButtonInstanceApi>) => {
    if (editor.queryCommandSupported(spec.command)) {
      editor.ui.registry.addButton(name, {
        ...spec,
        onAction: Type.isFunction(spec.onAction) ? spec.onAction : cmd(spec.command)
      });
    }
  };

  // TODO: TINY-8172 Unwind this when an alternative solution is found
  const addToggleButtonIfRegistered = (name: string, spec: AddButtonSpec<Toolbar.ToolbarToggleButtonInstanceApi>) => {
    if (editor.queryCommandSupported(spec.command)) {
      editor.ui.registry.addToggleButton(name, {
        ...spec,
        onAction: Type.isFunction(spec.onAction) ? spec.onAction : cmd(spec.command)
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
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
  });

  addButtonIfRegistered('tablepasterowafter', {
    tooltip: 'Paste row after',
    command: 'mceTablePasteRowAfter',
    icon: 'paste-row-after',
    onSetup: selectionTargets.onSetupPasteable(FakeClipboard.getRows)
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
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onFirst)
  });

  addButtonIfRegistered('tablepastecolafter', {
    tooltip: 'Paste column after',
    command: 'mceTablePasteColAfter',
    icon: 'paste-column-after',
    onSetup: selectionTargets.onSetupPasteableColumn(FakeClipboard.getColumns, LockedDisable.onLast)
  });

  addButtonIfRegistered('tableinsertdialog', {
    tooltip: 'Insert table',
    command: 'mceInsertTableDialog',
    icon: 'table',
    onSetup: onSetupEditable(editor)
  });

  const tableClassList = filterNoneItem(Options.getTableClassList(editor));
  if (tableClassList.length !== 0 && editor.queryCommandSupported('mceTableToggleClass')) {
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
  if (tableCellClassList.length !== 0 && editor.queryCommandSupported('mceTableCellToggleClass')) {
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

  // TODO: TINY-8172 Unwind this when an alternative solution is found
  if (editor.queryCommandSupported('mceTableApplyCellStyle')) {
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
  }

  addToggleButtonIfRegistered('tablecaption', {
    tooltip: 'Table caption',
    icon: 'table-caption',
    command: 'mceTableToggleCaption',
    onSetup: selectionTargets.onSetupTableWithCaption
  });

  addToggleButtonIfRegistered('tablerowheader', {
    tooltip: 'Row header',
    icon: 'table-top-header',
    command: 'mceTableRowType',
    onAction: changeRowHeader(editor),
    onSetup: selectionTargets.onSetupTableRowHeaders
  });

  addToggleButtonIfRegistered('tablecolheader', {
    tooltip: 'Column header',
    icon: 'table-left-header',
    command: 'mceTableColType',
    onAction: changeColumnHeader(editor),
    onSetup: selectionTargets.onSetupTableColumnHeaders
  });
};

const addToolbars = (editor: Editor): void => {
  const isEditableTable = (table: Node) => editor.dom.is(table, 'table') && editor.getBody().contains(table) && editor.dom.isEditable(table.parentNode);

  const toolbar = Options.getToolbar(editor);
  if (toolbar.length > 0) {
    editor.ui.registry.addContextToolbar('table', {
      predicate: isEditableTable,
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
