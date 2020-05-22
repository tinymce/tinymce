/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Obj, Option } from '@ephox/katamari';
import { CopyRows, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Insert, Remove, Replication } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as InsertTable from '../actions/InsertTable';
import { TableActions } from '../actions/TableActions';
import * as Util from '../alien/Util';
import * as TableTargets from '../queries/TableTargets';
import { Selections } from '../selection/Selections';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialog from '../ui/CellDialog';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

interface InsertTableData {
  rows: number,
  columns: number,
  options: {
    headerRows: number,
    headerColumns: number
  }
}

const registerCommands = (editor: Editor, actions: TableActions, cellSelection, selections: Selections, clipboardRows: Cell<Option<Element[]>>) => {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = () => TableSelection.getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
    TableLookup.table(cellOrCaption, isRoot).filter(Fun.not(isRoot)).each((table) => {
      const cursor = Element.fromText('');
      Insert.after(table, cursor);
      Remove.remove(table);

      if (editor.dom.isEmpty(editor.getBody())) {
        editor.setContent('');
        editor.selection.setCursorLocation();
      } else {
        const rng = editor.dom.createRng();
        rng.setStart(cursor.dom(), 0);
        rng.setEnd(cursor.dom(), 0);
        editor.selection.setRng(rng);
        editor.nodeChanged();
      }
    });
  });

  const getTableFromCell = (cell: Element): Option<Element> => TableLookup.table(cell, isRoot);

  const actOnSelection = (execute) => TableSelection.getSelectionStartCell(editor).each((cell) => {
    getTableFromCell(cell).each((table) => {
      const targets = TableTargets.forMenu(selections, table, cell);
      execute(table, targets).each((rng) => {
        editor.selection.setRng(rng);
        editor.focus();
        cellSelection.clear(table);
        Util.removeDataStyle(table);
      });
    });
  });

  const copyRowSelection = (_execute?) => TableSelection.getSelectionStartCell(editor).map((cell) => getTableFromCell(cell).bind((table) => {
    const targets = TableTargets.forMenu(selections, table, cell);
    const generators = TableFill.cellOperations(Fun.noop, Element.fromDom(editor.getDoc()), Option.none());
    return CopyRows.copyRows(table, targets, generators);
  }));

  const pasteOnSelection = (execute) => clipboardRows.get().each((rows) => {
    // If we have clipboard rows to paste
    const clonedRows = Arr.map(rows, (row) => Replication.deep(row));
    TableSelection.getSelectionStartCell(editor).each((cell) => {
      getTableFromCell(cell).each((table) => {
        const generators = TableFill.paste(Element.fromDom(editor.getDoc()));
        const targets = TableTargets.pasteRows(selections, table, cell, clonedRows, generators);
        execute(table, targets).each((rng) => {
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
        });
      });
    });
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
    mceTableCutRow: (_grid) => copyRowSelection().each((selection) => {
      clipboardRows.set(selection);
      actOnSelection(actions.deleteRow);
    }),
    mceTableCopyRow: (_grid) => copyRowSelection().each((selection) => clipboardRows.set(selection)),
    mceTablePasteRowBefore: (_grid) => pasteOnSelection(actions.pasteRowsBefore),
    mceTablePasteRowAfter: (_grid) => pasteOnSelection(actions.pasteRowsAfter),
    mceTableDelete: eraseTable
  }, (func, name) => editor.addCommand(name, func));

  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, (func, name) => editor.addCommand(name, () => func()));

  const validateInsertTableSchema = ValueSchema.objOf([
    FieldSchema.defaultedNumber('rows', 1),
    FieldSchema.defaultedNumber('columns', 1),
    FieldSchema.defaultedObjOf('options', { headerRows: 0, headerColumns: 0 }, [
      FieldSchema.defaultedNumber('headerRows', 0),
      FieldSchema.defaultedNumber('headerColumns', 0)
    ])
  ]);

  editor.addCommand('mceInsertTable', (_ui, args) => {
    ValueSchema.asRaw<InsertTableData, any>('insertTableData', validateInsertTableSchema, args).fold(
      // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
      () => TableDialog.open(editor, true),
      (data) => InsertTable.insert(editor, data.columns, data.rows, data.options.headerColumns, data.options.headerRows)
    );
  });
};

export { registerCommands };

