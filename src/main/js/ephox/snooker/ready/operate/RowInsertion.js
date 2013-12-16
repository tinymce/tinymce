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
          return i === rowIndex ? operation(start, rowIndex, row) : [ row ];
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

    var insertAfter = function (warehouse, rowIndex, colIndex, nuRow, nuCell) {
      var operation = function (start, rindex, row) {
        var element = row.element();
        var cells = row.cells();

        var next = nuRow();

        var modCells = Arr.map(row.cells(), function (cell) {
          return cell.rowspan() > 1 && rindex < cell.row() + cell.rowspan() ? adjust(cell, 1) : cell;
        });

        var nextRow = Arr.bind(row.cells(), function (cell) {
          return cell.rowspan() === 1 || rindex >= cell.row() + cell.rowspan() ? [ Merger.merge(nuCell(cell), {
            colspan: Fun.constant(cell.colspan())
          }) ] : [];
        });

        var after = {
          element: next.element,
          cells: Fun.constant(nextRow)
        };

        return [{
          element: Fun.constant(element),
          cells: Fun.constant(cells)
        }, after];
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
      // TODO: Insert before.
      insertBefore: insertAfter,
      insertAfter: insertAfter
    };
  }
);
