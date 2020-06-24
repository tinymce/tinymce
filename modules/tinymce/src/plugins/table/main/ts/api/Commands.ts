/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Option, Type } from '@ephox/katamari';
import { CopyCols, CopyRows, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Insert, Remove, Replication } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { insertTableWithDataValidation } from '../actions/InsertTable';
import { AdvancedPasteTableAction, BasicTableAction, TableActions } from '../actions/TableActions';
import { Clipboard } from '../core/Clipboard';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import { CellSelectionApi } from '../selection/CellSelection';
import { Selections } from '../selection/Selections';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialog from '../ui/CellDialog';
import { DomModifier } from '../ui/DomModifier';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

const registerCommands = (editor: Editor, actions: TableActions, cellSelection: CellSelectionApi, selections: Selections, clipboard: Clipboard) => {
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

  const actOnSelection = (execute: BasicTableAction): void => TableSelection.getSelectionStartCell(editor).each((cell) => {
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

  const copyRowSelection = () => TableSelection.getSelectionStartCell(editor).map((cell) =>
    getTableFromCell(cell).bind((table) => {
      const targets = TableTargets.forMenu(selections, table, cell);
      const generators = TableFill.cellOperations(Fun.noop, Element.fromDom(editor.getDoc()), Option.none());
      return CopyRows.copyRows(table, targets, generators);
    }));

  const copyColSelection = () => TableSelection.getSelectionStartCell(editor).map((cell) =>
    getTableFromCell(cell).bind((table) => {
      const targets = TableTargets.forMenu(selections, table, cell);
      return CopyCols.copyCols(table, targets);
    }));

  const pasteOnSelection = (execute: AdvancedPasteTableAction, getRows: () => Option<Element<HTMLTableRowElement>[]>) =>
    // If we have clipboard rows to paste
    getRows().each((rows) => {
      const clonedRows = Arr.map(rows, (row) => Replication.deep(row));
      TableSelection.getSelectionStartCell(editor).each((cell) =>
        getTableFromCell(cell).each((table) => {
          const generators = TableFill.paste(Element.fromDom(editor.getDoc()));
          const targets = TableTargets.pasteRows(selections, cell, clonedRows, generators);
          execute(table, targets).each((rng) => {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
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
    mceTableDelete: eraseTable
  }, (func, name) => editor.addCommand(name, func));

  Obj.each({
    mceTableCellType: (_ui, args) => actions.setTableCellType(editor, args),
    mceTableRowType: (_ui, args) => actions.setTableRowType(editor, args)
  }, (func, name) => editor.addCommand(name, func));

  editor.addCommand('mceTableColumnType', (_ui, args) =>
    Obj.get(args, 'type').each((type) =>
      actOnSelection(type === 'th' ? actions.makeColumnHeader : actions.unmakeColumnHeader)
    ));

  Obj.each({
    mceTableRowType: () => actions.getTableRowType(editor),
    mceTableCellType: () => actions.getTableCellType(editor),
    mceTableColType: () => TableSelection.getSelectionStartCell(editor).bind((cell) =>
      getTableFromCell(cell).map((table): string => {
        const targets = TableTargets.forMenu(selections, table, cell);
        return actions.getTableColType(table, targets);
      })
    ).getOr('')
  }, (func, name) => editor.addQueryValueHandler(name, func));

  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
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
    if (!Type.isObject(args)) {
      return;
    }

    const cells = TableSelection.getCellsFromSelection(editor);
    if (cells.length === 0) {
      return;
    }

    Obj.each(args, (value, style) => {
      const formatName = 'tablecell' + style.toLowerCase().replace('-', '');
      if (editor.formatter.has(formatName) && Type.isString(value)) {
        Arr.each(cells, (cell) => {
          DomModifier.normal(editor, cell).setFormat(formatName, value);
        });
      }
    });
  });

};

export { registerCommands };

