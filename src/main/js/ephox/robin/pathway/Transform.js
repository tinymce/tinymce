define(
  'ephox.robin.pathway.Transform',

  [
    'ephox.phoenix.api.data.GatherResult'
  ],

  function (GatherResult) {
    return function (universe) {
      var descend = function (iterator, element, prune) {
        var xs = universe.property().children(element);
        var result = iterator(xs, function (iter, elem, p) {
          return traverse(iter, elem, p);
        }, prune);

        return result.pruned() ? result : GatherResult([element], false);
      };

      /**
       * Used by gather.Iterator (the 'f' variable).
       *
       * Recursively descends into children, which uses the iterator to find elements to call this function on.
       */
      var traverse = function (iterator, element, prune) {
        return universe.property().children(element).length === 0 ?
          GatherResult([element], false) :
          descend(iterator, element, prune);
      };

      return traverse;
    };
  }
);
