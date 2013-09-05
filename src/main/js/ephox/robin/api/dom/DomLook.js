define(
  'ephox.robin.api.dom.DomLook',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Look'
  ],

  function (DomUniverse, Look) {
    var universe = DomUniverse();

    var selector = function (sel) {
      return Look.selector(universe, sel);
    };

    var predicate = function (pred) {
      return Look.predicate(universe, pred);
    };

    var exact = function (element) {
      return Look.exact(universe, element);
    };

    return {
      selector: selector,
      predicate: predicate,
      exact: exact
    };
  }
);
