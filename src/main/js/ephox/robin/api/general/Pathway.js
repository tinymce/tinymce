define(
  'ephox.robin.api.general.Pathway',

  [
    'ephox.robin.pathway.Simplify',
    'ephox.robin.pathway.Transform'
  ],

  function (Simplify, Transform) {
    /**
     * @see Simplify.simplify()
     */
    var simplify = function (universe, elements) {
      return Simplify.simplify(universe, elements);
    };

    var transform = function (universe) {
      return Transform(universe);
    };

    return {
      simplify: simplify,
      transform: transform
    };
  }
);
