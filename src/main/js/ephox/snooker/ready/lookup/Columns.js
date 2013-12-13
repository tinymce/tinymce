define(
  'ephox.snooker.ready.lookup.Columns',

  [
  ],

  function () {
    // Takes a list of list of (id, colspan, rowspan) structs and returns the a list of cells representing columns.
    var derive = function (info) {
      var model = CellLookup.model(info);
      var ws = [];

      // find the width of the 1st column 
      var data = model.data();
      for (var i = 0; i < model.columns(); i++) {
        Arr.find(info, function (_, r) {
          var key = CellLookup.key(r, i);
          var cell = data[key];
          if (cell && cell.colspan() === 1 && ws[i] === undefined) ws[i] = cell.id();
        });
      }

      return ws;
    };

    return {
      derive: derive
    };
  }
);
