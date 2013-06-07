define(
  'ephox.polaris.parray.Split',

  [
    'ephox.compass.Arr',
    'ephox.polaris.parray.Translate'
  ],

  function (Arr, Translate) {
    var inUnit = function (unit, position) {
      return position >= unit.start() && position <= unit.finish();
    };

    var divide = function (unit, positions, subdivide) {
      var mini = subdivide(unit, positions);
      return Translate.translate(mini, unit.start());
    };

    var splits = function (parray, positions, subdivide) {
      if (positions.length === 0) return parray;

      return Arr.bind(parray, function (unit) {
        var relevant = Arr.bind(positions, function (pos) {
          return inUnit(unit, pos) ? [ pos - unit.start() ] : [];
        });

        return relevant.length > 0 ? divide(unit, relevant, subdivide) : [ unit ];
      });
    };

    return {
      splits: splits
    };
  }
);
