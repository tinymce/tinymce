define(
  'ephox.snooker.croc.CellLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'global!Math'
  ],

  function (Arr, Fun, Math) {
    var key = function (row, column) {
      return row + ',' + column;
    };

    var model = function (input) {
      var result = {};

      var maxRows = 0;
      var maxColumns = 0;
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



              maxRows = Math.max(maxRows, r + j + 1);
              maxColumns = Math.max(maxColumns, start + i + 1);
            }
          }
        });
      });

      console.log('max: ', maxRows + ', ' + maxColumns);

      return {
        data: Fun.constant(result),
        rows: Fun.constant(maxRows),
        columns: Fun.constant(maxColumns)
      };
    };

    return {
      key: key,
      model: model
    };
  }
);
