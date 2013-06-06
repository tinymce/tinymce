define(
  'ephox.phoenix.ghetto.search.GhettoListSplitter',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.ghetto.search.GhettoSplitter',
    'ephox.phoenix.util.arr.PositionArray'
  ],

  function (Arr, GhettoSplitter, PositionArray) {
    var yipes = function (universe, list, positions) {
      // get all the positions that are within this item.
      var inItem = function (item, position) {
        return position >= item.start() && position <= item.finish();
      };

      var subdivide = function (item, points) {
        var raw = GhettoSplitter.subdivide(universe, item.element(), points);
        return PositionArray.translate(raw, item.start());
      };

      return Arr.bind(list, function (unit) {
        var relevant = Arr.bind(positions, function (pos) {
          return inItem(unit, pos) ? [ pos - unit.start() ] : [];
        });

        return relevant.length > 0 ? subdivide(unit, relevant) : [ unit ];
      });
    };

    return {
      yipes: yipes
    };
  }
);
