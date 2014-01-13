define(
  'ephox.snooker.model.DetailsList',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.Attr'
  ],

  function (Arr, Fun, Structs, TableLookup, Attr) {

    /*
     * Takes a DOM table and returns a list of list of:
       element: row element
       cells: (id, rowspan, colspan) structs
     */
    var fromTable = function (table) {
      var rows = TableLookup.rows(table);
      return Arr.map(rows, function (row) {
        var element = row;
        var cells = Arr.map(TableLookup.cells(row), function (cell) {
          var rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
          var colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
          return Structs.detail(cell, rowspan, colspan);
        });

        return {
          element: Fun.constant(element),
          cells: Fun.constant(cells)
        };
      });
    };

    return {
      fromTable: fromTable
    };
  }
);
