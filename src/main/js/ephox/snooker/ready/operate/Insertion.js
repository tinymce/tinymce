define(
  'ephox.snooker.ready.operate.Insertion',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.ready.lookup.Blocks',
    'ephox.snooker.ready.model.Warehouse'
  ],

  function (Arr, Merger, Fun, Option, Blocks, Warehouse) {
    var operate = function (warehouse, rowIndex, colIndex, operation) {
      /* 
         The process:

         Identify which cell has selection focus
         Work out the real column of that cell
         Find all the cells on that column
         Apply operation
       */

      var cells = warehouse.all();
      console.log('cells: ', cells);
      var initial = Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row[colIndex]);
      });

      return initial.map(function (start) {
        var column = Blocks.column(warehouse, start.column());
        return Arr.map(column, function (context) {
          var before = context.before();
          var after = context.after();
          var on = operation(context.on());
          return {
            cells: Fun.constant(context.before().concat(on).concat(context.after())),
            element: context.row().element
          };
        });
      }).getOrThunk(function () {
        console.log('not finding it!');
        // This won't be right ... won't be in the elemnt, cells format *
        return warehouse.all();
      });
    };

    var adjust = function (cell, delta) {
      return Merger.merge(cell, {
        colspan: Fun.constant(cell.colspan() + delta)
      });
    };

    var insertAfter = function (input, cx, cy, nu) {
      var operation = function (on) {
        return on.fold(function () {
          return [];
        }, function (whole) {
          return [ whole, nu(whole) ];
        }, function (partial, offset) {
          return offset < partial.colspan() - 1 ? [ adjust(partial, 1) ] : [ partial, nu(partial) ];
        });
      };

      return operate(input, cx, cy, operation);
    };

    var insertBefore = function (input, cx, cy, nu) {
      var operation = function (on) {
        return on.fold(function () {
          return [];
        }, function (whole) {
          return [ nu(whole), whole ];
        }, function (partial, offset) {
          return offset === 0 ? [ nu(partial), partial ] : [ adjust(partial, 1) ];
        });
      };

      return operate(input, cx, cy, operation);
    };

    // Should this really be in a module called Insertion?
    var erase = function (input, cx, cy) {
      var operation = function (on) {
        return on.fold(function (whole) {
          return [];
        }, function (partial, offset) {
          return [ adjust(partial, -1) ];
        });
      };

      return operate(input, cx, cy, operation);
    };

    return {
      insertAfter: insertAfter,
      insertBefore: insertBefore,
      erase: erase
    };
  }
);
