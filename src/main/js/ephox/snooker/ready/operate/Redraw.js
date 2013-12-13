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
        var tr = row.element();
        Arr.each(row, function (cell) {
          Attr.set(cell.id(), 'colspan', cell.colspan());
          Attr.set(cell.id(), 'rowspan', cell.rowspan());
          Insert.append(tr, cell.id());
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
