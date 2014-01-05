define(
  'ephox.snooker.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.operate.Rowspans'
  ],

  function (Arr, Merger, Fun, Option, Rowspans) {
    var operate = function (warehouse, rowIndex, colIndex, operation) {
      /*
         The process:

         Identify which cell has selection focus
         Get the row of that cell
         Apply operation on that row and integrate into table
       */

      var cells = warehouse.all();
      var initial = Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row.cells()[colIndex]);
      });

      return initial.map(function (start) {
        return operation(start, cells);
      }).getOrThunk(function () {
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      return Merger.merge(cell, {
        rowspan: Fun.constant(cell.rowspan() + delta)
      });
    };

    var creation = function (row, isSpanner, generators, unspanned) {
      var nu = generators.row();

      var current = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });

      var otherCells = Arr.map(unspanned, generators.cell);

      var active = {
        element: row.element,
        cells: Fun.constant(current)
      };

      var other = {
        element: nu.element,
        cells: Fun.constant(otherCells)
      };

      return {
        active: Fun.constant(active),
        other: Fun.constant(other)
      };
    };

    var expansion = function (row, isSpanner) {
      var cells = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });

      return {
        element: row.element,
        cells: Fun.constant(cells)
      };
    };

    var isSpanCell = function (spanners, eq) {
      return function (candidate) {
        return Arr.exists(spanners, function (sp) {
          return eq(candidate.element(), sp.element());
        });
      };
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, generators, eq) {
      var operation = function (start, cells) {
        var spanners = Rowspans.after(warehouse, rowIndex);
        var isSpanner = isSpanCell(spanners.spanned(), eq);

        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
            var result = creation(row, isSpanner, generators, spanners.unspanned());
            return [ result.active(), result.other() ];
          } else {
            return [ expansion(row, isSpanner) ];
          }
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var insertBefore = function (warehouse, rowIndex, colIndex, generators, eq) {
      var operation = function (start, cells) {
        var spanners = Rowspans.before(warehouse, rowIndex);
        var isSpanner = isSpanCell(spanners.spanned(), eq);

        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
            var result = creation(row, isSpanner, generators, spanners.unspanned());
            return [ result.other(), result.active() ];
          } else {
            return [ expansion(row, isSpanner) ];
          }
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    return {
      insertBefore: insertBefore,
      insertAfter: insertAfter
    };
  }
);
