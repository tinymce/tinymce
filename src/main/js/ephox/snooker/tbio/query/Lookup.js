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
      var widths = [];

      // find the width of the 1st column 
      var data = model.data();
      for (var i = 0; i < model.columns(); i++) {
        Arr.find(info, function (_, r) {
          var key = CellLookup.key(r, i);
          var cell = data[key];
          if (cell && cell.colspan() === 1 && widths[i] === undefined) {
            widths[i] = Css.get(cell.id(), 'width');
          }
        });
      }

      return widths;
    };

    return {
      information: information,
      widths: widths
    };
  }
);
