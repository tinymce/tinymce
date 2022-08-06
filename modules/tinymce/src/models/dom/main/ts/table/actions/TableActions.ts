import { Arr, Fun, Optional } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import {
  CellMutations, ResizeBehaviour, RunOperation, TableFill, TableGridSize, TableSection, TableOperations, TableLookup
} from '@ephox/snooker';
import { Attribute, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { TableEventData } from 'tinymce/core/api/EventTypes';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import { TableCellSelectionHandler } from '../api/TableCellSelectionHandler';
import { TableResizeHandler } from '../api/TableResizeHandler';
import * as Utils from '../core/TableUtils';
import * as TableSize from '../queries/TableSize';

type TableAction<T> = (table: SugarElement<HTMLTableElement>, target: T, noEvents?: boolean) => Optional<TableActionResult>;
export interface TableActionResult {
  readonly rng: Range;
  readonly effect: TableEventData;
}
export type CombinedTargetsTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;
export type LookupAction = (table: SugarElement<HTMLTableElement>, target: RunOperation.TargetSelection) => string;

type GuardFn = (table: SugarElement<HTMLTableElement>) => boolean;
type MutateFn = (e1: SugarElement<HTMLTableCellElement | HTMLTableColElement>, e2: SugarElement<HTMLTableCellElement | HTMLTableColElement>) => void;

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

export const TableActions = (editor: Editor, resizeHandler: TableResizeHandler, cellSelectionHandler: TableCellSelectionHandler): TableActions => {
  const isTableBody = (editor: Editor): boolean =>
    SugarNode.name(Utils.getBody(editor)) === 'table';

  const lastRowGuard = (table: SugarElement<HTMLTableElement>): boolean =>
    !isTableBody(editor) || TableGridSize.getGridSize(table).rows > 1;

  const lastColumnGuard = (table: SugarElement<HTMLTableElement>): boolean =>
    !isTableBody(editor) || TableGridSize.getGridSize(table).columns > 1;

  // Optional.none gives the default cloneFormats.
  const cloneFormats = Options.getTableCloneElements(editor);

  const colMutationOp = Options.isResizeTableColumnResizing(editor) ? Fun.noop : CellMutations.halve;

  const getTableSectionType = (table: SugarElement<HTMLTableElement>) => {
    switch (Options.getTableHeaderType(editor)) {
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
        cellSelectionHandler.clearSelectedCells(table.dom);
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
      cellSelectionHandler.clearSelectedCells(table.dom);
      return Optional.some(rng);
    });

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard: GuardFn, mutate: MutateFn, effect: TableEventData) =>
    (table: SugarElement<HTMLTableElement>, target: T, noEvents: boolean = false): Optional<TableActionResult> => {
      Utils.removeDataStyle(table);
      const doc = SugarElement.fromDom(editor.getDoc());
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      const behaviours: RunOperation.OperationBehaviours = {
        sizing: TableSize.get(editor, table),
        resize: Options.isResizeTableColumnResizing(editor) ? ResizeBehaviour.resizeTable() : ResizeBehaviour.preserveTable(),
        section: getTableSectionType(table)
      };
      return guard(table) ? operation(table, target, generators, behaviours).bind((result) => {
        // Update the resize bars after the table operation
        resizeHandler.refresh(table.dom);

        // INVESTIGATE: Should "noEvents" prevent these from firing as well?
        Arr.each(result.newRows, (row) => {
          Events.fireNewRow(editor, row.dom);
        });
        Arr.each(result.newCells, (cell) => {
          Events.fireNewCell(editor, cell.dom);
        });

        const range = setSelectionFromAction(table, result);

        if (SugarBody.inBody(table)) {
          Utils.removeDataStyle(table);
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

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, Events.structureModified);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, Events.structureModified);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, Events.structureModified);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, Events.structureModified);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, colMutationOp, Events.structureModified);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, colMutationOp, Events.structureModified);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, Events.structureModified);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, Events.structureModified);

  const pasteColsBefore = execute(TableOperations.pasteColsBefore, Fun.always, Fun.noop, Events.structureModified);

  const pasteColsAfter = execute(TableOperations.pasteColsAfter, Fun.always, Fun.noop, Events.structureModified);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, Events.structureModified);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, Events.structureModified);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, Events.styleAndStructureModified);

  const makeCellsHeader = execute(TableOperations.makeCellsHeader, Fun.always, Fun.noop, Events.structureModified);
  const unmakeCellsHeader = execute(TableOperations.unmakeCellsHeader, Fun.always, Fun.noop, Events.structureModified);

  const makeColumnsHeader = execute(TableOperations.makeColumnsHeader, Fun.always, Fun.noop, Events.structureModified);
  const unmakeColumnsHeader = execute(TableOperations.unmakeColumnsHeader, Fun.always, Fun.noop, Events.structureModified);

  const makeRowsHeader = execute(TableOperations.makeRowsHeader, Fun.always, Fun.noop, Events.structureModified);
  const makeRowsBody = execute(TableOperations.makeRowsBody, Fun.always, Fun.noop, Events.structureModified);
  const makeRowsFooter = execute(TableOperations.makeRowsFooter, Fun.always, Fun.noop, Events.structureModified);

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
