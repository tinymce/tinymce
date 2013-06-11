define(
  'ephox.robin.api.dom.Pathway',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Pathway'
  ],

  function (DomUniverse, Pathway) {
    var universe = DomUniverse();

    var between = function (start, finish) {
      return Pathway.between(universe, start, finish);
    };

    var simplify = function (elements) {
      return Pathway.simplify(universe, elements);
    };

    return {
      between: between,
      simplify: simplify
    };

  }
);
