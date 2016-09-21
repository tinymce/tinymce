define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.words.BoundedCluster',
    'ephox.robin.words.ExpandingCluster'
  ],

  function (Fun, Descent, BoundedCluster, ExpandingCluster) {
    var single = function (universe, element) {
      if (universe.property().isBoundary(element)) return BoundedCluster.scour(universe, element, element);
      else if (universe.property().isEmptyTag(element)) return empty();
      else return ExpandingCluster.scour(universe, element);
    };

    var range = function (universe, start, soffset, finish, foffset) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element());      
      return BoundedCluster.scour(universe, startPt.element(), finishPt.element());
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