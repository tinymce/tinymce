define(
  'ephox.snooker.tbio.query.Lookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.croc.CellLookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Fun, CellLookup, Attr, Css, SelectorFilter) {
    /*
     * Takes a DOM table and returns a list of list of (id, colspan, rowspan) structs
     */
    var information = function (table) {
      var rows = SelectorFilter.descendants(table, 'tr');
      return Arr.map(rows, function (row) {
        var cells = SelectorFilter.descendants(row, 'td,th');
        return Arr.map(cells, function (cell) {
          return {
            id: Fun.constant(cell),
            rowspan: Fun.constant(Attr.get(cell, 'rowspan') || 1),
            colspan: Fun.constant(Attr.get(cell, 'colspan') || 1)
          };
        });
      });
    };

    /*
     * Takes a list of list of (id, colspan, rowspan) structs and returns the list of column
     * widths
     */
    var widths = function (info) {
      var model = CellLookup.model(info);
      var ws = [];

      // find the width of the 1st column 
      var data = model.data();
      for (var i = 0; i < model.columns(); i++) {
        Arr.find(info, function (_, r) {
          var key = CellLookup.key(r, i);
          var cell = data[key];
          if (cell && cell.colspan() === 1 && ws[i] === undefined) {
            ws[i] = Css.get(cell.id(), 'width');
          }
        });
      }

      return ws;
    };

    // Massive amoutn of dupe.
    var heights = function (info) {
      var model = CellLookup.model(info);
      var hs = [];

      // find the width of the 1st column 
      var data = model.data();
      for (var r = 0; r < model.rows(); r++) {
        for (var c = 0; c < model.columns(); c++) {
          var key = CellLookup.key(r, c);
          var cell = data[key];
          if (cell && cell.rowspan() === 1 && hs[r] === undefined) {
            hs[r] = Css.get(cell.id(), 'height');
          }
        }
      }

      return hs;

    };

    return {
      information: information,
      widths: widths,
      heights: heights
    };
  }
);
