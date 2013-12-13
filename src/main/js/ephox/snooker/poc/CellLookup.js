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
      var cells = [];

      var maxRows = 0;
      var maxColumns = 0;
      Arr.each(input, function (row, r) {
        var currentRow = [];
        Arr.each(row, function (cell, c) {
          var start = 0;
          while (result[key(r, start)] !== undefined) {
            start++;
          }

          var current = {
            row: Fun.constant(r),
            column: Fun.constant(start),
            id: cell.id,
            colspan: cell.colspan,
            rowspan: cell.rowspan
          };

          for (var i = 0; i < cell.colspan(); i++) {
            for (var j = 0; j < cell.rowspan(); j++) {
              var newpos = key(r + j, start + i);
              result[newpos] = current;
              maxRows = Math.max(maxRows, r + j + 1);
              maxColumns = Math.max(maxColumns, start + i + 1);
            }
          }

          currentRow.push(current);
        });
        cells.push(currentRow);
      });

      console.log('max: ', maxRows + ', ' + maxColumns);

      return {
        data: Fun.constant(result),
        rows: Fun.constant(maxRows),
        columns: Fun.constant(maxColumns),
        all: Fun.constant(cells)
      };
    };

    return {
      key: key,
      model: model
    };
  }
);
