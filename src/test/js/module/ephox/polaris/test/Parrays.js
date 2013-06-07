define(
  'ephox.polaris.test.Parrays',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.polaris.api.PositionArray'
  ],

  function (Arr, Fun, Option, PositionArray) {
    var generator = function (item, start) {
      return Option.some({
        start: Fun.constant(start),
        finish: Fun.constant(start + item.length),
        item: Fun.constant(item)
      });
    };

    var make = function (values) {
      return PositionArray.generate(values, generator);
    };

    var dump = function (parray) {
      return Arr.map(parray, function (unit) {
        return unit.start() + '->' + unit.finish() + '@ ' + unit.item();
      });
    };

    return {
      make: make,
      dump: dump
    };
  }
);
