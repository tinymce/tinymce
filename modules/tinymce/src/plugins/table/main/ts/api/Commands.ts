/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Fun, Obj, Optional, Type } from '@ephox/katamari';
import { CopyCols, CopyRows, Sizes, TableFill, TableLookup } from '@ephox/snooker';
import { Insert, Remove, Replication, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { enforceNone, enforcePercentage, enforcePixels } from '../actions/EnforceUnit';
import { insertTableWithDataValidation } from '../actions/InsertTable';
import { AdvancedPasteTableAction, CombinedTargetsTableAction, TableActionResult, TableActions } from '../actions/TableActions';
import * as Events from '../api/Events';
import { Clipboard } from '../core/Clipboard';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import { CellSelectionApi } from '../selection/CellSelection';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialog from '../ui/CellDialog';
import { DomModifier } from '../ui/DomModifier';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';
import { isPercentagesForced, isPixelsForced, isResponsiveForced } from './Settings';

const getSelectionStartCellOrCaption = (editor: Editor) => TableSelection.getSelectionStartCellOrCaption(Util.getSelectionStart(editor), Util.getIsRoot(editor));
const getSelectionStartCell = (editor: Editor) => TableSelection.getSelectionStartCell(Util.getSelectionStart(editor), Util.getIsRoot(editor));

const registerCommands = (editor: Editor, actions: TableActions, cellSelection: CellSelectionApi, selections: Selections, clipboard: Clipboard) => {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = () => getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
    TableLookup.table(cellOrCaption, isRoot).filter(Fun.not(isRoot)).each((table) => {
      const cursor = SugarElement.fromText('');
      Insert.after(table, cursor);
      Remove.remove(table);

      if (editor.dom.isEmpty(editor.getBody())) {
        editor.setContent('');
        editor.selection.setCursorLocation();
      } else {
        const rng = editor.dom.createRng();
        rng.setStart(cursor.dom, 0);
        rng.setEnd(cursor.dom, 0);
        editor.selection.setRng(rng);
        editor.nodeChanged();
      }
    });
  });

  const setSizingMode = (sizing: string) => getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
    // Do nothing if tables are forced to use a specific sizing mode
    const isForcedSizing = isResponsiveForced(editor) || isPixelsForced(editor) || isPercentagesForced(editor);
    if (!isForcedSizing) {
      TableLookup.table(cellOrCaption, isRoot).each((table) => {
        if (sizing === 'relative' && !Sizes.isPercentSizing(table)) {
          enforcePercentage(editor, table);
        } else if (sizing === 'fixed' && !Sizes.isPixelSizing(table)) {
          enforcePixels(editor, table);
        } else if (sizing === 'responsive' && !Sizes.isNoneSizing(table)) {
          enforceNone(table);
        }
        Util.removeDataStyle(table);
        Events.fireTableModified(editor, table.dom, Events.structureModified);
      });
    }
  });

  const getTableFromCell = (cell: SugarElement<HTMLTableCellElement>) => TableLookup.table(cell, isRoot);

  const postExecute = (table: SugarElement<HTMLTableElement>) => (data: TableActionResult): void => {
    editor.selection.setRng(data.rng);
    editor.focus();
    cellSelection.clear(table);
    Util.removeDataStyle(table);
    Events.fireTableModified(editor, table.dom, data.effect);
  };

  const actOnSelection = (execute: CombinedTargetsTableAction): void =>
    getSelectionStartCell(editor).each((cell) => {
      getTableFromCell(cell).each((table) => {
        const targets = TableTargets.forMenu(selections, table, cell);
        execute(table, targets).each(postExecute(table));
      });
    });

  const copyRowSelection = () => getSelectionStartCell(editor).map((cell) =>
    getTableFromCell(cell).bind((table) => {
      const targets = TableTargets.forMenu(selections, table, cell);
      const generators = TableFill.cellOperations(Fun.noop, SugarElement.fromDom(editor.getDoc()), Optional.none());
      return CopyRows.copyRows(table, targets, generators);
    }));

  const copyColSelection = () => getSelectionStartCell(editor).map((cell) =>
    getTableFromCell(cell).bind((table) => {
      const targets = TableTargets.forMenu(selections, table, cell);
      return CopyCols.copyCols(table, targets);
    }));

  const pasteOnSelection = (execute: AdvancedPasteTableAction, getRows: () => Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>) =>
    // If we have clipboard rows to paste
    getRows().each((rows) => {
      const clonedRows = Arr.map(rows, (row) => Replication.deep<HTMLTableColElement | HTMLTableRowElement>(row));
      getSelectionStartCell(editor).each((cell) =>
        getTableFromCell(cell).each((table) => {
          const generators = TableFill.paste(SugarElement.fromDom(editor.getDoc()));
          const targets = TableTargets.pasteRows(selections, cell, clonedRows, generators);
          execute(table, targets).each(postExecute(table));
        })
      );
    });

  // Register action commands
  Obj.each({
    mceTableSplitCells: () => actOnSelection(actions.unmergeCells),
    mceTableMergeCells: () => actOnSelection(actions.mergeCells),
    mceTableInsertRowBefore: () => actOnSelection(actions.insertRowsBefore),
    mceTableInsertRowAfter: () => actOnSelection(actions.insertRowsAfter),
    mceTableInsertColBefore: () => actOnSelection(actions.insertColumnsBefore),
    mceTableInsertColAfter: () => actOnSelection(actions.insertColumnsAfter),
    mceTableDeleteCol: () => actOnSelection(actions.deleteColumn),
    mceTableDeleteRow: () => actOnSelection(actions.deleteRow),
    mceTableCutCol: (_grid) => copyColSelection().each((selection) => {
      clipboard.setColumns(selection);
      actOnSelection(actions.deleteColumn);
    }),
    mceTableCutRow: (_grid) => copyRowSelection().each((selection) => {
      clipboard.setRows(selection);
      actOnSelection(actions.deleteRow);
    }),
    mceTableCopyCol: (_grid) => copyColSelection().each((selection) => clipboard.setColumns(selection)),
    mceTableCopyRow: (_grid) => copyRowSelection().each((selection) => clipboard.setRows(selection)),
    mceTablePasteColBefore: (_grid) => pasteOnSelection(actions.pasteColsBefore, clipboard.getColumns),
    mceTablePasteColAfter: (_grid) => pasteOnSelection(actions.pasteColsAfter, clipboard.getColumns),
    mceTablePasteRowBefore: (_grid) => pasteOnSelection(actions.pasteRowsBefore, clipboard.getRows),
    mceTablePasteRowAfter: (_grid) => pasteOnSelection(actions.pasteRowsAfter, clipboard.getRows),
    mceTableDelete: eraseTable,
    mceTableSizingMode: (ui: boolean, sizing: string) => setSizingMode(sizing)
  }, (func, name) => editor.addCommand(name, func));

  // Due to a bug, we need to pass through a reference to the table obtained before the modification
  const fireTableModifiedForSelection = (editor: Editor, tableOpt: Optional<SugarElement<HTMLTableElement>>): void => {
    // Due to the same bug, the selection may incorrectly be on a row so we can't use getSelectionStartCell here
    tableOpt.each((table) => {
      Events.fireTableModified(editor, table.dom, Events.structureModified);
    });
  };

  Obj.each({
    mceTableCellType: (_ui, args) => {
      const tableOpt = TableLookup.table(Util.getSelectionStart(editor), isRoot);
      actions.setTableCellType(editor, args);
      fireTableModifiedForSelection(editor, tableOpt);
    },
    mceTableRowType: (_ui, args) => {
      const tableOpt = TableLookup.table(Util.getSelectionStart(editor), isRoot);
      actions.setTableRowType(editor, args);
      fireTableModifiedForSelection(editor, tableOpt);
    },
  }, (func, name) => editor.addCommand(name, func));

  editor.addCommand('mceTableColType', (_ui, args) =>
    Obj.get(args, 'type').each((type) =>
      actOnSelection(type === 'th' ? actions.makeColumnsHeader : actions.unmakeColumnsHeader)
    ));

  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor, selections)
  }, (func, name) => editor.addCommand(name, () => func()));

  editor.addCommand('mceInsertTable', (_ui, args) => {
    if (Type.isObject(args) && Obj.keys(args).length > 0) {
      insertTableWithDataValidation(editor, args.rows, args.columns, args.options, 'Invalid values for mceInsertTable - rows and columns values are required to insert a table.');
    } else {
      TableDialog.open(editor, true);
    }
  });

  // Apply cell style using command (background color, border color, border style and border width)
  // tinyMCE.activeEditor.execCommand('mceTableApplyCellStyle', false, { backgroundColor: 'red', borderColor: 'blue' })
  // Remove cell style using command (an empty string indicates to remove the style)
  // tinyMCE.activeEditor.execCommand('mceTableApplyCellStyle', false, { backgroundColor: '' })
  editor.addCommand('mceTableApplyCellStyle', (_ui: boolean, args: Record<string, string>) => {
    const getFormatName = (style: string) => 'tablecell' + style.toLowerCase().replace('-', '');

    if (!Type.isObject(args)) {
      return;
    }
    const cells = TableSelection.getCellsFromSelection(Util.getSelectionStart(editor), selections, isRoot);
    if (cells.length === 0) {
      return;
    }

    const validArgs = Obj.filter(args, (value, style) =>
      editor.formatter.has(getFormatName(style)) && Type.isString(value)
    );
    if (Obj.isEmpty(validArgs)) {
      return;
    }

    Obj.each(validArgs, (value, style) => {
      Arr.each(cells, (cell) => {
        DomModifier.normal(editor, cell.dom).setFormat(getFormatName(style), value);
      });
    });

    /*
      Use the first cell in the selection to get the table and fire the TableModified event.
      If this command is applied over multiple tables, only the first table selected
      will have a TableModified event thrown.
    */
    getTableFromCell(cells[0]).each(
      (table) => Events.fireTableModified(editor, table.dom, Events.styleModified)
    );
  });

};

export { registerCommands };
