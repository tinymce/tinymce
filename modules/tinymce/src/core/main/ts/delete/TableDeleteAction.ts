/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Fun, Option, Options } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, SelectorFind } from '@ephox/sugar';
import { Range, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';

interface TableCellRng {
  start: () => Element<DomElement>;
  end: () => Element<DomElement>;
}

const tableCellRng = (start: Element<DomElement>, end: Element<DomElement>): TableCellRng => ({
  start: Fun.constant(start),
  end: Fun.constant(end)
});

interface TableSelection {
  rng: () => TableCellRng;
  table: () => Element<DomElement>;
  cells: () => Element<DomElement>[];
}

const tableSelection = (rng: TableCellRng, table: Element<DomElement>, cells: Element<DomElement>[]): TableSelection => ({
  rng: Fun.constant(rng),
  table: Fun.constant(table),
  cells: Fun.constant(cells)
});

const deleteAction = Adt.generate([
  { removeTable: [ 'element' ] },
  { emptyCells: [ 'cells' ] }
]);

const isRootFromElement = (root: Element<any>) => (cur: Element<any>): boolean => Compare.eq(root, cur);

const getClosestCell = (container: DomNode, isRoot: (e: Element<any>) => boolean) => {
  return SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);
};

const getClosestTable = (cell, isRoot) => {
  return SelectorFind.ancestor(cell, 'table', isRoot);
};

const isExpandedCellRng = (cellRng) => {
  return Compare.eq(cellRng.start(), cellRng.end()) === false;
};

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean): Option<Element<DomElement>> =>
  getClosestTable(cellRng.start(), isRoot)
    .bind((startParentTable) =>
      getClosestTable(cellRng.end(), isRoot)
        .bind((endParentTable) => Options.someIf(Compare.eq(startParentTable, endParentTable), startParentTable)));

const getTableCells = (table) => SelectorFilter.descendants(table, 'td,th');

const getCellRangeFromStartTable = (cellRng: any, isRoot) => getClosestTable(cellRng.start(), isRoot).bind((table) => {
  return Arr.last(getTableCells(table)).map((endCell) => tableCellRng(cellRng.start(), endCell));
});

const partialSelection = (isRoot: (e: Element<any>) => boolean, rng: Range): Option<TableCellRng> => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);

  return rng.collapsed ? Option.none() : Options.lift2(startCell, endCell, tableCellRng).fold(
    () => startCell.fold(
      () => endCell.bind((endCell) => getClosestTable(endCell, isRoot).bind((table) => {
        return Arr.head(getTableCells(table)).map((startCell) => tableCellRng(startCell, endCell));
      })),
      (startCell) => getClosestTable(startCell, isRoot).bind((table) => {
        return Arr.last(getTableCells(table)).map((endCell) => tableCellRng(startCell, endCell));
      })
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

const getTableSelectionFromCellRng = (cellRng: TableCellRng, isRoot: (e: Element<any>) => boolean) => {
  return getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, getTableCells(table)));
};

const getTableSelectionFromRng = (root, rng: Range) => {
  const isRoot = isRootFromElement(root);
  return getCellRng(rng, isRoot).bind((cellRng) => getTableSelectionFromCellRng(cellRng, isRoot));
};

const getCellIndex = (cells, cell) => {
  return Arr.findIndex(cells, (x) => Compare.eq(x, cell));
};

const getSelectedCells = (tableSelection) => {
  return Options.lift2(
    getCellIndex(tableSelection.cells(), tableSelection.rng().start()),
    getCellIndex(tableSelection.cells(), tableSelection.rng().end()),
    (startIndex, endIndex) => tableSelection.cells().slice(startIndex, endIndex + 1));
};

const getAction = (tableSelection) =>
  getSelectedCells(tableSelection)
    .map((selected) => {
      const cells = tableSelection.cells();
      return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table()) : deleteAction.emptyCells(selected);
    });

export const getActionFromCells = (cells) => deleteAction.emptyCells(cells);
export const getActionFromRange = (root, rng: Range) => getTableSelectionFromRng(root, rng).bind(getAction);
