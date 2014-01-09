define(
  'ephox.snooker.operate.ColumnModification',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.Warehouse'
  ],

  function (Arr, Merger, Fun, Option, Structs, Blocks, Warehouse) {
    // Returns a list of RowData. [(element: Element, cells: List[Extended])]
    var operate = function (warehouse, rowIndex, colIndex, operation) {
      /* 
         The process:

         Identify which cell has selection focus
         Work out the real column of that cell
         Find all the cells on that column
         Apply operation
       */

      var cells = warehouse.all();
      // Identify the actual DOM position of the cell.
      var initial = Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row.cells()[colIndex]);
      });

      return initial.map(function (start) {
        /* Retrieve a list for each row of using the grid column (not DOM column) of cell as a pivot:
         *  row: Element
         *  before: List[Extended],
         *  after : List[Extended],
         *  on: CellType
         */
        var column = Blocks.column(warehouse, start.column());
        return Arr.map(column, function (context, i) {
          var before = context.before();
          var after = context.after();
          var on = operation(context.on());

          var resultant = context.before().concat(on).concat(context.after());
          return Structs.rowdata(context.row(), resultant);
        });
      }).getOrThunk(function () {
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      return Merger.merge(cell, {
        colspan: Fun.constant(cell.colspan() + delta)
      });
    };

    var insertAfter = function (warehouse, rowIndex, colIndex, generators, eq) {
      /* Situations: 
           None => there is no cell in this particular column on this row, but if there is one 
                   that spans here from another row, create a new cell to represent this inserted
                   column (same as insertBefore)
           Whole => Insert a cell after the whole cell, and return the whole cell as well in (current, new) order.
           Partial => Insert a cell after the partial cell if we are the last offset of the partial cell, 
                      otherwise, adjust its colspan so that it spans an extra column.
       */
      var operation = function (on) {
        return on.fold(function () {
          var occupant = Warehouse.getAt(warehouse, rowIndex, colIndex);
          return occupant.fold(function () {
            return [];
          }, function (occ) {
            return [ generators.cell(occ) ];
          });
        }, function (whole) {
          return [ whole, generators.cell(whole) ];
        }, function (partial, offset) {
          var lastOffset = partial.colspan() - 1;
          return offset < lastOffset ? [ adjust(partial, 1) ] : [ partial, generators.cell(partial) ];
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var insertBefore = function (warehouse, rowIndex, colIndex, generators, eq) {
      // Returns a list of extended cell information to be inserted within the before and after
      // for the row.
      var operation = function (on) {
        /* Situations: 
           None => there is no cell in this particular column on this row, but if there is one 
                   that spans here from another row, create a new cell to represent this inserted
                   column
           Whole => Insert a cell before the whole cell, and return the whole cell as well in (new, current) order
           Partial => Insert a cell before the partial cell if we are at the start of the partial cell, 
                      otherwise, adjust its colspan so that it spans an extra column.
         */
        return on.fold(function () {
          var occupant = Warehouse.getAt(warehouse, rowIndex, colIndex);
          return occupant.fold(function () {
            return [];
          }, function (occ) {
            return [ generators.cell(occ) ];
          });
        }, function (whole) {
          return [ generators.cell(whole), whole ];
        }, function (partial, offset) {
          return offset === 0 ? [ generators.cell(partial), partial ] : [ adjust(partial, 1) ];
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var erase = function (warehouse, rowIndex, colIndex, generators, eq) {
      /* Situations: 
           None => there is no cell in this particular column on this row, don't do anything
           Whole => remove the cell
           Partial => remove 1 from the colspan
       */
      var operation = function (on) {
        return on.fold(function () {
          return [];
        }, function (whole) {
          return [];
        }, function (partial, offset) {
          return [ adjust(partial, -1) ];
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var replaceElement = function (generators, cell, tag, scope) {
      var replica = generators.replace(cell.element(), tag, {
        scope: scope
      });
      return Merger.merge(cell, {
        element: Fun.constant(replica)
      });
    };

    var header = function (tag, scope, warehouse, rowIndex, colIndex, generators, eq) {
      var replace = function (cell) {
        return replaceElement(generators, cell, tag, scope);
      };

      var operation = function (on) {
        return on.fold(function() {
          return [];
        }, function (whole) {
          return [ replace(whole) ];
        }, function (partial, _offset) {
          return [ replace(partial) ];
        });
      };

      return operate(warehouse, rowIndex, colIndex, operation);
    };

    var makeHeader = Fun.curry(header, 'th', 'row');
    var unmakeHeader = Fun.curry(header, 'td', null);

    return {
      insertAfter: insertAfter,
      insertBefore: insertBefore,
      erase: erase,
      makeHeader: makeHeader,
      unmakeHeader: unmakeHeader
    };
  }
);

/*

return Arr.bind(cells, function (row) {
  return Arr.bind(row.cells(), function (cell) {
    if (isSpanner) adjust(+1)
    else {
      if isEndedSpan(cell) [ /// yeah, that approach won't work for spanning ... I need to know that I'm on a span row.
      // How do I know when to insert another cell?]
      else if (cell.column() === target) [ nu, this ]  
    }
  });
})


*/