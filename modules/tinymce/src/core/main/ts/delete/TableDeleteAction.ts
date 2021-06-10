/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Optional, Optionals } from '@ephox/katamari';
import { Compare, SelectorFilter, SugarElement } from '@ephox/sugar';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';

export interface DeleteActionAdt {
  fold: <T> (
    removeTable: (element: SugarElement<HTMLTableElement>) => T,
    emptyCells: (cells: SugarElement<HTMLTableCellElement>[]) => T,
    deleteCellSelection: (rng: Range, cell: SugarElement<HTMLTableCellElement>) => T,
  ) => T;
  match: <T> (branches: {
    removeTable: (element: SugarElement<HTMLTableElement>) => T;
    emptyCells: (cells: SugarElement<HTMLTableCellElement>[]) => T;
    deleteCellSelection: (rng: Range, cell: SugarElement<HTMLTableCellElement>) => T;
  }) => T;
  log: (label: string) => void;
}

interface TableCellRng {
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly end: SugarElement<HTMLTableCellElement>;
}

 type IsRootFn = (e: SugarElement<any>) => boolean;

const tableCellRng = (start: SugarElement<HTMLTableCellElement>, end: SugarElement<HTMLTableCellElement>): TableCellRng => ({
  start,
  end
});

interface TableSelection {
  readonly rng: TableCellRng;
  readonly table: SugarElement<HTMLTableElement>;
  readonly cells: SugarElement<HTMLTableCellElement>[];
}

const tableSelection = (rng: TableCellRng, table: SugarElement<HTMLTableElement>, cells: SugarElement<HTMLTableCellElement>[]): TableSelection => ({
  rng,
  table,
  cells
});

const deleteAction = Adt.generate([
  { removeTable: [ 'element' ] },
  { emptyCells: [ 'cells' ] },
  { deleteCellSelection: [ 'rng', 'cell' ] }
]);

const isRootFromElement = (root: SugarElement<any>): IsRootFn =>
  (cur: SugarElement<any>): boolean => Compare.eq(root, cur);

const isExpandedCellRng = (cellRng: TableCellRng): boolean =>
  !Compare.eq(cellRng.start, cellRng.end);

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: IsRootFn): Optional<SugarElement<HTMLTableElement>> =>
  TableCellSelection.getClosestTable(cellRng.start, isRoot)
    .bind((startParentTable) =>
      TableCellSelection.getClosestTable(cellRng.end, isRoot)
        .bind((endParentTable) => Optionals.someIf(Compare.eq(startParentTable, endParentTable), startParentTable)));

const isSingleCellTable = (cellRng: TableCellRng, isRoot: IsRootFn) => !isExpandedCellRng(cellRng) &&
   getTableFromCellRng(cellRng, isRoot).exists((table) => {
     const rows = table.dom.rows;
     return rows.length === 1 && rows[0].cells.length === 1;
   });

const getTableCells = (table: SugarElement<HTMLTableElement>) => SelectorFilter.descendants<HTMLTableCellElement>(table, 'td,th');

const getCellRng = (rng: Range, isRoot: IsRootFn): Optional<TableCellRng> => {
  const startCell = TableCellSelection.getClosestCell(rng.startContainer, isRoot);
  const endCell = TableCellSelection.getClosestCell(rng.endContainer, isRoot);
  return Optionals.lift2(startCell, endCell, tableCellRng);
};

const getCellRangeFromStartTable = (startCell: SugarElement<HTMLTableCellElement>, isRoot: IsRootFn): Optional<TableCellRng> =>
  TableCellSelection.getClosestTable(startCell, isRoot).bind((table) =>
    Arr.last(getTableCells(table)).map((endCell) => tableCellRng(startCell, endCell))
  );

const getCellRangeFromEndTable = (endCell: SugarElement<HTMLTableCellElement>, isRoot: IsRootFn): Optional<TableCellRng> =>
  TableCellSelection.getClosestTable(endCell, isRoot).bind((table) =>
    Arr.head(getTableCells(table)).map((startCell) => tableCellRng(startCell, endCell))
  );

