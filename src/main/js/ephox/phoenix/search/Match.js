define(
  'ephox.phoenix.search.Match',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.marker.Marker',
    'ephox.phoenix.util.option.Pipe'
  ],

  function (Spot, Marker, Pipe) {
    return function (begin, end) {

      var find = function (marker) {
        var r = marker.get();
        return r.map(function (v) {
          return Spot.point(v.element(), v.offset());
        });
      };

      var start = Marker(begin.element(), begin.offset());
      var finish = Marker(end.element(), end.offset());

      var get = function () {
        var s = find(start);
        var f = find(finish);
        return Pipe.pipe(s, f, Spot.points);
      };

      var original = function () {
        return Spot.points(begin, end);
      };

      return {
        get: get,
        original: original
      };
    };
  }
);
