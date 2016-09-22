define(
  'ephox.robin.zone.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.ZoneWalker',
    'ephox.robin.words.Zones'
  ],

  function (Fun, Option, Parent, Clustering, LanguageZones, ZoneWalker, Zones) {
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

    var fromInline = function (universe, element, envLang) {
      // Create a cluster that branches to the edge of words, and then apply the zones. We will move
      // pass language boundaries, because we might need to be retokenizing words post a language
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
      fromBounded: fromBounded,
      fromInline: fromInline,
      empty: empty
    };
  }
);