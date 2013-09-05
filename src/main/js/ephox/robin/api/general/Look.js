define(
  'ephox.robin.api.general.Look',

  [
    'ephox.robin.look.Look'
  ],

  function (Look) {
    var selector = function (universe, sel) {
      return Look.selector(universe, sel);
    };

    var predicate = function (universe, pred) {
      return Look.predicate(universe, pred);
    };

    var exact = function (universe, item) {
      var pred = function (other) {
        return universe.eq(item, other);
      };

      return Look.predicate(universe, pred);
    };

    return {
      selector: selector,
      predicate: predicate,
      exact: exact
    };
  }
);
