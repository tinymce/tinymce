define(
  'ephox.snooker.activate.Activate',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Class, Css, Element, Insert, Remove, SelectorExists, SelectorFilter) {
    var activate = function () {
      // var mutation = Mutation();
      // var dragger = Dragger.transform(mutation, )

      var glossy = function (table) {
        if (SelectorExists.descendant(table, '.mogel')) plain(table);
        var rows = SelectorFilter.descendants(table, 'tr');
        Arr.each(rows, function (row, i) {
          var cells = SelectorFilter.children(row, 'td');

          Arr.each(cells, function (cell) {
            var mogel = Element.fromTag('td');
            Class.add(mogel, 'mogel');
            Css.setAll(mogel, {
              width: '4px',
              background: i === 0 ? 'yellow' : 'none',
              cursor: 'w-resize'
            });

            Insert.after(cell, mogel);
          });
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
    };

    return {
      activate: activate
    };
  }
);
