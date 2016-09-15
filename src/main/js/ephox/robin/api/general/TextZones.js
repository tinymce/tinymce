define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.robin.words.Cluster'
  ],

  function (Cluster) {
    var single = function (universe, element) {
      var clusters = universe.property().isBoundary(element) ? Cluster.block : Cluster.inline;
      return clusters(universe, element);
    };

    var range = function (universe, start, soffset, finish, foffset) {

      // return universe.property().isBoundary(element) ? Cluster.block(universe, element) : Cluster.generate(universe, element, optimise);
    };

    return {
      single: single,
      range: range
    };
  }
);