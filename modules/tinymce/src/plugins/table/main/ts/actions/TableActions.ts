/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import { CellMutations, ResizeBehaviour, ResizeWire, RunOperation, TableFill, TableGridSize, TableSection, TableOperations } from '@ephox/snooker';
import { SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import { getCloneElements, isResizeTableColumnResizing, getTableHeaderType } from '../api/Settings';
import * as Util from '../core/Util';
import * as TableSize from '../queries/TableSize';

type TableAction<T> = (table: SugarElement<HTMLTableElement>, target: T) => Optional<TableActionResult>;
export interface TableActionResult {
  readonly rng: Range;
  readonly effect: Events.TableEventData;
}
export type CombinedTargetsTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;
export type LookupAction = (table: SugarElement<HTMLTableElement>, target: RunOperation.TargetSelection) => string;

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
  makeCellsHeader: CombinedTargetsTableAction;
  unmakeCellsHeader: CombinedTargetsTableAction;
  makeColumnsHeader: CombinedTargetsTableAction;
  unmakeColumnsHeader: CombinedTargetsTableAction;
  makeRowsHeader: CombinedTargetsTableAction;
  makeRowsBody: CombinedTargetsTableAction;
  makeRowsFooter: CombinedTargetsTableAction;
  getTableRowType: LookupAction;
  getTableCellType: LookupAction;
  getTableColType: LookupAction;
}

export const TableActions = (editor: Editor, lazyWire: () => ResizeWire): TableActions => {
  const isTableBody = (editor: Editor) => SugarNode.name(Util.getBody(editor)) === 'table';

  const lastRowGuard = (table: SugarElement<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).rows > 1;

  const lastColumnGuard = (table: SugarElement<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).columns > 1;

  // Optional.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const colMutationOp = isResizeTableColumnResizing(editor) ? Fun.noop : CellMutations.halve;

  const getTableSectionType = (table: SugarElement<HTMLTableElement>) => {
    switch (getTableHeaderType(editor)) {
      case 'section':
        return TableSection.section();
      case 'sectionCells':
        return TableSection.sectionCells();
      case 'cells':
        return TableSection.cells();
      default:
        // Attempt to automatically find the type. If a type can't be found
        // then fallback to "section" to maintain backwards compatibility.
        return TableSection.getTableSectionType(table, 'section');
    }
  };

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard: GuardFn, mutate: MutateFn, lazyWire: () => ResizeWire, effect: Events.TableEventData) =>
    (table: SugarElement<HTMLTableElement>, target: T): Optional<TableActionResult> => {
      Util.removeDataStyle(table);
      const wire = lazyWire();
      const doc = SugarElement.fromDom(editor.getDoc());
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      const behaviours: RunOperation.OperationBehaviours = {
        sizing: TableSize.get(editor, table),
        resize: isResizeTableColumnResizing(editor) ? ResizeBehaviour.resizeTable() : ResizeBehaviour.preserveTable(),
        section: getTableSectionType(table)
      };
      return guard(table) ? operation(wire, table, target, generators, behaviours).bind((result) => {
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

  const makeCellsHeader = execute(TableOperations.makeCellsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);
  const unmakeCellsHeader = execute(TableOperations.unmakeCellsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const makeColumnsHeader = execute(TableOperations.makeColumnsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);
  const unmakeColumnsHeader = execute(TableOperations.unmakeColumnsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const makeRowsHeader = execute(TableOperations.makeRowsHeader, Fun.always, Fun.noop, lazyWire, Events.structureModified);
  const makeRowsBody = execute(TableOperations.makeRowsBody, Fun.always, Fun.noop, lazyWire, Events.structureModified);
  const makeRowsFooter = execute(TableOperations.makeRowsFooter, Fun.always, Fun.noop, lazyWire, Events.structureModified);

  const getTableCellType = TableOperations.getCellsType;
  const getTableColType = TableOperations.getColumnsType;
  const getTableRowType = TableOperations.getRowsType;

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
    makeCellsHeader,
    unmakeCellsHeader,
    makeColumnsHeader,
    unmakeColumnsHeader,
    makeRowsHeader,
    makeRowsBody,
    makeRowsFooter,
    getTableRowType,
    getTableCellType,
    getTableColType
  };
};
