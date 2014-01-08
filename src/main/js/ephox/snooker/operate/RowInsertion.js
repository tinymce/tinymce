define(
  'ephox.snooker.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Rowspans',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Merger, Fun, Option, Structs, Blocks, Warehouse, Rowspans, Util) {
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

      // Only create cells for cells which aren't already covered by the span increase. Those that 
      // do span, will already be spanning into this new row.
      var otherCells = Arr.map(unspanned, generators.cell);

      //  We are creating a new row, so adjust the spans of cells that span onto this row
      var active = expansion(row, isSpanner);
      var other = Structs.rowdata(nu.element(), otherCells);

      return {
        active: Fun.constant(active),
        other: Fun.constant(other)
      };
    };

    // Returns the row after performing any expansions of cell rowspans that is required.
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

    var before = {
      spanners: Rowspans.before,
      order: function (result) {
        return [ result.other(), result.active() ];
      }
    };

    var after = {
      spanners: Rowspans.after,
      order: function (result) {
        return [ result.active(), result.other() ]
      }
    };

    var insert = function (type, warehouse, rowIndex, colIndex, generators, eq) {
      var operation = function (start, cells) {
        var spanners = type.spanners(warehouse, rowIndex);
        var isSpanner = isSpanCell(spanners.spanned(), eq);

        /*
         * For each row in the table:
         *  - if we are on the specified row: create a new row and return both this and the old row
         *  - add the rows in the particular order depending on type
         *  - if we are on a different row, expand all cells which span onto the specified row and leave the rest alone
         */
        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
            var result = creation(row, isSpanner, generators, spanners.unspanned());
            return type.order(result);
          } else {
            // expand other cells where appropriate if they span onto our target row
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
        var spanners = Rowspans.after(warehouse, rowIndex);
        var isSpanner = isSpanCell(spanners.spanned(), eq);
        
        /*
         * For each row in the table:
         *  - if we are on the specified row: create a new row and return both this and the old row. 
         *    Add the new row first, because it is being inserted before.
         *  - if we are on a different row, expand all cells which span onto the specified row and leave the rest alone
         */
        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
           
            return [];

            // actually, what you need to do here is find the cells which span on this row, and have 
            // offset 0. We need to find the ones that start here, and move them to the next row.

            // when trying to identify where to put it, I guess you could use the warehouse to get the 
            // previous column position of the next row, and insert it after that element or before 
            // the next warehouse position.
          } else if (rindex === start.row() + 1) {
            // Return this row, where we map over the row, and introduce any new cells representing any 
            // cut off cells into the appropriate positions in this row.

            // get a list of all the cells which are on this row for each column
            // generate a deduped list of these cells for anything which has a starting row of the current row
            // or the deleted row. The cells brought from the deleted row will need to be shrunk.
            var cellsInRow = Blocks.cellsInRow(warehouse, rindex);
            var included = Arr.bind(cellsInRow, function (cell) {
              if (cell.row() === rindex) return [ cell ];
              if (cell.row() === start.row()) return [ adjust(cell, -1) ];
              return [];
            });

            return [ Structs.rowdata(row.element(), included)];
          }
          else {
            return [ shrink(row, isSpanner) ];
          }
        });

        /*
         * This does not handle the following case:

            The row being deleted contains a cell which has a rowspan that spans onto the next row.
            That cell will then need to be moved to the next row, which means that something is going 
            to have to move it, somehow. And move it to the right spot as well.
         */
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    return {
      insertBefore: Fun.curry(insert, before),
      insertAfter: Fun.curry(insert, after),
      erase: erase
    };
  }
);
