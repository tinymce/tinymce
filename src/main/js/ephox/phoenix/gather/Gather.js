define(
  'ephox.phoenix.gather.Gather',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.data.Focus',
    'ephox.phoenix.gather.GatherResult',
    'ephox.phoenix.gather.Traversal',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Focus, GatherResult, Traversal, Traverse) {
    var curry = Fun.curry;
    
    var gather = function (element, prune, f) {
      var lefts = across(Traversal.left(), element, prune, f);
      var l = chain(lefts, curry(up, Traversal.left(), element, prune, f));
      
      var rights = across(Traversal.right(), element, prune, f);
      var r = chain(rights, curry(up, Traversal.right(), element, prune, f));

      var rLeft = Arr.reverse(l);
      return Focus(rLeft, element, r);
    };

    var chain = function (result, f) {
      return result.pruned() ? result.result() : result.result().concat(f());
    };

    var up = function (traversal, element, prune, f) {
      return Traverse.parent(element).fold(function () {
        return [];
      }, function (v) {
        if (prune.stop(v)) {
          return [];
        } else {
          var result = across(traversal, v, prune, f);
          return chain(result, curry(up, traversal, v, prune, f));
        }
      });
    };

    var across = function (traversal, element, prune, f) {
      var xs = traversal.siblings(element);
      return traversal.iter(xs, f, prune);
    };

    return {
      gather: gather
    };

  }
);
