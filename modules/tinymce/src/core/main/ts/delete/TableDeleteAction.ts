import { Adt, Arr, Optional, Optionals } from '@ephox/katamari';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as TableDeleteUtils from './TableDeleteUtils';

type IsRootFn = TableDeleteUtils.IsRootFn;
type SelectionDetails = TableDeleteUtils.TableSelectionDetails;

export interface OutsideTableDetails extends SelectionDetails {
  readonly rng: Range;
}

type SingleCellTableFn<T> = (rng: Range, cell: SugarElement<HTMLTableCellElement>) => T;
type FullTableFn<T> = (table: SugarElement<HTMLTableElement>) => T;
type PartialTableFn<T> = (cells: SugarElement<HTMLTableCellElement>[], outsideDetails: Optional<OutsideTableDetails>) => T;
type MultiTableFn<T> = (startTableCells: SugarElement<HTMLTableCellElement>[], endTableCells: SugarElement<HTMLTableCellElement>[], betweenRng: Range) => T;

export interface DeleteActionAdt {
  fold: <T> (
    singleCellTable: SingleCellTableFn<T>,
    fullTable: FullTableFn<T>,
    partialTable: PartialTableFn<T>,
    multiTable: MultiTableFn<T>,
  ) => T;
  match: <T> (branches: {
    singleCellTable: SingleCellTableFn<T>;
    fullTable: FullTableFn<T>;
    partialTable: PartialTableFn<T>;
    multiTable: MultiTableFn<T>;
  }) => T;
  log: (label: string) => void;
}

interface TableCellRng {
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly end: SugarElement<HTMLTableCellElement>;
}

interface TableSelection {
  readonly rng: TableCellRng;
  readonly table: SugarElement<HTMLTableElement>;
  readonly cells: SugarElement<HTMLTableCellElement>[];
}

interface TableSelections {
  readonly start: Optional<TableSelection>;
  readonly end: Optional<TableSelection>;
}

const tableCellRng = (start: SugarElement<HTMLTableCellElement>, end: SugarElement<HTMLTableCellElement>): TableCellRng => ({
  start,
  end,
});

const tableSelection = (rng: TableCellRng, table: SugarElement<HTMLTableElement>, cells: SugarElement<HTMLTableCellElement>[]): TableSelection => ({
  rng,
  table,
  cells
});

const deleteAction: {
  singleCellTable: SingleCellTableFn<DeleteActionAdt>;
  fullTable: FullTableFn<DeleteActionAdt>;
  partialTable: PartialTableFn<DeleteActionAdt>;
  multiTable: MultiTableFn<DeleteActionAdt>;
} = Adt.generate([
  { singleCellTable: [ 'rng', 'cell' ] },
  { fullTable: [ 'table' ] },
  { partialTable: [ 'cells', 'outsideDetails' ] },
  { multiTable: [ 'startTableCells', 'endTableCells', 'betweenRng' ] },
]);

const getClosestCell = (container: Node, isRoot: (e: SugarElement<Node>) => boolean): Optional<SugarElement<HTMLTableCellElement>> =>
  SelectorFind.closest<HTMLTableCellElement>(SugarElement.fromDom(container), 'td,th', isRoot);

const isExpandedCellRng = (cellRng: TableCellRng): boolean =>
  !Compare.eq(cellRng.start, cellRng.end);

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: IsRootFn): Optional<SugarElement<HTMLTableElement>> =>
  TableCellSelection.getClosestTable(cellRng.start, isRoot)
    .bind((startParentTable) =>
      TableCellSelection.getClosestTable(cellRng.end, isRoot)
        .bind((endParentTable) => Optionals.someIf(Compare.eq(startParentTable, endParentTable), startParentTable)));

const isSingleCellTable = (cellRng: TableCellRng, isRoot: IsRootFn): boolean => !isExpandedCellRng(cellRng) &&
   getTableFromCellRng(cellRng, isRoot).exists((table) => {
     const rows = table.dom.rows;
     return rows.length === 1 && rows[0].cells.length === 1;
   });

const getCellRng = (rng: Range, isRoot: IsRootFn): Optional<TableCellRng> => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);
  return Optionals.lift2(startCell, endCell, tableCellRng);
};

const getCellRangeFromStartTable = (isRoot: IsRootFn) => (startCell: SugarElement<HTMLTableCellElement>): Optional<TableCellRng> =>
  TableCellSelection.getClosestTable(startCell, isRoot).bind((table) =>
    Arr.last(TableDeleteUtils.getTableCells(table)).map((endCell) => tableCellRng(startCell, endCell))
  );

const getCellRangeFromEndTable = (isRoot: IsRootFn) => (endCell: SugarElement<HTMLTableCellElement>): Optional<TableCellRng> =>
  TableCellSelection.getClosestTable(endCell, isRoot).bind((table) =>
    Arr.head(TableDeleteUtils.getTableCells(table)).map((startCell) => tableCellRng(startCell, endCell))
  );

const getTableSelectionFromCellRng = (isRoot: IsRootFn) => (cellRng: TableCellRng): Optional<TableSelection> =>
  getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, TableDeleteUtils.getTableCells(table)));

