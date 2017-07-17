define(
  'ephox.snooker.operate.Redraw',

  [
    'ephox.compass.Arr',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.InsertAll',
    'ephox.syrup.api.Remove',
    'ephox.syrup.api.SelectorFind',
    'ephox.syrup.api.Traverse'
  ],

  function (Arr, Attr, Element, Insert, InsertAll, Remove, SelectorFind, Traverse) {
    var setIfNot = function (element, property, value, ignore) {
      if (value === ignore) Attr.remove(element, property);
      else Attr.set(element, property, value);
    };

    var render = function (table, list) {
      // NOTE: It is an accepted limitation that we are only dealing with tbodys and not thead/tfoot.
      var tbody = SelectorFind.child(table, 'tbody').getOrThunk(function () {
        var tb = Element.fromTag('tbody', Traverse.owner(table).dom());
        Insert.append(table, tb);
        return tb;
      });

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
