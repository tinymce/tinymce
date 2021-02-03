/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { CellMutations, ResizeBehaviour, ResizeWire, RunOperation, TableFill, TableGridSize, TableOperations } from '@ephox/snooker';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../api/Events';
import { getCloneElements, isResizeTableColumnResizing } from '../api/Settings';
import { getRowType, switchCellsType, switchSectionType } from '../core/TableSections';
import * as Util from '../core/Util';
import * as TableSize from '../queries/TableSize';
import { ephemera } from '../selection/Ephemera';
import { getCellsFromSelection, getRowsFromSelection } from '../selection/TableSelection';

type TableAction<T> = (table: SugarElement<HTMLTableElement>, target: T) => Optional<TableActionResult>;
export interface TableActionResult {
  readonly rng: Range;
  readonly effect: Events.TableEventData;
}
export type SimpleTableAction = (editor: Editor, args: Record<string, any>) => void;
export type CombinedTargetsTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;
export type ElementTableAction = TableAction<RunOperation.TargetElement>;

type GuardFn = (table: SugarElement<HTMLTableElement>) => boolean;
type MutateFn = (e1: SugarElement<any>, e2: SugarElement<any>) => void;

export interface TableActions {
  deleteRow: CombinedTargetsTableAction;
  deleteColumn: CombinedTargetsTableAction;
  insertRowsBefore: CombinedTargetsTableAction;
  insertRowsAfter: CombinedTargetsTableAction;
  insertColumnsBefore: CombinedTargetsTableAction;
  insertColumnsAfter: CombinedTargetsTableAction;
  mergeCells: CombinedTargetsTableAction;
  unmergeCells: CombinedTargetsTableAction;
  pasteCells: PasteTableAction;
  pasteColsBefore: AdvancedPasteTableAction;
  pasteColsAfter: AdvancedPasteTableAction;
  pasteRowsBefore: AdvancedPasteTableAction;
  pasteRowsAfter: AdvancedPasteTableAction;
  setTableCellType: SimpleTableAction;
  setTableRowType: SimpleTableAction;
  makeColumnsHeader: CombinedTargetsTableAction;
  unmakeColumnsHeader: CombinedTargetsTableAction;
  getTableRowType: (editor: Editor) => string;
  getTableCellType: (editor: Editor) => string;
  getTableColType: (table: SugarElement<HTMLTableElement>, target: RunOperation.TargetSelection) => string;
}

export const TableActions = (editor: Editor, lazyWire: () => ResizeWire, selections: Selections): TableActions => {
  const isTableBody = (editor: Editor) => SugarNode.name(Util.getBody(editor)) === 'table';

  const lastRowGuard = (table: SugarElement<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).rows > 1;

  const lastColumnGuard = (table: SugarElement<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).columns > 1;

  // Optional.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const colMutationOp = isResizeTableColumnResizing(editor) ? Fun.noop : CellMutations.halve;

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard: GuardFn, mutate: MutateFn, lazyWire: () => ResizeWire, effect: Events.TableEventData) =>
    (table: SugarElement<HTMLTableElement>, target: T): Optional<TableActionResult> => {
      Util.removeDataStyle(table);
      const wire = lazyWire();
      const doc = SugarElement.fromDom(editor.getDoc());
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      const sizing = TableSize.get(editor, table);
      const resizeBehaviour = isResizeTableColumnResizing(editor) ? ResizeBehaviour.resizeTable() : ResizeBehaviour.preserveTable();
      return guard(table) ? operation(wire, table, target, generators, sizing, resizeBehaviour).bind((result) => {
        Arr.each(result.newRows, (row) => {
          Events.fireNewRow(editor, row.dom);
        });
        Arr.each(result.newCells, (cell) => {
          Events.fireNewCell(editor, cell.dom);
        });
        return result.cursor.map((cell) => {
          const des = DomDescent.freefallRtl(cell);
          const rng = editor.dom.createRng();
          rng.setStart(des.element.dom, des.offset);
          rng.setEnd(des.element.dom, des.offset);
          return {
            rng,
            effect
          };
        });
      }) : Optional.none<TableActionResult>();
    };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, lazyWire, Events.structureModified);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, lazyWire, Events.structureModified);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, colMutationOp, lazyWire, Events.structureModified);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, colMutationOp, lazyWire, Events.structureModified);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const pasteColsBefore = execute(TableOperations.pasteColsBefore, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const pasteColsAfter = execute(TableOperations.pasteColsAfter, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const extractType = (args: Record<string, any>, validTypes: string[]) =>
    Obj.get(args, 'type').filter((type) => Arr.contains(validTypes, type));

  const setTableCellType = (editor: Editor, args: Record<string, any>) =>
    extractType(args, [ 'td', 'th' ]).each((type) => {
      const cells = Arr.map(getCellsFromSelection(Util.getSelectionStart(editor), selections), (c) => c.dom);
      switchCellsType(editor, cells, type, null);
    });

  const setTableRowType = (editor: Editor, args: Record<string, any>) =>
    extractType(args, [ 'header', 'body', 'footer' ]).each((type) => {
      Arr.map(getRowsFromSelection(Util.getSelectionStart(editor), ephemera.selected), (row) => switchSectionType(editor, row.dom, type));
    });

  const makeColumnsHeader = execute(TableOperations.makeColumnsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);
  const unmakeColumnsHeader = execute(TableOperations.unmakeColumnsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const getTableRowType = (editor: Editor): 'header' | 'body' | 'footer' | '' => {
    const rows = getRowsFromSelection(Util.getSelectionStart(editor), ephemera.selected);
    if (rows.length > 0) {
      const rowTypes = Arr.map(rows, (r) => getRowType(editor, r.dom));
      const hasHeader = Arr.contains(rowTypes, 'header');
      const hasFooter = Arr.contains(rowTypes, 'footer');
      if (!hasHeader && !hasFooter) {
        return 'body';
      } else {
        const hasBody = Arr.contains(rowTypes, 'body');
        if (hasHeader && !hasBody && !hasFooter) {
          return 'header';
        } else if (!hasHeader && !hasBody && hasFooter) {
          return 'footer';
        } else {
          return '';
        }
      }
    }
  };

  const getTableCellType = (editor: Editor) =>
    TableOperations.getCellsType(getCellsFromSelection(Util.getSelectionStart(editor), selections), (cell) => SugarNode.name(cell) === 'th').getOr('');

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
    makeColumnsHeader,
    unmakeColumnsHeader,
    getTableRowType,
    getTableCellType,
    getTableColType
  };
};
