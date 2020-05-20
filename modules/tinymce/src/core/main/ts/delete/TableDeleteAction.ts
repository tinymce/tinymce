/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, HTMLTableElement, Node as DomNode, Range } from '@ephox/dom-globals';
import { Adt, Arr, Option, Options } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, SelectorFind } from '@ephox/sugar';
import * as SelectionUtils from '../selection/SelectionUtils';

interface TableCellRng {
  readonly start: Element<DomElement>;
  readonly end: Element<DomElement>;
}

const tableCellRng = (start: Element<DomElement>, end: Element<DomElement>): TableCellRng => ({
  start,
  end
});

interface TableSelection {
  readonly rng: TableCellRng;
  readonly table: Element<DomElement>;
  readonly cells: Element<DomElement>[];
}

const tableSelection = (rng: TableCellRng, table: Element<DomElement>, cells: Element<DomElement>[]): TableSelection => ({
  rng,
  table,
  cells
});

const deleteAction = Adt.generate([
  { removeTable: [ 'element' ] },
  { emptyCells: [ 'cells' ] },
  { deleteCellSelection : [ 'rng', 'cell' ] }
]);

const isRootFromElement = (root: Element<any>): (cur: Element<any>) => boolean =>
  (cur: Element<any>): boolean => Compare.eq(root, cur);

const getClosestCell = (container: DomNode, isRoot: (e: Element<any>) => boolean) => SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);

const getClosestTable = (cell, isRoot) => SelectorFind.ancestor<HTMLTableElement>(cell, 'table', isRoot);

const isExpandedCellRng = (cellRng: TableCellRng): boolean =>
  !Compare.eq(cellRng.start, cellRng.end);

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean): Option<Element<HTMLTableElement>> =>
  getClosestTable(cellRng.start, isRoot)
    .bind((startParentTable) =>
      getClosestTable(cellRng.end, isRoot)
        .bind((endParentTable) => Options.someIf(Compare.eq(startParentTable, endParentTable), startParentTable)));

const isSingleCellTable = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean) => !isExpandedCellRng(cellRng) &&
  getTableFromCellRng(cellRng, isRoot).exists((table) => {
    const rows = table.dom().rows;
    return rows.length === 1 && rows[0].cells.length === 1;
  });

const getTableCells = (table) => SelectorFilter.descendants(table, 'td,th');

const getCellRng = (rng: Range, isRoot: (e: Element<any>) => boolean) => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);
  return Options.lift2(startCell, endCell, tableCellRng);
};

const getCellRangeFromStartTable = (cellRng: TableCellRng, isRoot): Option<TableCellRng> =>
  getClosestTable(cellRng.start, isRoot).bind((table) => Arr.last(getTableCells(table)).map((endCell) => tableCellRng(cellRng.start, endCell)));

const partialSelection = (isRoot: (e: Element<any>) => boolean, rng: Range): Option<TableCellRng> => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);

  return rng.collapsed ? Option.none() : Options.lift2(startCell, endCell, tableCellRng).fold(
    () => startCell.fold(
      () => endCell.bind((endCell) => getClosestTable(endCell, isRoot).bind((table) => Arr.head(getTableCells(table)).map((startCell) => tableCellRng(startCell, endCell)))),
      (startCell) => getClosestTable(startCell, isRoot).bind((table) => Arr.last(getTableCells(table)).map((endCell) => tableCellRng(startCell, endCell)))
    ),
    (cellRng: TableCellRng) => isWithinSameTable(isRoot, cellRng) ? Option.none() : getCellRangeFromStartTable(cellRng, isRoot)
  );
};

const isWithinSameTable = (isRoot: (e: Element<any>) => boolean, cellRng: TableCellRng) =>
  getTableFromCellRng(cellRng, isRoot).isSome();

const getTableSelectionFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean) =>
  getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, getTableCells(table)));

const getTableSelection = (optCellRng: Option<TableCellRng>, rng: Range, isRoot: (e: Element<any>) => boolean) => optCellRng
  .filter((cellRng) => isExpandedCellRng(cellRng) && isWithinSameTable(isRoot, cellRng))
  .orThunk(() => partialSelection(isRoot, rng))
  .bind((cRng) => getTableSelectionFromCellRng(cRng, isRoot));

const getCellIndex = <T> (cells: Element<T>[], cell: Element<T>): Option<number> => Arr.findIndex(cells, (x) => Compare.eq(x, cell));

const getSelectedCells = (tableSelection: TableSelection) => Options.lift2(
  getCellIndex(tableSelection.cells, tableSelection.rng.start),
  getCellIndex(tableSelection.cells, tableSelection.rng.end),
  (startIndex, endIndex) => tableSelection.cells.slice(startIndex, endIndex + 1));

const isSingleCellTableContentSelected = (optCellRng: Option<TableCellRng>, rng: Range, isRoot: (e: Element<any>) => boolean) => optCellRng
  .filter((cellRng) => isSingleCellTable(cellRng, isRoot) && SelectionUtils.hasAllContentsSelected(cellRng.start, rng))
  .map((cellRng) => cellRng.start);

const getAction = (tableSelection: TableSelection) =>
  getSelectedCells(tableSelection)
    .map((selected) => {
      const cells = tableSelection.cells;
      return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table) : deleteAction.emptyCells(selected);
    });

export const getActionFromCells = (cells) => deleteAction.emptyCells(cells);
export const getActionFromRange = (root: Element, rng: Range) => {
  const isRoot = isRootFromElement(root);
  const optCellRng = getCellRng(rng, isRoot);
  return isSingleCellTableContentSelected(optCellRng, rng, isRoot).map((cell) => deleteAction.deleteCellSelection(rng, cell))
    .orThunk(() => getTableSelection(optCellRng, rng, isRoot).bind(getAction));
};
