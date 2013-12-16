define(
  'ephox.snooker.ready.operate.Redraw',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Attr, Insert, InsertAll, Remove, SelectorFind) {
    var render = function (table, list) {
      var tbody = SelectorFind.child(table, 'tbody').getOrDie();
      Remove.empty(tbody);

      var rows = Arr.map(list, function (row) {
        console.log("row: ", row.element());
        var tr = row.element();
        Remove.empty(tr);
        Arr.each(row.cells(), function (cell) {
          Attr.set(cell.element(), 'colspan', cell.colspan());
          Attr.set(cell.element(), 'rowspan', cell.rowspan());
          Insert.append(tr, cell.element());
        });
        return tr;
      });

      InsertAll.append(tbody, rows);
    };

    return {
      render: render
    };
  }
);
