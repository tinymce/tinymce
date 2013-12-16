define(
  'ephox.snooker.ready.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Merger, Fun, Option, Util) {
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
          return operation(start, rowIndex, row, i);
        });
      }).getOrThunk(function () {
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      console.log('adjusting');
      return Merger.merge(cell, {
        rowspan: Fun.constant(cell.rowspan() + delta)
      });
    };

    var expandPrev = function (rindex, row) {
      var cells = Arr.map(row.cells(), function (cell) {
        return cell.row() < rindex && cell.row() + cell.rowspan() > rindex ? adjust(cell, 1) : cell;
      });

      return {
        element: row.element,
        cells: Fun.constant(cells)
      };
    };

    var expandCurrent = function (rindex, row, nuRow, nuCell) {
      var next = nuRow();

      var modCells = Arr.map(row.cells(), function (cell) {
        return cell.rowspan() > 1 && rindex < cell.row() + cell.rowspan() ? adjust(cell, 1) : cell;
      });

      var nextRow = Arr.bind(row.cells(), function (cell) {
        return cell.rowspan() === 1 || rindex >= cell.row() + cell.rowspan() - 1 ? Util.repeat(cell.colspan(), Fun.curry(nuCell, cell)) : [];
      });

      var after = {
        element: next.element,
        cells: Fun.constant(nextRow)
      };

      return [{
        element: Fun.constant(row.element()),
        cells: Fun.constant(modCells)
      }, after];
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, nuRow, nuCell) {
      var operation = function (start, rindex, row, index) {
        var element = row.element();
        var cells = row.cells();

        // So there are two paths:
        // 1. just modify the rowspan cells. (target row and not target row)
        // 2. create a new row in addition to the target row
        return rindex !== index ? expandPrev(rindex, row) : expandCurrent(rindex, row, nuRow, nuCell);
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
