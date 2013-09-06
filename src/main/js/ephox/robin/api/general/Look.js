define(
  'ephox.robin.api.general.Look',

  [
    'ephox.peanut.Fun',
    'ephox.robin.look.Look'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Fun, Look) {
    var selector = function (universe, sel) {
      return Look.selector(sel);
    };

    var predicate = function (universe, pred) {
      return Look.predicate(pred);
    };

    var exact = function (universe, item) {
      var itemMatch = Fun.curry(universe.eq, item);

      return Look.predicate(itemMatch);
    };

    return {
      selector: selector,
      predicate: predicate,
      exact: exact
    };
  }
);
