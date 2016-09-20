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
    var rangeOn = function (universe, first, last) {
      return universe.property().parent(first).map(function (parent) {
        // Find a sensible way to provide a default.
        var defaultLang = LanguageZones.getDefault(universe, parent).getOr('en');
        var groups = ZoneWalker.walk(universe, first, last, defaultLang);

        return Arr.map(groups, function (group) {

          var elements = group.elements();
          var lang = group.lang();

          var line = Arr.map(elements, function (x) {
            return universe.property().isText(x) ? universe.property().getText(x) : '';
          }).join('');

          var words = Identify.words(line);

       
          // console.log('words', Arr.map(words, function (w) { return w.word(); }));
          return Zone({
            // FIX: later
            lang: lang,
            words: words,
            elements: elements
          });
        });
      });
    };

    var scour = function (universe, start, finish) {
      // // Single text node should use inline.
      // if (universe.eq(start, finish) && universe.property().isText(start)) return inline(universe, start);
      
      var zones = Parent.subset(universe, start, finish).bind(function (children) {
        if (children.length === 0) return Option.none();
        var first = children[0];
        var last = children[children.length - 1];
        return rangeOn(universe, first, last);
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