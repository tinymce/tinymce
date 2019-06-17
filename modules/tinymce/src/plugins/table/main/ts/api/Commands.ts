/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option, Cell } from '@ephox/katamari';
import { CopyRows, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Insert, Remove, Replication } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Util from '../alien/Util';
import TableTargets from '../queries/TableTargets';
import CellDialog from '../ui/CellDialog';
import RowDialog from '../ui/RowDialog';
import TableDialog from '../ui/TableDialog';
import { TableActions } from '../actions/TableActions';
import { Selections } from '../selection/Selections';
import * as TableSelection from '../selection/TableSelection';
import * as Events from '../api/Events';

const each = Tools.each;

const registerCommands = (editor: Editor, actions: TableActions, cellSelection, selections: Selections, clipboardRows: Cell<Option<Element[]>>) => {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = () => {
    TableSelection.getSelectionStartCellOrCaption(editor)
      .each((cellOrCaption) => {
        const tableOpt = TableLookup.table(cellOrCaption, isRoot);
        tableOpt.filter(Fun.not(isRoot)).each((table) => {
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
  };

  const getTableFromCell = (cell: Element): Option<Element> => {
    return TableLookup.table(cell, isRoot);
  };

  const getSize = (table) => {
    return {
      width: Util.getPixelWidth(table.dom()),
      height: Util.getPixelWidth(table.dom())
    };
  };

  const resizeChange = (editor: Editor, oldSize, table) => {
    const newSize = getSize(table);

    if (oldSize.width !== newSize.width || oldSize.height !== newSize.height) {
      Events.fireObjectResizeStart(editor, table.dom(), oldSize.width, oldSize.height);
      Events.fireObjectResized(editor, table.dom(), newSize.width, newSize.height);
    }
  };

  const actOnSelection = (execute) => {
    TableSelection.getSelectionStartCell(editor).each((cell) => {
      getTableFromCell(cell).each((table) => {
        const targets = TableTargets.forMenu(selections, table, cell);
        const beforeSize = getSize(table);
        execute(table, targets).each((rng) => {
          resizeChange(editor, beforeSize, table);
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
          Util.removeDataStyle(table);
        });
      });
    });
  };

  const copyRowSelection = (execute?) => {
    return TableSelection.getSelectionStartCell(editor).map((cell) => {
      return getTableFromCell(cell).bind((table) => {
        const doc = Element.fromDom(editor.getDoc());
        const targets = TableTargets.forMenu(selections, table, cell);
        const generators = TableFill.cellOperations(Fun.noop, doc, Option.none());
        return CopyRows.copyRows(table, targets, generators);
      });
    });
  };

  const pasteOnSelection = (execute) => {
    // If we have clipboard rows to paste
    clipboardRows.get().each((rows) => {
      const clonedRows = Arr.map(rows, (row) => {
        return Replication.deep(row);
      });
      TableSelection.getSelectionStartCell(editor).each((cell) => {
        getTableFromCell(cell).each((table) => {
          const doc = Element.fromDom(editor.getDoc());
          const generators = TableFill.paste(doc);
          const targets = TableTargets.pasteRows(selections, table, cell, clonedRows, generators);
          execute(table, targets).each((rng) => {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      });
    });
  };

  // Register action commands
  each({
    mceTableSplitCells () {
      actOnSelection(actions.unmergeCells);
    },

    mceTableMergeCells () {
      actOnSelection(actions.mergeCells);
    },

    mceTableInsertRowBefore () {
      actOnSelection(actions.insertRowsBefore);
    },

    mceTableInsertRowAfter () {
      actOnSelection(actions.insertRowsAfter);
    },

    mceTableInsertColBefore () {
      actOnSelection(actions.insertColumnsBefore);
    },

    mceTableInsertColAfter () {
      actOnSelection(actions.insertColumnsAfter);
    },

    mceTableDeleteCol () {
      actOnSelection(actions.deleteColumn);
    },

    mceTableDeleteRow () {
      actOnSelection(actions.deleteRow);
    },

    mceTableCutRow (grid) {
      copyRowSelection().each((selection) => {
        clipboardRows.set(selection);
        actOnSelection(actions.deleteRow);
      });
    },

    mceTableCopyRow (grid) {
      copyRowSelection().each((selection) => {
        clipboardRows.set(selection);
      });
    },

    mceTablePasteRowBefore (grid) {
      pasteOnSelection(actions.pasteRowsBefore);
    },

    mceTablePasteRowAfter (grid) {
      pasteOnSelection(actions.pasteRowsAfter);
    },

    mceTableDelete: eraseTable
  }, (func, name) => {
    editor.addCommand(name, func);
  });

  // Register dialog commands
  each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceInsertTable: Fun.curry(TableDialog.open, editor, true),
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, (func, name) => {
    editor.addCommand(name, () => {
      func();
    });
  });
};

export default {
  registerCommands
};