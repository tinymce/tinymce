define(
  'ephox.robin.zone.TextZone',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.words.ClusterSearch',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.WordDecision',
    'ephox.robin.zone.LanguageZones',
    'ephox.robin.zone.TextZones'
  ],

  function (Option, Descent, ClusterSearch, Clustering, WordDecision, LanguageZones, TextZones) {
    // a Text Zone enforces a language, and returns Option.some only if a single zone was identified
    // with that language.
    var filterZone = function (zone, onlyLang) {
      return zone.lang() === onlyLang ? Option.some(zone) : Option.none();
    };

    var fromBoundedWith = function (universe, left, right, envLang, onlyLang, transform) {
      var output = TextZones.fromBoundedWith(universe, left, right, envLang, transform);
      var zones = output.zones();
      return zones.length === 1 ? filterZone(zones[0], onlyLang) : Option.none();
    };

    var fromBounded = function (universe, left, right, envLang, onlyLang) {
      return fromBoundedWith(universe, left, right, envLang, onlyLang, WordDecision.detail);
    };

    var fromRange = function (universe, start, finish, envLang, onlyLang) {
      var isLanguageBoundary = LanguageZones.strictBounds(envLang, onlyLang);
      var edges = Clustering.getEdges(universe, start, finish, isLanguageBoundary);
      var transform = TextZones.tranformEdges(edges.left(), edges.right());
      return fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
    };

    var fromInline = function (universe, element, envLang, onlyLang) {
      var isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
      var edges = Clustering.getEdges(universe, element, element, isLanguageBoundary);
      var transform = TextZones.transformEdges(edges.left(), edges.right());
      return edges.isEmpty() ? scour(universe, element, envLang, onlyLang) :
        fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
    };

    var scour = function (universe, element, envLang, onlyLang) {
      var lastOffset = universe.property().isText(element) ? universe.property().getText(element) : universe.property().children(element).length;
      var left = Descent.toLeaf(universe, element, 0);
      var right = Descent.toLeaf(universe, element, lastOffset);
      return fromBounded(universe, left.element(), right.element(), envLang, onlyLang);
    };

    var empty = function () {
      return Option.none();
    };

    return {
      fromRange: fromRange,
      fromBounded: fromBounded,
      fromInline: fromInline,
      empty: empty
    };
  }
);