define(
  'tinymce.core.delete.TableDeleteAction',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Adt, Arr, Fun, Option, Options, Struct, Compare, Element, SelectorFilter, SelectorFind) {
    var tableCellRng = Struct.immutable('start', 'end');
    var tableSelection = Struct.immutable('rng', 'table', 'cells');
    var deleteAction = Adt.generate([
      { removeTable: [ 'element' ] },
      { emptyCells: [ 'cells' ] }
    ]);

    var getClosestCell = function (container, isRoot) {
      return SelectorFind.closest(Element.fromDom(container), 'td,th', isRoot);
    };

    var getClosestTable = function (cell, isRoot) {
      return SelectorFind.ancestor(cell, 'table', isRoot);
    };

    var isExpandedCellRng = function (cellRng) {
      return Compare.eq(cellRng.start(), cellRng.end()) === false;
    };

    var getTableFromCellRng = function (cellRng, isRoot) {
      return getClosestTable(cellRng.start(), isRoot)
        .bind(function (startParentTable) {
          return getClosestTable(cellRng.end(), isRoot)
            .bind(function (endParentTable) {
              return Compare.eq(startParentTable, endParentTable) ? Option.some(startParentTable) : Option.none();
            });
        });
    };

    var getCellRng = function (rng, isRoot) {
      return Options.liftN([ // get start and end cell
        getClosestCell(rng.startContainer, isRoot),
        getClosestCell(rng.endContainer, isRoot)
      ], tableCellRng)
        .filter(isExpandedCellRng);
    };

    var getTableSelectionFromCellRng = function (cellRng, isRoot) {
      return getTableFromCellRng(cellRng, isRoot)
        .bind(function (table) {
          var cells = SelectorFilter.descendants(table, 'td,th');

          return tableSelection(cellRng, table, cells);
        });
    };

    var getTableSelectionFromRng = function (rootNode, rng) {
      var isRoot = Fun.curry(Compare.eq, rootNode);

      return getCellRng(rng, isRoot)
        .map(function (cellRng) {
          return getTableSelectionFromCellRng(cellRng, isRoot);
        });
    };

    var getCellIndex = function (cellArray, cell) {
      return Arr.findIndex(cellArray, function (x) {
        return Compare.eq(x, cell);
      });
    };

    var getSelectedCells = function (tableSelection) {
      return Options.liftN([
        getCellIndex(tableSelection.cells(), tableSelection.rng().start()),
        getCellIndex(tableSelection.cells(), tableSelection.rng().end())
      ], function (startIndex, endIndex) {
        return tableSelection.cells().slice(startIndex, endIndex + 1);
      });
    };

    var getAction = function (tableSelection) {
      return getSelectedCells(tableSelection)
        .bind(function (selected) {
          var cells = tableSelection.cells();

          return selected.length === cells.length ? deleteAction.removeTable(tableSelection.table()) : deleteAction.emptyCells(selected);
        });
    };

    var getActionFromCells = function (cells) {
      return deleteAction.emptyCells(cells);
    };

    var getActionFromRange = function (rootNode, rng) {
      return getTableSelectionFromRng(rootNode, rng)
        .map(getAction);
    };

    return {
      getActionFromRange: getActionFromRange,
      getActionFromCells: getActionFromCells
    };
  }
);
