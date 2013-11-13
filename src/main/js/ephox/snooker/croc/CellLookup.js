define(
  'ephox.snooker.croc.CellLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    var key = function (row, column) {
      return row + ',' + column;
    };

    var model = function (input) {
      var result = {};
      Arr.each(input, function (row, r) {
        Arr.each(row, function (cell) {
          var start = 0;
          while (result[key(r, start)] !== undefined) {
            start++;
          }

          for (var i = 0; i < cell.colspan(); i++) {
            for (var j = 0; j < cell.rowspan(); j++) {
              var newpos = key(r + j, start + i);
              result[newpos] = {
                row: Fun.constant(r),
                column: Fun.constant(start),
                id: cell.id,
                colspan: cell.colspan,
                rowspan: cell.rowspan
              };
            }
          }
        });
      });

      return result;
    };

    return {
      key: key,
      model: model
    };
  }
);
