define(
  'ephox.robin.api.general.Parent',

  [
    'ephox.robin.parent.Breaker',
    'ephox.robin.parent.Look',
    'ephox.robin.parent.Shared',
    'ephox.robin.parent.Subset'
  ],

  function (Breaker, Look, Shared, Subset) {
    var lookFor = function (universe, element) {
      var predicate = function (elem) {
        return universe.eq(element, elem);
      };

      return lookUntil(universe, predicate);
    };

    var lookUntil = function (universe, predicate) {
      return Look.predicate(predicate);
    };

    var sharedOne = function (universe, look, elements) {
      return Shared.oneAll(universe, look, elements);
    };

    var subset = function (universe, start, finish) {
      return Subset.subset(universe, start, finish);
    };

    var breakAt = function (universe, parent, child) {
      return Breaker.breakAt(universe, parent, child);
    };

    return {
      sharedOne: sharedOne,
      lookFor: lookFor,
      lookUntil: lookUntil,
      subset: subset,
      breakAt: breakAt
    };
  }
);
