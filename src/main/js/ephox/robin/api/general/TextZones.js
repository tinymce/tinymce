define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.words.BoundedCluster',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.ExpandingCluster'
  ],

  function (Fun, Descent, BoundedCluster, Clustering, ExpandingCluster) {
    var inline = function (universe, element, envLang) {
      // Create a cluster that branches to the edge of words, and then apply the zones.
      var cluster = Clustering.words(universe, element, Fun.constant(false));
      var all = cluster.all();
      return all.length > 1 ? BoundedCluster.scour(universe, all[0].item(), all[all.length - 1].item(), envLang)
        : ExpandingCluster.fromCluster(universe, cluster, envLang);
    };

    var single = function (universe, element, envLang) {
      if (universe.property().isBoundary(element)) return BoundedCluster.scour(universe, element, element, envLang);
      else if (universe.property().isEmptyTag(element)) return empty();
      else if (universe.property().isText(element)) return ExpandingCluster.scour(universe, element, envLang);
      else return inline(universe, element);
    };

    var range = function (universe, start, soffset, finish, foffset, envLang) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang);      
      return BoundedCluster.scour(universe, startPt.element(), finishPt.element(), envLang);
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