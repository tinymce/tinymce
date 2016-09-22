define(
  'ephox.robin.zone.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.ClusterSearch',
    'ephox.robin.words.Clustering',
    'ephox.robin.zone.LanguageZones',
    'ephox.robin.zone.ZoneWalker',
    'ephox.robin.zone.Zones'
  ],

  function (Fun, Option, Parent, ClusterSearch, Clustering, LanguageZones, ZoneWalker, Zones) {
    var rangeOn = function (universe, first, last, envLang) {
      var ancestor = universe.eq(first, last) ? Option.some(first) : universe.property().parent(first);
      return ancestor.map(function (parent) {
        var defaultLang = LanguageZones.getDefault(universe, parent).getOr(envLang);
        return ZoneWalker.walk(universe, first, last, defaultLang);
      });
    };

    var fromBounded = function (universe, left, right, envLang) {
      var groups = Parent.subset(universe, left, right).bind(function (children) {
        if (children.length === 0) return Option.none();
        var first = children[0];
        var last = children[children.length - 1];
        return rangeOn(universe, first, last, envLang);
      }).getOr([ ]);

      return Zones.fromWalking(universe, groups);
    };

    var fromRange = function (universe, start, finish, envLang) {
      var toLeft = ClusterSearch.creepLeft(universe, start, Fun.constant(false));
      var toRight = ClusterSearch.creepRight(universe, finish, Fun.constant(false));

      var left = toLeft.length > 0 ? toLeft[toLeft.length - 1].item() : start;
      var right = toRight.length > 0 ? toRight[toRight.length - 1].item() : finish;
      return fromBounded(universe, left, right, envLang);
    };

    var fromInline = function (universe, element, envLang) {
      // Create a cluster that branches to the edge of words, and then apply the zones. We will move
      // past language boundaries, because we might need to be retokenizing words post a language
      // change
      var bounded = Clustering.byBoundary(universe, element);
      return bounded.isEmpty() ? empty() : fromBounded(universe, bounded.left(), bounded.right(), envLang);
    };

    var empty = function () {
      return {
        zones: Fun.constant([ ])
      };
    };

    return {
      fromRange: fromRange,
      fromBounded: fromBounded,
      fromInline: fromInline,
      empty: empty
    };
  }
);