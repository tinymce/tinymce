define(
  'ephox.robin.test.ZoneObjects',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var raw = function (universe, zones) {
      return Arr.map(zones, function (zone) {
        return {
          lang: zone.lang(),
          elements: Arr.map(zone.elements(), universe.property().getText),
          words: Arr.map(zone.words(), function (w) { return w.word(); })
        };
      });
    };

    return {
      raw: raw
    };
  }
);