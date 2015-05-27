define(
  'ephox.darwin.navigation.CellFinder',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.api.ElementFind',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Option, ElementFind, SelectorFilter, SelectorFind) {
    // IMPROVEMENT: Implement colspans and rowspans. Note, this will probably interact with snooker.

    var findInTable = function (cell) {
      return findColumn(cell).bind(function (cellInfo) {
        return findRow(cell).map(function (rowInfo) {
          return {
            rowIndex: rowInfo.index,
            colIndex: cellInfo.index,
          };
        });
      });
    };

    var findColumn = function (cell) {
      return ElementFind.inAncestorOfSelector(cell, 'tr', 'td,th');
    };

    var findRow = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
        return ElementFind.inAncestorOfSelector(row, 'table', 'tr');
      });
    };

    var gotoCell = function (table, rowIndex, colIndex) {
      var rows = SelectorFilter.descendants(table, 'tr');
      return Option.from(rows[rowIndex]).bind(function (row) {
        var cells = SelectorFilter.children(row, 'td,th');
        return Option.from(cells[colIndex]);
      });
    };

    return {
      findInTable: findInTable,
      gotoCell: gotoCell
    };
  }
);