/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableElement, Range } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Option } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { CellMutations, ResizeWire, RunOperation, TableDirection, TableFill, TableGridSize, TableOperations } from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { fireNewCell, fireNewRow } from '../api/Events';
import { getCloneElements } from '../api/Settings';
import { getRowType, switchCellType, switchSectionType } from '../core/TableSections';
import * as Util from '../core/Util';
import * as Direction from '../queries/Direction';
import * as TableSize from '../queries/TableSize';
import { getCellsFromSelection, getRowsFromSelection } from '../selection/TableSelection';

type TableAction<T> = (table: Element<HTMLTableElement>, target: T) => Option<Range>;
export type BasicTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;
export type SimpleTableAction = (editor: Editor, args: Record<string, any>) => void;
export type SimpleGetterTableAction = (editor: Editor) => string;
export type GetterTableAction = (table: Element<HTMLTableElement>, target: RunOperation.TargetSelection) => string;
export type ElementTableAction = TableAction<RunOperation.TargetElement>;

export interface TableActions {
  deleteRow: BasicTableAction;
  deleteColumn: BasicTableAction;
  insertRowsBefore: BasicTableAction;
  insertRowsAfter: BasicTableAction;
  insertColumnsBefore: BasicTableAction;
  insertColumnsAfter: BasicTableAction;
  mergeCells: BasicTableAction;
  unmergeCells: BasicTableAction;
  pasteColsBefore: AdvancedPasteTableAction;
  pasteColsAfter: AdvancedPasteTableAction;
  pasteRowsBefore: AdvancedPasteTableAction;
  pasteRowsAfter: AdvancedPasteTableAction;
  pasteCells: PasteTableAction;
  setTableCellType: SimpleTableAction;
  setTableRowType: SimpleTableAction;
  makeColumnHeader: ElementTableAction;
  unmakeColumnHeader: ElementTableAction;
  getTableRowType: SimpleGetterTableAction;
  getTableCellType: SimpleGetterTableAction;
  getTableColType: GetterTableAction;
}

export const TableActions = (editor: Editor, lazyWire: () => ResizeWire): TableActions => {
  const isTableBody = (editor: Editor) => Node.name(Util.getBody(editor)) === 'table';

  const lastRowGuard = (table: Element<HTMLTableElement>) => isTableBody(editor) === false || TableGridSize.getGridSize(table).rows() > 1;

  const lastColumnGuard = (table: Element<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).columns() > 1;

  // Option.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard, mutate, lazyWire) =>
    (table: Element<HTMLTableElement>, target: T): Option<Range> => {
      Util.removeDataStyle(table);
      const wire = lazyWire();
      const doc = Element.fromDom(editor.getDoc());
      const direction = TableDirection(Direction.directionAt);
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      const sizing = TableSize.get(editor, table);
      return guard(table) ? operation(wire, table, target, generators, direction, sizing).bind((result) => {
        Arr.each(result.newRows(), (row) => {
          fireNewRow(editor, row.dom());
        });
        Arr.each(result.newCells(), (cell) => {
          fireNewCell(editor, cell.dom());
        });
        return result.cursor().map((cell) => {
          const des = DomDescent.freefallRtl(cell);
          const rng = editor.dom.createRng();
          rng.setStart(des.element().dom(), des.offset());
          rng.setEnd(des.element().dom(), des.offset());
          return rng;
        });
      }) : Option.none();
    };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, lazyWire);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, lazyWire);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, lazyWire);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, lazyWire);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, CellMutations.halve, lazyWire);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, CellMutations.halve, lazyWire);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, lazyWire);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, lazyWire);

  const pasteColsBefore = execute(TableOperations.pasteColsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteColsAfter = execute(TableOperations.pasteColsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire);

  const setTableCellType = (editor: Editor, args: Record<string, any>) =>
    Obj.get(args, 'type').each((type) => {
      if (Arr.contains([ 'td', 'th' ], type)) {
        switchCellType(editor.dom, getCellsFromSelection(editor), type);
      }
    });

  const setTableRowType = (editor: Editor, args: Record<string, any>) =>
    // type: 'header' | 'body' | 'footer'
    Obj.get(args, 'type').each((type) => {
      if (Arr.contains([ 'header', 'body', 'footer' ], type)) {
        Arr.map(getRowsFromSelection(editor), (row) => switchSectionType(editor, row, type));
      }
    });

  const makeColumnHeader = execute(TableOperations.makeColumnHeader, Fun.always, Fun.noop, lazyWire);
  const unmakeColumnHeader = execute(TableOperations.unmakeColumnHeader, Fun.always, Fun.noop, lazyWire);

  const getTableRowType = (editor: Editor) => {
    const rows = getRowsFromSelection(editor);
    if (rows.length > 0) {
      const rowTypes = Arr.map(rows, (r) => getRowType(editor, r));
      const hasHeader = Arr.contains(rowTypes, 'thead');
      const hasFooter = Arr.contains(rowTypes, 'tfoot');
      if (!hasHeader && !hasFooter) {
        return 'body';
      } else {
        const hasBody = Arr.contains(rowTypes, 'tbody');
        if (hasHeader && !hasBody && !hasFooter) {
          return 'header';
        } else if (hasHeader && hasBody && hasFooter) {
          return 'footer';
        } else {
          return '';
        }
      }
    }
  };

  const getTableCellType = (editor: Editor) => {
    const cells = getCellsFromSelection(editor);
    if (cells.length > 0) {
      const headerCells = Arr.filter(cells, (cell) => Util.getNodeName(cell) === 'th');
      if (cells.length === headerCells.length) {
        return 'th';
      } else if (headerCells.length === 0) {
        return 'td';
      } else {
        return '';
      }
    } else {
      return '';
    }
  };

  const getTableColType = TableOperations.getColumnType;

  return {
    deleteRow,
    deleteColumn,
    insertRowsBefore,
    insertRowsAfter,
    insertColumnsBefore,
    insertColumnsAfter,
    mergeCells,
    unmergeCells,
    pasteColsBefore,
    pasteColsAfter,
    pasteRowsBefore,
    pasteRowsAfter,
    pasteCells,
    setTableCellType,
    setTableRowType,
    makeColumnHeader,
    unmakeColumnHeader,
    getTableRowType,
    getTableCellType,
    getTableColType
  };
};
