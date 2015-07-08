define(
  'ephox.snooker.resize.Recalculations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warehouse',
    'global!parseInt'
  ],

  function (Arr, Fun, Warehouse, parseInt) {
    var total = function (start, end, measures) {
      var r = 0;
      for (var i = start; i < end; i++) {
        r += measures[i] !== undefined ? parseInt(measures[i], 10) : 0;
      }
      return r;
    };

    var recalculateWidth = function (warehouse, widths) {
      var all = Warehouse.justCells(warehouse);

      return Arr.map(all, function (cell) {
        var width = total(cell.column(), cell.column() + cell.colspan(), widths);
        return {
          element: cell.element,
          width: Fun.constant(width),
          colspan: cell.colspan
        };
      });
    };

    var recalculateHeight = function (warehouse, heights) {
      var all = Warehouse.justCells(warehouse);
      return Arr.map(all, function (cell) {
        var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
        return {
          element: cell.element,
          height: Fun.constant(height),
          rowspan: cell.rowspan
        };
      });
    };

    var matchRowHeight = function (warehouse, heights) {
      return Arr.map(warehouse.all(), function (row, i) {
        return {
          element: row.element,
          height: Fun.constant(heights[i])
        };
      });
    };

    return {
      recalculateWidth: recalculateWidth,
      recalculateHeight: recalculateHeight,
      matchRowHeight: matchRowHeight
    };
  }
);