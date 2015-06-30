define(
  'ephox.snooker.lookup.Blocks',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Fun, Option, Warehouse, Util) {
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

        // Firstly, find the cells that start on that column.
        var onColumn = Arr.bind(rows, function (r) {
          return Warehouse.getAt(warehouse, r, col).filter(function (detail) {
            return detail.column() === col;
          }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
        });

        var singleOnColumn = Arr.find(onColumn, function (detail) {
          return detail.colspan() === 1;
        });

        return Option.from(singleOnColumn).orThunk(function () {
          return Option.from(onColumn[0]);
        }).fold(function () {
          return Warehouse.getAt(warehouse, 0, col).map(function (detail) { return detail.element(); });
        }, function (detail) {
          return Option.some(detail.element());
        });
      });
    };

    var rows = function (warehouse) {
      var grid = warehouse.grid();
      // cols is an array, where each element represents the number of
      // elements in the col.
      var cols = Util.range(0, grid.columns());

      var rows = Util.range(0, grid.rows());

      // Arr.map()

      return Arr.map(rows, function (row) {

        // Firstly, find the cells that start on that column.
        var onRow = Arr.bind(cols, function (r) {
          return Warehouse.getAt(warehouse, r, row).filter(function (detail) {
            return detail.row() === row;
          }).fold(Fun.constant([]), function (detail) { return [ detail ]; });
        });

        var singleOnRow = Arr.find(onRow, function (detail) {
          return detail.rowspan() === 1;
        });

        return Option.from(singleOnRow).orThunk(function () {
          return Option.from(onRow[0]);
        }).fold(function () {
          return Warehouse.getAt(warehouse, 0, row).map(function (detail) { return detail.element(); });
        }, function (detail) {
          return Option.some(detail.element());
        });
      });

    };

    return {
      columns: columns,
      rows: rows
    };
  }
);
