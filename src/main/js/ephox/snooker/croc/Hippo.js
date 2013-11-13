define(
  'ephox.snooker.croc.Hippo',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.data.Structs',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Option, Structs, Compare, SelectorFilter, SelectorFind) {
    /*
      The index is used to return the actual DOM position of this cell. As in, which tr is it, and how
      many tds into that tr. It ignores colspan and rowspan.

      The grid is used to consider the spans of various things, and identify which grid position it is.
     */
    var index = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (tr) {
        return SelectorFind.ancestor(tr, 'table').bind(function (table) {
          var rowsInTable = SelectorFilter.descendants(table, 'tr');
          var rowIndex = Arr.findIndex(rowsInTable, function (x) {
            return Compare.eq(tr, x);
          });

          var cellsInRow = SelectorFilter.descendants(tr, 'td');
          var colIndex = Arr.findIndex(cellsInRow, function (x) {
            return Compare.eq(x, cell);
          });

          return rowIndex > -1 && colIndex > -1 ? Option.some(Structs.cell(rowIndex, colIndex)) : Option.none();
        });
      });
    };

    // Not implemented yet.
    var grid = index;

    return {
      index: index,
      grid: grid
    };
  }
);
