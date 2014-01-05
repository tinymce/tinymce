define(
  'ephox.snooker.lookup.Blocks',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.data.CellType',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Fun, CellType, Warehouse, Util) {
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

    /*
     * For column: colId, identify for each row a structure of before, on, and after.
     * The on will be a CellType type.
     */
    var column = function (warehouse, colId) {
      /* Return a list of before, on, after */
      var r = [];
      var all = warehouse.all();
      return Arr.map(all, function (row) {
        var cellsInRow = row.cells();
        var before = Arr.filter(cellsInRow, function (extended) {
          return extended.column() + extended.colspan() - 1 < colId;
        });

        var after = Arr.filter(cellsInRow, function (extended) {
          return extended.column() > colId;
        });

        var onCell = Arr.find(cellsInRow, function (extended) {
          var start = extended.column();
          var end = extended.column() + extended.colspan() - 1;
          /* Find the FIRST cell which would span over this colId */
          return colId >= start && colId <= end;
        });

        var on = onCell === undefined ? CellType.none() :
                onCell.colspan() > 1 ? CellType.partial(onCell, colId - onCell.column()) : CellType.whole(onCell);

        return {
          before: Fun.constant(before),
          after: Fun.constant(after),
          on: Fun.constant(on),
          row: row.element
        };
      });
    };

    return {
      column: column,
      columns: columns
    };
  }
);
