import { GatherResult } from '@ephox/phoenix';



export default <any> function (universe) {
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

  /**
   * Used by gather.Iterator (the 'f' variable).
   * Recursively descends into children using iterator.
   *
   * Applies the transform to every leaf.
   */
  var traverse = function (iterator, element, prune, transform) {
    var f = universe.property().isText(element) ? leaf : children;
    return f(iterator, element, prune, transform);
  };

  return {
    traverse: traverse
  };
};