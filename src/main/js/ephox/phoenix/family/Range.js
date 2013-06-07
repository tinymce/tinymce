define(
  'ephox.phoenix.family.Range',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.family.Parents'
  ],

  function (Arr, Fun, Extract, Parents) {
    var index = function (universe, items, item) {
      return Arr.findIndex(items, Fun.curry(universe.eq, item));
    };

    var range = function (universe, item1, delta1, item2, delta2) {
      if (universe.eq(item1, item2)) return [item1];

      return Parents.common(universe, item1, item2).fold(function () {
        return []; // no common parent, therefore no intervening path. How does this clash with Path in robin?
      }, function (parent) {
        var items = Arr.bind(Extract.from(universe, parent), function (item) {
          var no = Fun.constant([]);
          var yes = function (x) { return [ x ]; };
          return item.fold(no, yes, yes);
        });

        var start = index(universe, items, item1);
        var finish = index(universe, items, item2);

        var result = start > -1 && finish > -1 ? items.slice(start + delta1, finish + delta2) : [];
        return Arr.filter(result, universe.property().isText);
      });
    };

    return {
      range: range
    };

  }
);
