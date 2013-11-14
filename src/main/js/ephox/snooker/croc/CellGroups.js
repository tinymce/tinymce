define(
  'ephox.snooker.croc.CellGroups',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.croc.CellType'
  ],

  function (Arr, Fun, CellLookup, CellType) {

    var column = function (model, colId) {
      var r = [];
      var data = model.data();
      // TODO: Get rid of the for loop
      for (var i = 0; i < model.rows(); i++) {
        // Give this an API so that it can return option.
        var position = CellLookup.key(i, colId);
        console.log('position: ', position);
        var cell = data[position];
        if (cell !== undefined) {
          var current = cell.colspan() > 1 ?
            CellType.partial(cell, colId - cell.column()) : CellType.whole(cell);
          r.push(current);
        }
      }
      return r;
    };

    var insertAfterCol = function (input, colId) {
      var model = CellLookup.model(input);
      return input;
    };

    var row = function (model, rowId) {

    };

    var hackColumn = function (model, colId) {
      /* Return a list of before, on, after */
      var r = [];
      var all = model.all();
      return Arr.map(all, function (r) {
        var index = Arr.findIndex(r, function (rr, rri) {
          var start = rr.column();
          var end = rr.column() + rr.colspan() - 1;
          /* Find the FIRST cell which would span over this colId */
          return colId >= start && colId <= end;
        });

        // Will want to turn these back into information, rather than model .. but it's a subset.
        var before = r.slice(0, index);
        var after = r.slice(index + 1);
        var on = r[index].colspan() > 1 ? CellType.partial(r[index], colId - r[index].column()) : CellType.whole(r[index]);

        return {
          before: Fun.constant(before),
          after: Fun.constant(after),
          on: Fun.constant(on)
        };
      });

    };

    return {
      column: column,
      row: row,
      insertAfterCol: insertAfterCol,
      hackColumn: hackColumn
    };
  }
);
