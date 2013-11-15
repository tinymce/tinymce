define(
  'ephox.snooker.tbio.Yeco',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.croc.CellGroups',
    'ephox.snooker.croc.CellLookup'
  ],

  function (Arr, Merger, Fun, Option, CellGroups, CellLookup) {
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

    var operate = function (input, cx, cy, operation) {
      /* 
         The process:

         Identify which cell has selection focus
         Work out the real column of that cell
         Find all the cells on that column
         Apply operation
       */

      var model = CellLookup.model(input);
      var cells = model.all();
      var cell = Option.from(cells[cy]).bind(function (row) {
        return Option.from(row[cx]);
      });

      return cell.map(function (td) {
        var details = CellGroups.hackColumn(model, td.column());
        return Arr.map(details, function (detail) {
          var before = detail.before();
          var after = detail.after();
          var on = operation(detail.on());
          return detail.before().concat(on).concat(detail.after());
        });
      }).getOr(input);
    };

    var adjust = function (cell, delta) {
      return Merger.merge(cell, {
        colspan: Fun.constant(cell.colspan() + delta)
      });
    };

    var insertAfter = function (input, cx, cy, nu) {
      var operation = function (on) {
        return on.fold(function (whole) {
          return [ whole, nu(whole) ];
        }, function (partial, offset) {
          return offset < partial.colspan() - 1 ? [ adjust(partial, 1) ] : [ partial, nu(partial) ];
        });
      };

      return operate(input, cx, cy, operation);
    };

    var insertBefore = function (input, cx, cy, nu) {
      var operation = function (on) {
        return on.fold(function (whole) {
          return [ nu(whole), whole ];
        }, function (partial, offset) {
          return offset === 0 ? [ nu(partial), partial ] : [ adjust(partial, 1) ];
        });
      };

      return operate(input, cx, cy, operation);
    };

    return {
      erase: erase,
      insertAfter: insertAfter,
      insertBefore: insertBefore
    };
  }
);
