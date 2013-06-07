define(
  'ephox.phoenix.family.Parents',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {
    var common = function (universe, item1, item2) {
      var item1parents = [item1].concat(universe.up().all(item1));
      var item2parents = [item2].concat(universe.up().all(item2));

      var r = Arr.find(item1parents, function (x) {
        return Arr.exists(item2parents, function (y) {
          return universe.eq(y, x);
        });
      });

      return Option.from(r);
    };

    return {
      common: common
    };

  }
);
