define(
  'ephox.robin.parent.Subset',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Compare, Traverse) {
    var eq = function (elem) {
      return Fun.curry(Compare.eq, elem);
    };

    var unsafeSubset = function (common, ps1, ps2) {
      var children = Traverse.children(common);

      if (Compare.eq(common, ps1[0])) return [ ps1[0] ];
      if (Compare.eq(common, ps2[0])) return [ ps2[0] ];

      var finder = function (ps) {
        var index = Arr.findIndex(ps, eq(common));
        var element = index > 0 ? ps[index - 1] : ps[0];
        return Arr.findIndex(children, eq(element));
      };

      var startIndex = finder(ps1);
      var endIndex = finder(ps2);
      return startIndex > -1 && endIndex > -1 ? Option.some(children.slice(startIndex, endIndex + 1)) : Option.none();
    };

    var subset = function (start, end) {
      var ps1 = [start].concat(Traverse.parents(start));
      var ps2 = [end].concat(Traverse.parents(end));

      var common = Arr.find(ps1, function (x) {
        return Arr.exists(ps2, eq(x));
      });

      return common !== undefined ? unsafeSubset(common, ps1, ps2) : Option.none();
    };

    return {
      subset: subset
    };
  }
);
