define(
  'ephox.snooker.activate.Activate',

  [
    'ephox.compass.Arr',
    'ephox.lid.Jam',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Jam, Attr, Css, Element, InsertAll, Remove, SelectorFilter) {
    var glossy = function (table) {
      var rows = SelectorFilter.descendants(table, 'tr');
      Arr.each(rows, function (row, i) {
        var cells = SelectorFilter.children(row, 'td');
        var newCells = Jam.intersperseThunk(cells, function () {
          var r = Element.fromTag('td');
          Css.setAll(r, {
            width: '2px',
            background: i === 0 ? 'yellow' : 'none',
            cursor: 'w-resize'
          });
          Attr.set(r, 'contenteditable', 'false');
          console.log('r: ', r.dom());
          return r;
        });
        Remove.empty(row);
        InsertAll.append(row, newCells);
      });
    };

    return {
      glossy: glossy
    };
  }
);
