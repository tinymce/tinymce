define(
  'ephox.robin.api.Parent',

  [
    'ephox.robin.parent.Breaker',
    'ephox.robin.parent.Shared',
    'ephox.robin.parent.Subset'
  ],

  function (Breaker, Shared, Subset) {
    var sharedOne = function (look, elements) {
      return Shared.oneAll(look, elements);
    };

    var sharedMany = function (look, elements) {
      return Shared.manyAll(look, elements);
    };

    var subset = function (start, finish) {
      return Subset.subset(start, finish);
    };

    var breakAt = function (parent, child) {
      return Breaker.breakAt(parent, child);
    };

    return {
      sharedOne: sharedOne,
      sharedMany: sharedMany,
      subset: subset,
      breakAt: breakAt
    };
  }
);
