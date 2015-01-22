define(
  'ephox.robin.api.general.Pathway',

  [
    'ephox.robin.pathway.Simplify'
  ],

  function (Simplify) {
    /**
     * @see Simplify.simplify()
     */
    var simplify = function (universe, elements) {
      return Simplify.simplify(universe, elements);
    };

    return {
      simplify: simplify
    };
  }
);
