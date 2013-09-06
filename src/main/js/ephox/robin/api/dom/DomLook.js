define(
  'ephox.robin.api.dom.DomLook',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.peanut.Fun',
    'ephox.robin.api.general.Look'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Fun, Look) {
    var universe = DomUniverse();

    var selector = function (sel) {
      return Fun.curry(Look.selector(universe, sel), universe);
    };

    var predicate = function (pred) {
      return Fun.curry(Look.predicate(universe, pred), universe);
    };

    var exact = function (element) {
      return Fun.curry(Look.exact(universe, element), universe);
    };

    return {
      selector: selector,
      predicate: predicate,
      exact: exact
    };
  }
);
