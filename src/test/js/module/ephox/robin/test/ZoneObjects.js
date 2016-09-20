define(
  'ephox.robin.test.ZoneObjects',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.compass.Arr'
  ],

  function (RawAssertions, Arr) {
    var raw = function (universe, zones) {
      return Arr.map(zones, function (zone) {
        return {
          lang: zone.lang(),
          elements: Arr.map(zone.elements(), function (elem) { return elem.id; }),
          words: Arr.map(zone.words(), function (w) { return w.word(); })
        };
      });
    };

    var assertZones = function (label, universe, expected, zones) {
      var rawActual = raw(universe, zones);
      RawAssertions.assertEq(label + '\nChecking zones: ', expected, rawActual);
    };

    return {
      raw: raw,
      assertZones: assertZones
    };
  }
);