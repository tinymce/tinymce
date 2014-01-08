define(
  'ephox.snooker.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.operate.Rowspans'
  ],

  function (Arr, Merger, Fun, Option, Structs, Rowspans) {
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

      //  We are creating a new row, so adjust the spans of cells that span onto this row
      var current = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });

      // Only create cells for cells which aren't already covered by the span increase. Those that 
      // do span, will already be spanning into this new row.
      var otherCells = Arr.map(unspanned, generators.cell);

      var active = Structs.rowdata(row.element(), current);
      var other = Structs.rowdata(nu.element(), otherCells);

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

    var shrink = function (row, isSpanner) {
      var cells = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, -1) : cell;
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

        /*
         * For each row in the table:
         *  - if we are on the specified row: create a new row and return both this and the old row. 
         *    Add the new row last, because it is being inserted after.
         *  - if we are on a different row, expand all cells which span onto the specified row and leave the rest alone
         */
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

        /*
         * For each row in the table:
         *  - if we are on the specified row: create a new row and return both this and the old row. 
         *    Add the new row first, because it is being inserted before.
         *  - if we are on a different row, expand all cells which span onto the specified row and leave the rest alone
         */
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

    var erase = function (warehouse, rowIndex, colIndex, generators, eq) {
      /*
       * For each row in the table:
       *  - if we are on the specified row, remove it.
       *  - if we are on a different row, decrease by 1 all the cells which span onto the specified row and 
       *    leave the rest alone.
       */
      var operation = function (start, cells) {
        var spanners = Rowspans.before(warehouse, rowIndex);
        var isSpanner = isSpanCell(spanners.spanned(), eq);

        /*
         * For each row in the table:
         *  - if we are on the specified row: create a new row and return both this and the old row. 
         *    Add the new row first, because it is being inserted before.
         *  - if we are on a different row, expand all cells which span onto the specified row and leave the rest alone
         */
        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) return [];
          else {
            return [ shrink(row, isSpanner) ];
          }
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    return {
      insertBefore: insertBefore,
      insertAfter: insertAfter,
      erase: erase
    };
  }
);
