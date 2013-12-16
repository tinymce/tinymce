define(
  'ephox.snooker.ready.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Arr, Merger, Fun, Option) {
    var operate = function (warehouse, rowIndex, colIndex, operation) {
      /* 
         The process:

         Identify which cell has selection focus
         Get the row of that cell
         Apply operation on that ow and intergrate into table
       */

      var cells = warehouse.all();
      var initial = Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row.cells()[colIndex]);
      });

      return initial.map(function (start) {
        return Arr.bind(cells, function (row, i) {
          return i === start.row() ? operation(row) : [ row ];
        });
      }).getOrThunk(function () {
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      return Merger.merge(cell, {
        colspan: Fun.constant(cell.rowspan() + delta)
      });
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, nu) {
      var operation = function (row) {
        var element = row.element();
        var cells = row.cells();

        return [{
          element: Fun.constant(element),
          cells: Fun.constant(cells)
        }];
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var insertBefore = function (warehouse, rowIndex, colIndex, nu) {
      var operation = function (row) {
        var element = row.element();
        var cells = row.cells();

        return [{
          element: Fun.constant(element),
          cells: Fun.constant(cells)
        }];
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    return {
      insertBefore: insertBefore,
      insertAfter: insertAfter
    };
  }
);
