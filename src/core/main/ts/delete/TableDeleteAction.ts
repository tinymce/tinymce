import { Adt, Arr, Fun, Option, Options, Struct } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, SelectorFind } from '@ephox/sugar';

const tableCellRng = Struct.immutable('start', 'end');
const tableSelection = Struct.immutable('rng', 'table', 'cells');
const deleteAction = Adt.generate([
  { removeTable: [ 'element' ] },
  { emptyCells: [ 'cells' ] }
]);

const getClosestCell = function (container, isRoot) {
  return SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);
};

const getClosestTable = function (cell, isRoot) {
  return SelectorFind.ancestor(cell, 'table', isRoot);
};

const isExpandedCellRng = function (cellRng) {
  return Compare.eq(cellRng.start(), cellRng.end()) === false;
};

const getTableFromCellRng = function (cellRng, isRoot) {
  return getClosestTable(cellRng.start(), isRoot)
    .bind(function (startParentTable) {
      return getClosestTable(cellRng.end(), isRoot)
        .bind(function (endParentTable) {
          return Compare.eq(startParentTable, endParentTable) ? Option.some(startParentTable) : Option.none();
        });
    });
};

const getCellRng = function (rng, isRoot) {
  return Options.liftN([ // get start and end cell
    getClosestCell(rng.startContainer, isRoot),
    getClosestCell(rng.endContainer, isRoot)
  ], tableCellRng)
    .filter(isExpandedCellRng);
};

const getTableSelectionFromCellRng = function (cellRng, isRoot) {
  return getTableFromCellRng(cellRng, isRoot)
    .bind(function (table) {
      const cells = SelectorFilter.descendants(table, 'td,th');

      return tableSelection(cellRng, table, cells);
    });
};

const getTableSelectionFromRng = function (rootNode, rng) {
  const isRoot = Fun.curry(Compare.eq, rootNode);

  return getCellRng(rng, isRoot)
    .map(function (cellRng) {
      return getTableSelectionFromCellRng(cellRng, isRoot);
    });
};

const getCellIndex = function (cellArray, cell) {
  return Arr.findIndex(cellArray, function (x) {
    return Compare.eq(x, cell);
  });
};

const getSelectedCells = function (tableSelection) {
  return Options.liftN([
    getCellIndex(tableSelection.cells(), tableSelection.rng().start()),
    getCellIndex(tableSelection.cells(), tableSelection.rng().end())
  ], function (startIndex, endIndex) {
    return tableSelection.cells().slice(startIndex, endIndex + 1);
  });
};

const getAction = function (tableSelection) {
  return getSelectedCells(tableSelection)
    .bind(function (selected) {
      const cells = tableSelection.cells();

      return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table()) : deleteAction.emptyCells(selected);
    });
};

const getActionFromCells = function (cells) {
  return deleteAction.emptyCells(cells);
};

const getActionFromRange = function (rootNode, rng) {
  return getTableSelectionFromRng(rootNode, rng)
    .map(getAction);
};

export default {
  getActionFromRange,
  getActionFromCells
};