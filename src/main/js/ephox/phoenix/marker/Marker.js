define(
  'ephox.phoenix.marker.Marker',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.extract.Find'
  ],

  function (Fun, Spot, Extract, Find) {
    return function (child, offset) {
      var original = function () {
        return Spot.point(child, offset);
      };

      var stored = Extract.extract(child, offset);

      var get = function () {
        var initial = Find.find(child, offset);
        return initial.fold(calculate, Fun.constant(initial));
      };

      var calculate = function () {
        return Find.find(stored.element(), stored.offset());
      };

      return {
        original: original,
        get: get,
        calculate: calculate
      };
    };
  }
);
