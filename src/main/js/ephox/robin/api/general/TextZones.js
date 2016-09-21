define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.robin.words.BoundedCluster',
    'ephox.robin.words.ExpandingCluster'
  ],

  function (Fun, BoundedCluster, ExpandingCluster) {
    var single = function (universe, element) {
      if (universe.property().isBoundary(element)) return BoundedCluster.scour(universe, element, element);
      else if (universe.property().isEmptyTag(element)) return empty();
      else return ExpandingCluster.scour(universe, element);
    };

    var range = function (universe, start, soffset, finish, foffset) {
      if (universe.eq(start, finish)) return single(universe, start);
      else return BoundedCluster.scour(universe, start, finish);
    };

    var empty = function () {
      return {
        zones: Fun.constant([ ])
      };
    };

    return {
      single: single,
      range: range,
      empty: empty
    };
  }
);