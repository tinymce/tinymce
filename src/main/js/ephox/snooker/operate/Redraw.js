define(
  'ephox.snooker.operate.Redraw',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Attr, Insert, InsertAll, Remove, SelectorFind) {
    var setIfNot = function (element, property, value, ignore) {
      if (value === ignore) Attr.remove(element, property);
      else Attr.set(element, property, value);
    };

    var render = function (table, list) {
      var tbody = SelectorFind.child(table, 'tbody').getOrDie();
      // ****************************8 NOTE: This isn't going to work if there are theads?
      Remove.empty(tbody);

      var rows = Arr.map(list, function (row) {
        var tr = row.element();
        Remove.empty(tr);
        Arr.each(row.cells(), function (cell) {
          setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
          setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
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
