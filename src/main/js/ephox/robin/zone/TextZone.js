define(
  'ephox.robin.zone.TextZone',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.words.ClusterSearch',
    'ephox.robin.words.Clustering',
    'ephox.robin.zone.LanguageZones',
    'ephox.robin.zone.TextZones'
  ],

  function (Option, Descent, ClusterSearch, Clustering, LanguageZones, TextZones) {
    // a Text Zone enforces a language, and returns Option.some only if a single zone was identified
    // with that language.
    var filterZone = function (zone, onlyLang) {
      return zone.lang() === onlyLang ? Option.some(zone) : Option.none();
    };

    var fromBounded = function (universe, left, right, envLang, onlyLang) {
      var output = TextZones.fromBounded(universe, left, right, envLang);
      var zones = output.zones();
      return zones.length === 1 ? filterZone(zones[0], onlyLang) : Option.none();
    };

    var fromRange = function (universe, start, finish, envLang, onlyLang) {
      var isLanguageBoundary = LanguageZones.strictBounds(envLang, onlyLang);

      var toLeft = ClusterSearch.creepLeft(universe, start, isLanguageBoundary);
      var toRight = ClusterSearch.creepRight(universe, finish, isLanguageBoundary);

      var left = toLeft.length > 0 ? toLeft[toLeft.length - 1].item() : start;
      var right = toRight.length > 0 ? toRight[toRight.length - 1].item() : finish;
      return fromBounded(universe, left, right, envLang, onlyLang);
    };

    var fromInline = function (universe, element, envLang, onlyLang) {
      var isLanguageBoundary = LanguageZones.strictBounds(envLang, onlyLang);
      var edges = Clustering.getEdges(universe, element, isLanguageBoundary);
      return edges.isEmpty() ? scour(universe, element, envLang, onlyLang) : fromBounded(universe, edges.left(), edges.right(), envLang, onlyLang);
    };

    var scour = function (universe, element, envLang, onlyLang) {
      var lastOffset = universe.property().isText(element) ? universe.property().getText(element) : universe.property().children(element).length;
      var left = Descent.toLeaf(universe, element, 0);
      var right = Descent.toLeaf(universe, element, lastOffset);
      return fromBounded(universe, left, right, envLang, onlyLang);
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