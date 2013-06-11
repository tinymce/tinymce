define(
  'ephox.robin.parent.Subset',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Arr, Fun, Option) {
    var eq = function (universe, item) {
      return Fun.curry(universe.eq, item);
    };

    var unsafeSubset = function (universe, common, ps1, ps2) {
      var children = universe.property().children(common);
      if (universe.eq(common, ps1[0])) return Option.some([ ps1[0] ]);
      if (universe.eq(common, ps2[0])) return Option.some([ ps2[0] ]);

      var finder = function (ps) {
        var index = Arr.findIndex(ps, eq(universe, common));
        var item = index > 0 ? ps[index - 1] : ps[0];
        return Arr.findIndex(children, eq(universe, item));
      };

      var startIndex = finder(ps1);
      var endIndex = finder(ps2);

      return startIndex > -1 && endIndex > -1 ? Option.some(children.slice(startIndex, endIndex + 1)) : Option.none();
    };

    var subset = function (universe, start, end) {
      var ps1 = [start].concat(universe.up().all(start));
      var ps2 = [end].concat(universe.up().all(end));
      var common = Arr.find(ps1, function (x) {
        return Arr.exists(ps2, eq(universe, x));
      });

      return common !== undefined ? unsafeSubset(universe, common, ps1, ps2) : Option.none();
    };

    return {
      subset: subset
    };
  }
);
