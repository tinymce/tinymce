define(
  'ephox.snooker.activate.Activate',

  [
    'ephox.compass.Arr',
    'ephox.lid.Jam',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Jam, Attr, Class, Css, Element, InsertAll, Remove, SelectorExists, SelectorFilter) {
    var glossy = function (table) {
      if (SelectorExists.descendant(table, '.mogel')) plain(table);
      var rows = SelectorFilter.descendants(table, 'tr');
      Arr.each(rows, function (row, i) {
        var cells = SelectorFilter.children(row, 'td');
        var newCells = Jam.intersperseThunk(cells, function () {
          var r = Element.fromTag('td');
          Class.add(r, 'mogel');
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

    var plain = function (table) {
      var cells = SelectorFilter.descendants(table, '.mogel');
      Arr.each(cells, Remove.remove);
    };

    return {
      glossy: glossy,
      plain: plain
    };
  }
);
