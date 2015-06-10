define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.TableGroup'
  ],

  function (Arr, Fun, Structs, TableGroup) {

    var render = function (structure, comparator) {
      var seen = Arr.map(structure, function (row, ri) {
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

      return Arr.map(structure, function (row, ri) {
        return Arr.bind(row, function (cell, ci) {
          // if we have seen this one, then skip it.
          if (seen[ri][ci] === false) {
            var result = TableGroup.subgrid(ri, ci, structure, comparator);
            updateSeen(ri, ci, result.rowspan, result.colspan);
            return [ Structs.detail(cell, result.rowspan, result.colspan) ];
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