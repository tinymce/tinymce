define(
  'ephox.robin.words.BoundedCluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.Identify',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.Zone',
    'ephox.robin.words.ZoneWalker'
  ],

  function (Arr, Fun, Option, Parent, Identify, LanguageZones, Zone, ZoneWalker) {
    var rangeOn = function (universe, first, last, envLang) {
      if (envLang === undefined) throw new Error('No environment language');
      var ancestor = universe.eq(first, last) ? Option.some(first) : universe.property().parent(first);
      return ancestor.map(function (parent) {
        // Find a sensible way to provide a default.
        var defaultLang = LanguageZones.getDefault(universe, parent).getOr(envLang);
        var groups = ZoneWalker.walk(universe, first, last, defaultLang);

        return Arr.map(groups, function (group) {

          var elements = group.elements();
          var lang = group.lang();

          var line = Arr.map(elements, function (x) {
            return universe.property().isText(x) ? universe.property().getText(x) : '';
          }).join('');

          var words = Identify.words(line);

       
          return Zone({
            lang: lang,
            words: words,
            elements: elements
          });
        });
      });
    };

    var scour = function (universe, start, finish, envLang) {
      var zones = Parent.subset(universe, start, finish).bind(function (children) {
        if (children.length === 0) return Option.none();
        var first = children[0];
        var last = children[children.length - 1];
        return rangeOn(universe, first, last, envLang);
      }).getOr([ ]);

      return {
        zones: Fun.constant(zones)
      };
    };

    return {
      scour: scour
    };
  }
);