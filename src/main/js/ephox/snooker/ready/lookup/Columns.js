define(
  'ephox.snooker.ready.lookup.Columns',

  [
    'ephox.compass.Arr',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Warehouse, Util) {
    var derive = function (warehouse) {
      var grid = warehouse.grid();
      var cols = Util.range(0, grid.columns());
      var rows = Util.range(0, grid.rows());

      return Arr.map(result, function (col) {
        var rawRow = Arr.find(rows, function (r) {
          var cell = Warehouse.getAt(warehouse, r, col);
          return cell !== undefined && cell.colspan() === 1;
        });

        var row = rawRow > -1 ? rawRow : 0;
        var result = Warehouse.getAt(warehouse, row, col);
        return result.element();
      });
    };

    return {
      derive: derive
    };
  }
);
