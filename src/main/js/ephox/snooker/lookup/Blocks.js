define(
  'ephox.snooker.lookup.Blocks',

  [
    'ephox.compass.Arr',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Warehouse, Util) {
    /*
     * Identify for each column, a cell that has colspan 1. Note, this
     * may actually fail, and future work will be to calculate column
     * sizes that are only available through the difference of two
     * spanning columns.
     */
    var columns = function (warehouse) {
      var grid = warehouse.grid();
      var cols = Util.range(0, grid.columns());
      var rows = Util.range(0, grid.rows());

      return Arr.map(cols, function (col) {
        var rawRow = Arr.find(rows, function (r) {
          var cell = Warehouse.getAt(warehouse, r, col);
          return cell.exists(function (cl) {
            return cl.colspan() === 1;
          });
        });

        var row = rawRow > -1 ? rawRow : 0;
        // This may not be safe because of the defaulting of row above.
        var result = Warehouse.getAt(warehouse, row, col).getOrDie();
        return result.element();
      });
    };

    return {
      columns: columns
    };
  }
);
