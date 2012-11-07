define(
  'ephox.robin.gather.Transforms',

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
      return iterator(xs, function (iter, elem, p) {
        return traverse(iter, elem, p, transform);
      }, prune);
    };

    var traverse = function (iterator, element, prune, transform) {
      var f = Node.isText(element) ? leaf : children;
      return f(iterator, element, prune, transform);
    };

    return {
      traverse: traverse
    };
  }
);
