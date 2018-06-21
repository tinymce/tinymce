/**
 * TableDeleteAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Adt, Arr, Fun, Option, Options, Struct } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, SelectorFind } from '@ephox/sugar';
import { Range } from '@ephox/dom-globals';

const tableCellRng = Struct.immutable('start', 'end');
const tableSelection = Struct.immutable('rng', 'table', 'cells');
const deleteAction = Adt.generate([
  { removeTable: [ 'element' ] },
  { emptyCells: [ 'cells' ] }
]);

const isRootFromElement = (root) => Fun.curry(Compare.eq, root);

const getClosestCell = (container, isRoot) => {
  return SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);
};

const getClosestTable = (cell, isRoot) => {
  return SelectorFind.ancestor(cell, 'table', isRoot);
};

const isExpandedCellRng = (cellRng) => {
  return Compare.eq(cellRng.start(), cellRng.end()) === false;
};

const getTableFromCellRng = (cellRng, isRoot) => {
  return getClosestTable(cellRng.start(), isRoot)
    .bind((startParentTable) => {
      return getClosestTable(cellRng.end(), isRoot)
        .bind((endParentTable) => {
          return Compare.eq(startParentTable, endParentTable) ? Option.some(startParentTable) : Option.none();
        });
    });
};

const getTableCells = (table) => SelectorFilter.descendants(table, 'td,th');

const getCellRangeFromStartTable = (cellRng: any, isRoot) => getClosestTable(cellRng.start(), isRoot).bind((table) => {
  return Arr.last(getTableCells(table)).map((endCell) => tableCellRng(cellRng.start(), endCell));
});

const partialSelection = (isRoot, rng) => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);

  return rng.collapsed ? Option.none() : Options.liftN([startCell, endCell], tableCellRng).fold(
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

const isWithinSameTable = (isRoot, cellRng) => getTableFromCellRng(cellRng, isRoot).isSome();

const getCellRng = (rng: Range, isRoot) => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);

  return Options.liftN([startCell, endCell], tableCellRng)
    .filter(isExpandedCellRng)
    .filter((cellRng) => isWithinSameTable(isRoot, cellRng))
    .orThunk(() => partialSelection(isRoot, rng));
};

const getTableSelectionFromCellRng = (cellRng, isRoot) => {
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
  return Options.liftN([
    getCellIndex(tableSelection.cells(), tableSelection.rng().start()),
    getCellIndex(tableSelection.cells(), tableSelection.rng().end())
  ], (startIndex, endIndex) => {
    return tableSelection.cells().slice(startIndex, endIndex + 1);
  });
};

const getAction = (tableSelection) => {
  return getSelectedCells(tableSelection)
    .map((selected) => {
      const cells = tableSelection.cells();
      return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table()) : deleteAction.emptyCells(selected);
    });
};

const getActionFromCells = (cells) => deleteAction.emptyCells(cells);
const getActionFromRange = (root, rng: Range) => getTableSelectionFromRng(root, rng).bind(getAction);

export default {
  getActionFromRange,
  getActionFromCells
};