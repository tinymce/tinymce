define(
  'ephox.snooker.ready.lookup.Blocks',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.ready.data.CellType',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Fun, CellType, Structs, Warehouse, Util) {
    var columns = function (warehouse) {
      var grid = warehouse.grid();
      var cols = Util.range(0, grid.columns());
      var rows = Util.range(0, grid.rows());

      return Arr.map(cols, function (col) {
        var rawRow = Arr.find(rows, function (r) {
          var cell = Warehouse.getAt(warehouse, r, col);
          return cell !== undefined && cell.colspan() === 1;
        });

        var row = rawRow > -1 ? rawRow : 0;
        var result = Warehouse.getAt(warehouse, row, col);
        return result.element();
      });
    };


    var column = function (warehouse, colId) {
      /* Return a list of before, on, after */
      var r = [];
      var all = warehouse.all();
      return Arr.map(all, function (row) {
        var index = Arr.findIndex(row, function (extended, i) {
          var start = extended.column();
          var end = extended.column() + extended.colspan() - 1;
          /* Find the FIRST cell which would span over this colId */
          return colId >= start && colId <= end;
        });

        var before = Arr.filter(row, function (extended) {
          return extended.column() + extended.colspan() - 1 < colId;
        });

        var after = Arr.filter(row, function (extended) {
          return extended.column() > colId;
        });

        var onCell = Arr.find(row, function (extended) {
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
          on: Fun.constant(on)
        };
      });
    };

    return {
      column: column,
      columns: columns
    };
  }
);
