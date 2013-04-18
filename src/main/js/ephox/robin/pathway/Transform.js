define(
  'ephox.robin.pathway.Transform',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.gather.GatherResult',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, GatherResult, Traverse) {
    var descend = function (iterator, element, prune) {
      var xs = Traverse.children(element);
      var result = iterator(xs, function (iter, elem, p) {
        return traverse(iter, elem, p);
      }, prune);

      return result.pruned() ? result : GatherResult([element], false);
    };

    return function (iterator, element, prune) {
      var f = Traverse.children(element).length === 0 ? Fun.constant(GatherResult([element], false)) : descend;
      return f(iterator, element, prune);
    };
  }
);
