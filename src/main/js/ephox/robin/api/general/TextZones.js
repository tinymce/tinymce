define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.words.BoundedCluster',
    'ephox.robin.words.Clustering'
  ],

  function (Fun, Descent, BoundedCluster, Clustering) {
    var inline = function (universe, element, envLang) {
      // Create a cluster that branches to the edge of words, and then apply the zones. We will move
      // pass language boundaries, because we might need to be retokenizing words post a language
      // change
      var bounded = Clustering.byBoundary(universe, element);
      return bounded.isEmpty() ? empty() : BoundedCluster.scour(universe, bounded.left(), bounded.right(), envLang);
    };

    var single = function (universe, element, envLang) {
      // console.log('single', element.dom());
      if (universe.property().isBoundary(element)) return BoundedCluster.scour(universe, element, element, envLang);
      else if (universe.property().isEmptyTag(element)) return empty();
      else return inline(universe, element, envLang);
    };

    var range = function (universe, start, soffset, finish, foffset, envLang) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      // console.log('range', startPt.element().dom(), finishPt.element().dom());
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