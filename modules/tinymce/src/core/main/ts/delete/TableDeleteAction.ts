/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Option, Options } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, SelectorFind } from '@ephox/sugar';
import { Range, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';

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
  { emptyCells: [ 'cells' ] }
]);

const isRootFromElement = (root: Element<any>): (cur: Element<any>) => boolean =>
  (cur: Element<any>): boolean => Compare.eq(root, cur);

const getClosestCell = (container: DomNode, isRoot: (e: Element<any>) => boolean) => SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);

const getClosestTable = (cell, isRoot) => SelectorFind.ancestor(cell, 'table', isRoot);

const isExpandedCellRng = (cellRng: TableCellRng): boolean =>
  !Compare.eq(cellRng.start, cellRng.end);

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean): Option<Element<DomElement>> =>
  getClosestTable(cellRng.start, isRoot)
    .bind((startParentTable) =>
      getClosestTable(cellRng.end, isRoot)
        .bind((endParentTable) => Options.someIf(Compare.eq(startParentTable, endParentTable), startParentTable)));

const getTableCells = (table) => SelectorFilter.descendants(table, 'td,th');

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
    (cellRng: any) => isWithinSameTable(isRoot, cellRng) ? Option.none() : getCellRangeFromStartTable(cellRng, isRoot)
  );
};

const isWithinSameTable = (isRoot: (e: Element<any>) => boolean, cellRng: TableCellRng) =>
  getTableFromCellRng(cellRng, isRoot).isSome();

const getCellRng = (rng: Range, isRoot: (e: Element<any>) => boolean) => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);

  return Options.lift2(startCell, endCell, tableCellRng)
    .filter(isExpandedCellRng)
    .filter((cellRng) => isWithinSameTable(isRoot, cellRng))
    .orThunk(() => partialSelection(isRoot, rng));
};

const getTableSelectionFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean) => getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, getTableCells(table)));

const getTableSelectionFromRng = (root, rng: Range) => {
  const isRoot = isRootFromElement(root);
  return getCellRng(rng, isRoot).bind((cellRng) => getTableSelectionFromCellRng(cellRng, isRoot));
};

const getCellIndex = <T> (cells: Element<T>[], cell: Element<T>): Option<number> => Arr.findIndex(cells, (x) => Compare.eq(x, cell));

const getSelectedCells = (tableSelection: TableSelection) => Options.lift2(
  getCellIndex(tableSelection.cells, tableSelection.rng.start),
  getCellIndex(tableSelection.cells, tableSelection.rng.end),
  (startIndex, endIndex) => tableSelection.cells.slice(startIndex, endIndex + 1));

const getAction = (tableSelection: TableSelection) =>
  getSelectedCells(tableSelection)
    .map((selected) => {
      const cells = tableSelection.cells;
      return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table) : deleteAction.emptyCells(selected);
    });

export const getActionFromCells = (cells) => deleteAction.emptyCells(cells);
export const getActionFromRange = (root, rng: Range) => getTableSelectionFromRng(root, rng).bind(getAction);
