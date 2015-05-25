define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Capisco'
  ],

  function (Arr, Fun, Capisco) {

    var render = function (structure) {
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
        var cells = Arr.bind(row, function (cell, ci) {
          // if we have seen this one, then skip it.
          if (seen[ri][ci] === false) {
            var result = Capisco.capisco(ri, ci, structure);
            updateSeen(ri, ci, result.rowspan, result.colspan);

            return [ {
              element: Fun.identity(cell),
              rowspan: Fun.identity(result.rowspan),
              colspan: Fun.identity(result.colspan)
            } ];
          } else {
            return [];
          }
        });
        return {
          element: 'tr',
          cells: cells
        };
      });
    };

    return {
      render: render
    };
  }
);