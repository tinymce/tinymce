define(
  'ephox.raptor.util.Transforms',

  [
    'ephox.phoenix.gather.GatherResult',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (GatherResult, Node, Traverse) {

    var leaf = function (iterator, element, prune, transform) {
      var r = transform(element);
      return GatherResult(r, false);
    };

    var children = function (iterator, element, prune, transform) {
      var xs = Traverse.children(element);
      var result = iterator(xs, function (iter, elem, p) {
        return traverse(iter, elem, p, transform);
      }, prune);

      if (result.pruned()) return result;
      else return GatherResult([element], false);
    };

    var traverse = function (iterator, element, prune, transform) {
      var f = Traverse.children(element).length === 0 ? leaf : children;
      return f(iterator, element, prune, transform);
    };

    return {
      traverse: traverse
    };

  }
);
