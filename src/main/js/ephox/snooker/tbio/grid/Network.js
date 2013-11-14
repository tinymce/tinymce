define(
  'ephox.snooker.tbio.grid.Network',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Fun, Styles, Attr, Class, Classes, Element, Insert, Remove, SelectorExists, SelectorFilter) {
    var connector = Styles.resolve('connector');

    var clear = function (table) {
      var connectors = SelectorFilter.descendants(table, '.' + connector);
      Arr.map(connectors, Remove.remove);
    };

    /**
     * Given a table, insert connecting cells to the right of each cell. These 
     * will be resize handles.
     */
    var connections = function (table) {
      if (SelectorExists.descendant(table, '.' + connector)) clear(table);

      var rows = SelectorFilter.descendants(table, 'tr');
      Arr.each(rows, function (row, r) {
        var cells = SelectorFilter.children(row, 'td');

        Arr.each(cells, function (cell, c) {
          var columnId = Styles.resolve('column-' + c);
          var connect = Element.fromTag('td');
          Classes.add(connect, [ columnId, connector ]);

          Class.add(cell, columnId);
          Attr.setAll(cell, {
            'data-column-id': j,
            'data-ephox-snooker-column': id
          });

          Insert.after(cell, connect);
        });
      });
    };

    return {
      connections: connections,
      connector: Fun.constant(connector)
    };
  }
);
