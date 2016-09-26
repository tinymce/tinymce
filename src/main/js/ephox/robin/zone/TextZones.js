define(
  'ephox.robin.zone.TextZones',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.WordDecision',
    'ephox.robin.zone.LanguageZones',
    'ephox.robin.zone.ZoneWalker',
    'ephox.robin.zone.Zones'
  ],

  function (Fun, Option, Parent, Clustering, WordDecision, LanguageZones, ZoneWalker, Zones) {
    var rangeOn = function (universe, first, last, envLang, transform) {
      var ancestor = universe.eq(first, last) ? Option.some(first) : universe.property().parent(first);
      return ancestor.map(function (parent) {
        var defaultLang = LanguageZones.calculate(universe, parent).getOr(envLang);
        return ZoneWalker.walk(universe, first, last, defaultLang, transform);
      });
    };

    var fromBoundedWith = function (universe, left, right, envLang, transform) {
      var groups = Parent.subset(universe, left, right).bind(function (children) {
        if (children.length === 0) return Option.none();
        var first = children[0];
        var last = children[children.length - 1];
        return rangeOn(universe, first, last, envLang, transform);
      }).getOr([ ]);

      return Zones.fromWalking(universe, groups);
    };

    var fromBounded = function (universe, left, right, envLang) {
      return fromBoundedWith(universe, left, right, envLang, WordDecision.detail);
    };

    var fromRange = function (universe, start, finish, envLang) {
      var edges = Clustering.getEdges(universe, start, finish, Fun.constant(false));
      var transform = transformEdges(edges.left(), edges.right());
      return fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, transform);
    };

    var transformEdges = function (leftEdge, rightEdge) {
      return function (universe, element) {
        return universe.eq(element, leftEdge.item()) ? leftEdge :
          universe.eq(element, rightEdge.item()) ? rightEdge : WordDecision.detail(universe, element);
      };
    };

    var fromInline = function (universe, element, envLang) {
      // Create a cluster that branches to the edge of words, and then apply the zones. We will move
      // past language boundaries, because we might need to be retokenizing words post a language
      // change
      var bounded = Clustering.byBoundary(universe, element);
      var transform = transformEdges(bounded.left(), bounded.right());
      return bounded.isEmpty() ? empty() : fromBoundedWith(universe, bounded.left().item(), bounded.right().item(), envLang, transform);
    };

    var empty = function () {
      return {
        zones: Fun.constant([ ])
      };
    };

    return {
      fromRange: fromRange,
      transformEdges: transformEdges,
      fromBounded: fromBounded,
      fromBoundedWith: fromBoundedWith,
      fromInline: fromInline,
      empty: empty
    };
  }
);