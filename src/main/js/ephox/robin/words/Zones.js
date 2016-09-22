define(
  'ephox.robin.words.Zones',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.polaris.api.Arrays',
    'ephox.robin.words.Identify',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.Zone'
  ],

  function (Arr, Fun, Arrays, Identify, LanguageZones, Zone) {
    var findWords = function (universe, units) {
      var groups = Arrays.splitby(units, function (c) {
        // I really don't think this can happen ... given that the cluster is specifically excluding these.
        var elem = c.item();
        return universe.property().isBoundary(elem) || universe.property().isEmptyTag(elem);
      });

      return Arr.bind(groups, function (x) {
        var text = Arr.map(x, function (y) {
          return y.text();
        }).join('');
        return Identify.words(text);
      });
    };

    var fromElement = function (universe, element, envLang) {
      var text = universe.property().getText(element);
      var words = Identify.words(text);
      var lang = LanguageZones.getDefault(universe, element).getOr(envLang);

      var zones = [
        Zone({
          lang: lang,
          words: words,
          elements: [ text ]
        })
      ];

      return {
        zones: Fun.constant(zones)
      };
    };

    var fromUnits = function (universe, units, lang) {
      var items = Arr.map(units, function (c) { return c.item(); });      
      var words = findWords(universe, units);

      var zones = [
        Zone({
          lang: lang,
          words: words,
          elements: items
        })
      ];

      return {
        zones: Fun.constant(zones)
      };
    };

    return {
      fromElement: fromElement,
      fromUnits: fromUnits
    };
  }
);