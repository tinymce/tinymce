define(
  'ephox.robin.gather.Transforms',

  [
    'ephox.phoenix.api.data.GatherResult'
  ],

  function (GatherResult) {
    return function (universe) {
      var leaf = function (iterator, element, prune, transform) {
        var r = transform(element);
        return GatherResult(r, false);
      };

      var children = function (iterator, element, prune, transform) {
        var xs = universe.property().children(element);
        return iterator(xs, function (iter, elem, p) {
          return traverse(iter, elem, p, transform);
        }, prune);
      };

      var traverse = function (iterator, element, prune, transform) {
        var f = universe.property().isText(element) ? leaf : children;
        return f(iterator, element, prune, transform);
      };

      return {
        traverse: traverse
      };
    };
  }
);
