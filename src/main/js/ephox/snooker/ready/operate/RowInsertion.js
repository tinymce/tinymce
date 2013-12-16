define(
  'ephox.snooker.ready.operate.RowInsertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.ready.data.CellType',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.util.Util'
  ],

  function (Arr, Merger, Fun, Option, CellType, Warehouse, Util) {
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

    var expandCurrent = function (row, rindex, nuRow, nuCell, isSpanner, context, eq) {
      var next = nuRow();
      
      var currentRow = Arr.map(row.cells(), function (cell) {
        return isSpanner(cell) ? adjust(cell, 1) : cell;
      });


      var ending = Arr.bind(context, function (span) {
        return span.fold(Fun.constant([]), function (w) {
          return [ w ];
        }, function (p, offset) {
          return offset == p.rowspan() - 1 ? [ p ] : [];
        });
      });

      // dedupe
      var unique = [];
      Arr.each(ending, function (ed) {
        var existing = Arr.exists(unique, function (a) {
          return eq(a.element(), ed.element());
        });
        console.log('ed: element', ed.element(), ending.length, existing);

        if (!existing) unique.push(ed);
      });

      console.log('unique: ', unique.length);

      var nextRow = Arr.bind(unique, function (cell) {
        console.log('Inspecting next row:  rIndex: ', rindex, 'row', cell.row(), 'span', cell.rowspan(), 'cell', cell.element());
        // Skip cells which are already getting span changes.
        console.log('element: ', cell.element());
        // if (isSpanner(cell)) return [];
        var res = Util.repeat(cell.colspan(), Fun.curry(nuCell, cell));
        console.log('res: ', res, cell.colspan());
        return res;
      });

      var after = {
        element: next.element,
        cells: Fun.constant(nextRow)
      };

      return [{
        element: Fun.constant(row.element()),
        cells: Fun.constant(currentRow)
      }, after];
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, nuRow, nuCell, eq) {
      var operation = function (context, start, cells) {
        console.log('context: ', context.length);
        var spanners = Arr.bind(context, function (span) {
          return span.fold(function () {
            return [];
          }, function (whole) {
            return [];
          }, function (p, offset) {
            return start.row() < p.row() + p.rowspan() - 1 ? [ p ] : [];
          });
        });

        var isSpanner = function (candidate) {
          return Arr.exists(spanners, function (sp) {
            console.log('sp: ', sp.element(), 'candidate: ', candidate.element());
            return eq(candidate.element(), sp.element());
          });
        };

        return Arr.bind(cells, function (row, rindex) {
          if (rindex === start.row()) {
            return expandCurrent(row, rindex, nuRow, nuCell, isSpanner, context, eq);
          } else {
            return expandPrev(row, isSpanner);
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
