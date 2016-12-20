define(
  'ephox.sugar.api.dom.Hierarchy',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Fun, Option, Compare, Traverse) {
    /*
     * The exported functions in this module are:
     * a) path: Generates a list of child indices from the ancestor to the descendant
     * b) follow: Follows a path of child indices from an ancestor to reach a descendant
     */
    var up = function (descendant, stopper) {
      if (stopper(descendant)) return Option.some([]);
      return Traverse.parent(descendant).bind(function (parent) {
        return Traverse.findIndex(descendant).bind(function (index) {
          return up(parent, stopper).map(function (rest) {
            return rest.concat([ index ]);
          });
        });
      });
    };

    var path = function (ancestor, descendant) {
      var stopper = Fun.curry(Compare.eq, ancestor);
      return Compare.eq(ancestor, descendant) ? Option.some([]) : up(descendant, stopper);
    };

    var follow = function (ancestor, descendantPath) {
      if (descendantPath.length === 0) return Option.some(ancestor);
      else {
        return Traverse.child(ancestor, descendantPath[0]).bind(function (child) {
          return follow(child, descendantPath.slice(1));
        });
      }
    };

    return {
      path: path,
      follow: follow
    };
  }
);