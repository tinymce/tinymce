define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.TableGrid'
  ],

  function (Arr, Structs, TableGrid) {
    var render = function (grid, comparator) {
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

    return {
      render: render
    };
  }
);