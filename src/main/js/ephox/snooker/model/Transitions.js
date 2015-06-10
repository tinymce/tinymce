define(
  'ephox.snooker.model.Transitions',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.TableGrid',
    'ephox.snooker.model.Warehouse'
  ],

  function (Arr, Structs, TableGrid, Warehouse) {
    var toDetails = function (grid, comparator) {
      var seen = Arr.map(grid, function (row, ri) {
        return Arr.map(row, function (col, ci) {
          return false;
        });
      });

      var updateSeen = function (ri, ci, rowspan, colspan) {
        for (var r = ri; r < ri + rowspan; r++) {
          for (var c = ci; c < ci + colspan; c++) {
            seen[r][c] = true;
          }
        }
      };

      return Arr.map(grid, function (row, ri) {
        return Arr.bind(row, function (cell, ci) {
          // if we have seen this one, then skip it.
          if (seen[ri][ci] === false) {
            var result = TableGrid.subgrid(grid, ri, ci, comparator);
            updateSeen(ri, ci, result.rowspan(), result.colspan());
            return [ Structs.detail(cell, result.rowspan(), result.colspan()) ];
          } else {
            return [];
          }
        });
      });
    };

    var toGrid = function (warehouse, generators) {
      var grid = [];
      for (var i = 0; i < warehouse.grid().rows(); i++) {
        var row = [];
        for (var j = 0; j < warehouse.grid().columns(); j++) {
          // The item is going to be the element at that position, or a newly generated gap.
          var element = Warehouse.getAt(warehouse, i, j).map(function (item) {
            return item.element();
          }).getOrThunk(generators.gap);
          row.push(element);
        }
        grid.push(row);
      }
      return grid;
    };

    return {
      toDetails: toDetails,
      toGrid: toGrid
    };
  }
);