const getTableSelections = (cellRng: Optional<TableCellRng>, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): Optional<TableSelections> => {
  if (rng.collapsed || !cellRng.forall(isExpandedCellRng)) {
    return Optional.none();
  } else if (selectionDetails.isSameTable) {
    const sameTableSelection = cellRng.bind(getTableSelectionFromCellRng(isRoot));
    return Optional.some({
      start: sameTableSelection,
      end: sameTableSelection
    });
  } else {
    // Covers partial table selection (either start or end will have a tableSelection) and multitable selection (both start and end will have a tableSelection)
    const startCell = getClosestCell(rng.startContainer, isRoot);
    const endCell = getClosestCell(rng.endContainer, isRoot);
    const startTableSelection = startCell
      .bind(getCellRangeFromStartTable(isRoot))
      .bind(getTableSelectionFromCellRng(isRoot));
    const endTableSelection = endCell
      .bind(getCellRangeFromEndTable(isRoot))
      .bind(getTableSelectionFromCellRng(isRoot));
    return Optional.some({
      start: startTableSelection,
      end: endTableSelection
    });
  }
};

const getCellIndex = <T> (cells: SugarElement<T>[], cell: SugarElement<T>): Optional<number> =>
  Arr.findIndex(cells, (x) => Compare.eq(x, cell));

const getSelectedCells = (tableSelection: TableSelection) => Optionals.lift2(
  getCellIndex(tableSelection.cells, tableSelection.rng.start),
  getCellIndex(tableSelection.cells, tableSelection.rng.end),
  (startIndex, endIndex) => tableSelection.cells.slice(startIndex, endIndex + 1)
);

const isSingleCellTableContentSelected = (optCellRng: Optional<TableCellRng>, rng: Range, isRoot: IsRootFn): boolean =>
  optCellRng.exists((cellRng) => isSingleCellTable(cellRng, isRoot) && SelectionUtils.hasAllContentsSelected(cellRng.start, rng));

const unselectCells = (rng: Range, selectionDetails: SelectionDetails): Range => {
  const { startTable, endTable } = selectionDetails;
  const otherContentRng = rng.cloneRange();
  // If the table is some, it should be unselected (works for single table and multitable cases)
  startTable.each((table) => otherContentRng.setStartAfter(table.dom));
  endTable.each((table) => otherContentRng.setEndBefore(table.dom));
  return otherContentRng;
};

const handleSingleTable = (cellRng: Optional<TableCellRng>, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): Optional<DeleteActionAdt> =>
  getTableSelections(cellRng, selectionDetails, rng, isRoot)
    .bind(({ start, end }) => start.or(end))
    .bind((tableSelection) => {
      const { isSameTable } = selectionDetails;
      const selectedCells = getSelectedCells(tableSelection).getOr([]);
      if (isSameTable && tableSelection.cells.length === selectedCells.length) {
        return Optional.some(deleteAction.fullTable(tableSelection.table));
      } else if (selectedCells.length > 0) {
        if (isSameTable) {
          return Optional.some(deleteAction.partialTable(selectedCells, Optional.none()));
        } else {
          const otherContentRng = unselectCells(rng, selectionDetails);
          return Optional.some(deleteAction.partialTable(selectedCells, Optional.some({
            ...selectionDetails,
            rng: otherContentRng
          })));
        }
      } else {
        return Optional.none();
      }
    });

const handleMultiTable = (cellRng: Optional<TableCellRng>, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): Optional<DeleteActionAdt> =>
  getTableSelections(cellRng, selectionDetails, rng, isRoot)
    .bind(({ start, end }) => {
      const startTableSelectedCells = start.bind(getSelectedCells).getOr([]);
      const endTableSelectedCells = end.bind(getSelectedCells).getOr([]);
      if (startTableSelectedCells.length > 0 && endTableSelectedCells.length > 0) {
        const otherContentRng = unselectCells(rng, selectionDetails);
        return Optional.some(deleteAction.multiTable(startTableSelectedCells, endTableSelectedCells, otherContentRng));
      } else {
        return Optional.none();
      }
    });

const getActionFromRange = (root: SugarElement<Node>, rng: Range): Optional<DeleteActionAdt> => {
  const isRoot = TableDeleteUtils.isRootFromElement(root);
  const optCellRng = getCellRng(rng, isRoot);
  const selectionDetails = TableDeleteUtils.getTableDetailsFromRange(rng, isRoot);

  if (isSingleCellTableContentSelected(optCellRng, rng, isRoot)) {
    // SingleCellTable
    return optCellRng.map((cellRng) => deleteAction.singleCellTable(rng, cellRng.start));
  } else if (selectionDetails.isMultiTable) {
    // MultiTable
    return handleMultiTable(optCellRng, selectionDetails, rng, isRoot);
  } else {
    // FullTable, PartialTable with no rng or PartialTable with outside rng
    return handleSingleTable(optCellRng, selectionDetails, rng, isRoot);
  }
};

export {
  getActionFromRange
};
