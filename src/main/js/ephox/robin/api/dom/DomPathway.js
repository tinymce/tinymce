define(
  'ephox.robin.api.dom.DomPathway',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Pathway'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Pathway) {
    var universe = DomUniverse();

    var simplify = function (elements) {
      return Pathway.simplify(universe, elements);
    };

    var transform = function () {
      return Pathway.transform(universe);
    };

    return {
      simplify: simplify,
      transform: transform
    };
  }
);
