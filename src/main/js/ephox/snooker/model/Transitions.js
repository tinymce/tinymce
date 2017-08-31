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
        return Arr.map(row.cells(), function (col, ci) {
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
        var details = Arr.bind(row.cells(), function (cell, ci) {
          // if we have seen this one, then skip it.
          if (seen[ri][ci] === false) {
            var result = TableGrid.subgrid(grid, ri, ci, comparator);
            updateSeen(ri, ci, result.rowspan(), result.colspan());
            return [ Structs.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew()) ];
          } else {
            return [];
          }
        });
        return Structs.rowdetails(details, row.section());
      });
    };

    var toGrid = function (warehouse, generators) {
      var grid = [];
      for (var i = 0; i < warehouse.grid().rows(); i++) {
        var rowCells = [];
        for (var j = 0; j < warehouse.grid().columns(); j++) {
          // The element is going to be the element at that position, or a newly generated gap.
          var element = Warehouse.getAt(warehouse, i, j).map(function (item) {
            return item.element();
          }).getOrThunk(generators.gap);
          rowCells.push(element);
        }
        var row = Structs.rowcells(rowCells, warehouse.all()[i].section());
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