define(
  'ephox.darwin.navigation.CellFinder',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.api.ElementFind',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Option, ElementFind, SelectorFilter) {
    // IMPROVEMENT: Implement colspans and rowspans. Note, this will probably interact with snooker.
    var findInTable = function (cell) {
      return ElementFind.inAncestorOfSelector(cell, 'tr', 'td,th').bind(function (cellInfo) {
        return ElementFind.inAncestorOfSelector(cellInfo.ancestor(), 'table', 'tr').map(function (rowInfo) {
          return {
            rowIndex: rowInfo.index,
            colIndex: cellInfo.index,
          };
        });
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