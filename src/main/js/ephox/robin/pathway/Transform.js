define(
  'ephox.robin.pathway.Transform',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.api.data.GatherResult'
  ],

  function (Fun, GatherResult) {
    return function (universe) {
      var descend = function (iterator, element, prune) {
        var xs = universe.property().children(element);
        var result = iterator(xs, function (iter, elem, p) {
          return traverse(iter, elem, p);
        }, prune);

        return result.pruned() ? result : GatherResult([element], false);
      };

      var traverse = function (iterator, element, prune) {
        var f = universe.property().children(element).length === 0 ? Fun.constant(GatherResult([element], false)) : descend;
        return f(iterator, element, prune);
      };

      return traverse;
    };    
  }
);
