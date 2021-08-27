/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import {
  CellMutations, ResizeBehaviour, ResizeWire, RunOperation, TableFill, TableGridSize, TableSection, TableOperations, TableLookup
} from '@ephox/snooker';
import { Attribute, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import { getCloneElements, isResizeTableColumnResizing, getTableHeaderType } from '../api/Settings';
import * as Util from '../core/Util';
import * as TableSize from '../queries/TableSize';
import { CellSelectionApi } from '../selection/CellSelection';

type TableAction<T> = (table: SugarElement<HTMLTableElement>, target: T, noEvents?: boolean) => Optional<TableActionResult>;
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
  readonly deleteRow: CombinedTargetsTableAction;
  readonly deleteColumn: CombinedTargetsTableAction;
  readonly insertRowsBefore: CombinedTargetsTableAction;
  readonly insertRowsAfter: CombinedTargetsTableAction;
  readonly insertColumnsBefore: CombinedTargetsTableAction;
  readonly insertColumnsAfter: CombinedTargetsTableAction;
  readonly mergeCells: CombinedTargetsTableAction;
  readonly unmergeCells: CombinedTargetsTableAction;
  readonly pasteCells: PasteTableAction;
  readonly pasteColsBefore: AdvancedPasteTableAction;
  readonly pasteColsAfter: AdvancedPasteTableAction;
  readonly pasteRowsBefore: AdvancedPasteTableAction;
  readonly pasteRowsAfter: AdvancedPasteTableAction;
  readonly makeCellsHeader: CombinedTargetsTableAction;
  readonly unmakeCellsHeader: CombinedTargetsTableAction;
  readonly makeColumnsHeader: CombinedTargetsTableAction;
  readonly unmakeColumnsHeader: CombinedTargetsTableAction;
  readonly makeRowsHeader: CombinedTargetsTableAction;
  readonly makeRowsBody: CombinedTargetsTableAction;
  readonly makeRowsFooter: CombinedTargetsTableAction;
  readonly getTableRowType: LookupAction;
  readonly getTableCellType: LookupAction;
  readonly getTableColType: LookupAction;
}

export const TableActions = (editor: Editor, cellSelection: CellSelectionApi, lazyWire: () => ResizeWire): TableActions => {
  const isTableBody = (editor: Editor): boolean =>
    SugarNode.name(Util.getBody(editor)) === 'table';

  const lastRowGuard = (table: SugarElement<HTMLTableElement>): boolean =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).rows > 1;

  const lastColumnGuard = (table: SugarElement<HTMLTableElement>): boolean =>
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

  const setSelectionFromAction = (table: SugarElement<HTMLTableElement>, result: RunOperation.RunOperationOutput) =>
    result.cursor.fold(() => {
      // Snooker has reported we don't have a good cursor position. However, we may have a locked column
      // with noneditable cells, so lets check if we have a noneditable cell and if so place the selection
      const cells = TableLookup.cells(table);
      return Arr.head(cells).filter(SugarBody.inBody).map((firstCell) => {
        cellSelection.clear(table);
        const rng = editor.dom.createRng();
        rng.selectNode(firstCell.dom);
        editor.selection.setRng(rng);
        Attribute.set(firstCell, 'data-mce-selected', '1');
        return rng;
      });
    }, (cell) => {
      const des = DomDescent.freefallRtl(cell);
      const rng = editor.dom.createRng();
      rng.setStart(des.element.dom, des.offset);
      rng.setEnd(des.element.dom, des.offset);
      editor.selection.setRng(rng);
      cellSelection.clear(table);
      return Optional.some(rng);
    });

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard: GuardFn, mutate: MutateFn, lazyWire: () => ResizeWire, effect: Events.TableEventData) =>
    (table: SugarElement<HTMLTableElement>, target: T, noEvents: boolean = false): Optional<TableActionResult> => {
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
        // INVESTIGATE: Should "noEvents" prevent these from firing as well?
        Arr.each(result.newRows, (row) => {
          Events.fireNewRow(editor, row.dom);
        });
        Arr.each(result.newCells, (cell) => {
          Events.fireNewCell(editor, cell.dom);
        });

        const range = setSelectionFromAction(table, result);

        if (SugarBody.inBody(table)) {
          Util.removeDataStyle(table);
          if (!noEvents) {
            Events.fireTableModified(editor, table.dom, effect);
          }
        }

        return range.map((rng) => ({
          rng,
          effect
        }));
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

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire, Events.styleAndStructureModified);

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
