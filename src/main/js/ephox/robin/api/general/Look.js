define(
  'ephox.robin.api.general.Look',

  [
    'ephox.robin.look.Look'
  ],

  function (Look) {
    var selector = function (universe, sel) {
      return Look.selector(sel);
    };

    var predicate = function (universe, pred) {
      return Look.predicate(pred);
    };

    var exact = function (universe, item) {
      var pred = function (other) {
        return universe.eq(item, other);
      };

      return Look.predicate(pred);
    };

    return {
      selector: selector,
      predicate: predicate,
      exact: exact
    };
  }
);
