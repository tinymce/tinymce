define(
  'ephox.phoenix.gather.Gather',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.data.Focus',
    'ephox.phoenix.gather.Traversal'
  ],

  function (Arr, Fun, Focus, Traversal) {
    var curry = Fun.curry;
  
    var traverse = function(universe, traversal, element, prune, f) {
      var siblings = across(universe, traversal, element, prune, f);
      return chain(siblings, curry(up, universe, traversal, element, prune, f));
    };

    var gather = function (universe, element, prune, f) {
      var lefts = traverse(universe, Traversal.left(), element, prune, f);
      var rights = traverse(universe, Traversal.right(), element, prune, f);
      var rLeft = Arr.reverse(lefts);
      return Focus(rLeft, element, rights);
    };

    var chain = function (result, f) {
      return result.pruned() ? result.result() : result.result().concat(f());
    };

    var up = function (universe, traversal, element, prune, f) {
      return universe.property().parent(element).fold(function () {
        return [];
      }, function (v) {
        if (prune.stop(v)) {
          return [];
        } else {
          var result = across(universe, traversal, v, prune, f);
          return chain(result, curry(up, universe, traversal, v, prune, f));
        }
      });
    };

    var across = function (universe, traversal, element, prune, f) {
      var xs = traversal.siblings(universe, element);
      return traversal.iter(xs, f, prune);
    };

    return {
      traverse: traverse,
      gather: gather
    };

  }
);
