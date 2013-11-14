define(
  'ephox.snooker.tbio.query.Groupings',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.tbio.grid.Network',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Option, Network, Class, SelectorFilter) {
    // How will these things interact with col and row spans ... ?
    var row = function (table, index) {
      // Will have to exclude the connector rows when they are introduced.
      var rows = SelectorFilter.descendants(table, 'tr');
      var target = Option.from(rows[index]);
      return target.map(function (tr) {
        var all = SelectorFilter.descendants(tr, 'td,th');
        return Arr.filter(all, function (a) {
          return !Class.has(a, Network.connector());
        });
      }).getOr([]);
    };

    var column = function (table, index) {

    };

    return {
      row: row,
      column: column
    };
  }
);
