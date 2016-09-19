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
      // TODO: Descend first to use the offsets?
      return Cluster.range(universe, start, finish);
    };

    var empty = function () {
      return Cluster.empty();
    };

    return {
      single: single,
      range: range,
      empty: empty
    };
  }
);