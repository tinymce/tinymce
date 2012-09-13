define(
  'ephox.phoenix.util.node.Parents',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Compare, Traverse) {

    var parents = function (element) {
      var p = Traverse.parent(element);
      return p.fold(Fun.constant([]), function (v) {
        return [v].concat(parents(v));
      });
    };

    var common = function (e1, e2) {
      var e1parents = [e1].concat(parents(e1));
      var e2parents = [e2].concat(parents(e2));

      var r = Arr.find(e1parents, function (x) {
        return Arr.exists(e2parents, function (y) {
          return Compare.eq(y, x);
        });
      });

      return Option.from(r);
    };

    return {
      common: common
    };
  }
);