const partialSelection = (isRoot: IsRootFn, rng: Range): Optional<TableCellRng> => {
  if (rng.collapsed) {
    return Optional.none();
  } else {
    const startCell = TableCellSelection.getClosestCell(rng.startContainer, isRoot);
    const endCell = TableCellSelection.getClosestCell(rng.endContainer, isRoot);

    return Optionals.lift2(startCell, endCell, tableCellRng).fold(
      () => startCell.fold(
        () => endCell.bind((endCell) => getCellRangeFromEndTable(endCell, isRoot)),
        (startCell) => getCellRangeFromStartTable(startCell, isRoot)
      ),
      (cellRng) => isWithinSameTable(isRoot, cellRng) ? Optional.none() : getCellRangeFromStartTable(cellRng.start, isRoot)
    );
  }
};

const isWithinSameTable = (isRoot: IsRootFn, cellRng: TableCellRng) =>
  getTableFromCellRng(cellRng, isRoot).isSome();

/*
 * This function will return 0, 1 or 2 tableSelections
 * - 0 should be not be possible
 * - 1 tableSelection is returned if:
 *  - start and end are in the same table
 *  - start is in a table but the end is not and vice versa
 * - 2 tableSelections are returned if the start and end are in different tables
 */
const getTableSelectionsFromCellRng = (cellRng: TableCellRng, isRoot: IsRootFn): TableSelection[] => {
  const toTableSelection = (cellRng: TableCellRng) =>
    getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, getTableCells(table)));

  if (isWithinSameTable(isRoot, cellRng)) {
    return toTableSelection(cellRng).toArray();
  } else {
    const startCellRng = getCellRangeFromStartTable(cellRng.start, isRoot).bind(toTableSelection).toArray();
    const endCellRng = getCellRangeFromEndTable(cellRng.end, isRoot).bind(toTableSelection).toArray();
    return startCellRng.concat(endCellRng);
  }
};

const getTableSelection = (optCellRng: Optional<TableCellRng>, rng: Range, isRoot: IsRootFn) =>
  optCellRng
    .filter((cellRng) => isExpandedCellRng(cellRng))
    .orThunk(() => partialSelection(isRoot, rng))
    .map((cRng) => getTableSelectionsFromCellRng(cRng, isRoot));

const getCellIndex = <T> (cells: SugarElement<T>[], cell: SugarElement<T>): Optional<number> =>
  Arr.findIndex(cells, (x) => Compare.eq(x, cell));

const getSelectedCells = (tableSelection: TableSelection): SugarElement<HTMLTableCellElement>[] =>
  Optionals.lift2(
    getCellIndex(tableSelection.cells, tableSelection.rng.start),
    getCellIndex(tableSelection.cells, tableSelection.rng.end),
    (startIndex, endIndex) => tableSelection.cells.slice(startIndex, endIndex + 1)
  ).getOr([]);

const isSingleCellTableContentSelected = (optCellRng: Optional<TableCellRng>, rng: Range, isRoot: IsRootFn): boolean =>
  optCellRng.exists((cellRng) => isSingleCellTable(cellRng, isRoot) && SelectionUtils.hasAllContentsSelected(cellRng.start, rng));

const getAction = (tableSelections: TableSelection[]): Optional<DeleteActionAdt> => {
  const selectedCells = Arr.bind(tableSelections, getSelectedCells);
  if (tableSelections.length === 1 && tableSelections[0].cells.length === selectedCells.length) {
    return Optional.some(deleteAction.removeTable(tableSelections[0].table));
  } else if (selectedCells.length > 0) {
    return Optional.some(deleteAction.emptyCells(selectedCells));
  } else {
    return Optional.none();
  }
};

export const getActionFromCells = (cells: SugarElement<Element>[]): DeleteActionAdt =>
  deleteAction.emptyCells(cells);

export const getActionFromRange = (root: SugarElement, rng: Range): Optional<DeleteActionAdt> => {
  const isRoot = isRootFromElement(root);
  // Will be 'some' if the selection is fully contained within the same table or if the start is one table and the end is in another table
  const optCellRng = getCellRng(rng, isRoot);

  if (isSingleCellTableContentSelected(optCellRng, rng, isRoot)) {
    return optCellRng.map((cellRng) => deleteAction.deleteCellSelection(rng, cellRng.start));
  } else {
    return getTableSelection(optCellRng, rng, isRoot).bind(getAction);
  }
};
