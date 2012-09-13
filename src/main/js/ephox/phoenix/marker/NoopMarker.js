define(
  'ephox.phoenix.marker.NoopMarker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot'
  ],

  function (Option, Spot) {
    return function (child, offset) {

      var original = function () {
        return Spot.point(child, offset);
      };

      var get = function () {
        var r = original();
        return Option.some(r);
      };

      return {
        original: original,
        get: get,
        calculate: get
      };
    };
  }
);
