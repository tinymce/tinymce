define(
  'ephox.snooker.ready.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.ready.data.CellType',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.operate.Rowspans',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Merger, Fun, Option, CellType, Warehouse, Rowspans, Util) {
    var getRow = function (warehouse, rowIndex) {
      var range = Util.range(0, warehouse.grid().columns());
      return Arr.map(range, function (colIndex) {
        var item = Warehouse.getAt(warehouse, rowIndex, colIndex);
        return item === undefined ? CellType.none() :
          item.rowspan() > 1 ? CellType.partial(item, rowIndex - item.row()) : CellType.whole(item);
      });
    };

    var operate = function (warehouse, rowIndex, colIndex, operation) {
      /* 
         The process:

         Identify which cell has selection focus
         Get the row of that cell
         Apply operation on that ow and intergrate into table
       */

      var cells = warehouse.all();
      var context = getRow(warehouse, rowIndex);
      var initial = Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row.cells()[colIndex]);
      });

      return initial.map(function (start) {
        return operation(context, start, cells);
      }).getOrThunk(function () {
        console.log('Did not find what you speak of');
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      console.log('adjusting');
      return Merger.merge(cell, {
        rowspan: Fun.constant(cell.rowspan() + delta)
      });
    };

    var expandPrev = function (row, isSpanner) {
      var cells = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });

      return {
        element: row.element,
        cells: Fun.constant(cells)
      };
    };

    var expandCurrent = function (row, rindex, nuRow, nuCell, isSpanner, unspanned) {
      var next = nuRow();
      
      var currentRow = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });

      // For all of the cells that are considered unique and aren't being spanned, create a new cell.
      var nextRow = Arr.map(unspanned, nuCell);

      var after = {
        element: next.element,
        cells: Fun.constant(nextRow)
      };

      return [{
        element: Fun.constant(row.element()),
        cells: Fun.constant(currentRow)
      }, after];
    };

    var isSpanner = function (spanners, eq) {
      return function (candidate) {
        return Arr.exists(spanners, function (sp) {
          return eq(candidate.element(), sp.element());
        });
      };
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, nuRow, nuCell, eq) {
      var operation = function (context, start, cells) {
        var spanners = Rowspans.after(warehouse, rowIndex);
        
        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
            return expandCurrent(row, rindex, nuRow, nuCell, isSpanner(spanners.spanned(), eq), spanners.unspanned());
          } else {
            return expandPrev(row, isSpanner(spanners.spanned(), eq));
          }
        });
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
