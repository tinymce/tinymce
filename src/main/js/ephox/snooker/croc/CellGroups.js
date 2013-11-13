define(
  'ephox.snooker.croc.CellGroups',

  [
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.croc.CellType'
  ],

  function (CellLookup, CellType) {

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

    return {
      column: column,
      row: row,
      insertAfterCol: insertAfterCol
    };
  }
);
