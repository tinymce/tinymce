define(
  'ephox.polaris.test.Parrays',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.polaris.api.PositionArray'
  ],

  function (Fun, Option, PositionArray) {
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

    return {
      make: make
    };
  }
);
