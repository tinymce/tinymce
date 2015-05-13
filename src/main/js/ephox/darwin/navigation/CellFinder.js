define(
  'ephox.darwin.navigation.CellFinder',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, Option, Compare, SelectorFilter, SelectorFind) {
    // TODO: Implement colspans and rowspans. Note, this will probably interact with snooker.

    var findInTable = function (cell) {
      return findColumn(cell).bind(function (colIndex) {
        return findRow(cell).map(function (rowIndex) {
          return {
            rowIndex: Fun.constant(rowIndex),
            colIndex: Fun.constant(colIndex),
          };
        });
      });
    };

    var findColumn = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (tr) {
        var cells = SelectorFilter.descendants(tr, 'td,th');
        var isElem = Fun.curry(Compare.eq, cell);
        var index = Arr.findIndex(cells, isElem);
        return index !== -1 ? Option.some(index) : Option.none();
      });
    };

    var findRow = function (cell) {
      return SelectorFind.ancestor(cell, 'tbody,thead').bind(function (section) {
        return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
          var rows = SelectorFilter.descendants(section, 'tr');
          var isRow = Fun.curry(Compare.eq, row);
          var index = Arr.findIndex(rows, isRow);
          return index !== -1 ? Option.some(index) : Option.none();
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