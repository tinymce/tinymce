define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.ZoneWalker',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Gather, Arrays, Parent, Clustering, Identify, LanguageZones, ZoneWalker, Adt, Struct) {
    /**
     * Finds words in groups of text (each HTML text node can have multiple words).
     */
    var findWords = function (universe, cluster) {
      var groups = Arrays.splitby(cluster, function (c) {
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

    var block = function (universe, element) {
      return range(universe, element, element);
    };

    var range = function (universe, start, finish) {
      // Single text node should use inline.
      if (universe.eq(start, finish) && universe.property().isText(start)) return inline(universe, start);
      // console.log('*** range ***', start.dom(), ' -> ', finish.dom());

      var zones = Parent.subset(universe, start, finish).bind(function (children) {
        var first = children[0];
        // Ensure this exists.
        var last = children[children.length - 1];
        // console.log('first', first.dom(), 'last', last.dom());
        return universe.property().parent(first).map(function (parent) {
          // console.log('parent', parent.dom(), 'first' ,first.dom(), 'last', last.dom());
          // debugger;
          var defaultLang =  universe.up().closest(start, '[lang]', Fun.constant(false)).bind(function (el) {
            return Option.from(universe.attrs().get(el, 'lang'));
          // Default language properly.
          }).getOr('en');


          // FIX: Use first and last here!
          var groups = ZoneWalker.walk(universe, first, last, defaultLang);

          return Arr.map(groups, function (group) {

            var elements = group.elements();
            var lang = group.lang();

            var line = Arr.map(elements, function (x) {
              return universe.property().isText(x) ? universe.property().getText(x) : '';
            }).join('');

            var words = Identify.words(line);

         
            // console.log('words', Arr.map(words, function (w) { return w.word(); }));
            return zone({
              // FIX: later
              lang: lang,
              words: words,
              elements: elements
            });
          });
        });
      }).getOr([ ]);

      return {
        zones: Fun.constant(zones)
      };
    };

    var zone = Struct.immutableBag([ 'lang', 'words', 'elements' ], [ ]);

    /**
     * Searches from the element left and right until it amasses a single zone where
     * the language is all the same, and no word boundaries exist (except for the first node)
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     *  'words' is an array of strings being the words detected from the zone items.
     *  'zone' contains the dom nodes from the clustering data structure detected in an element.
     */
     var inline = function (universe, element) {
      // An Extract.all flag used for not expanding children.
      var optimise = Fun.constant(false);
      var rawCluster = Clustering.words(universe, element, optimise);
      var cluster = rawCluster.all();
      var items = Arr.map(cluster, function (c) { return c.item(); });      
      var words = findWords(universe, cluster);

      var zones = [
        zone({
          lang: rawCluster.lang().getOr('en'),
          words: words,
          elements: items
        })
      ];

      //  var raw = function (universe, zones) {
      //   return Arr.map(zones, function (zone) {
      //     return {
      //       lang: zone.lang(),
      //       elements: Arr.map(zone.elements(), universe.property().getText),
      //       words: Arr.map(zone.words(), function (w) { return w.word(); })
      //     };
      //   });
      // };

      // console.log('raws', JSON.stringify(raw(universe, zones), null, 2));

      return {
        zones: Fun.constant(zones)
      };
    };

    var empty = function () {
      return {
        zones: Fun.constant([ ])
      };
    };

    return {
      inline: inline,
      block: block,
      range: range,
      empty: empty
    };
  }
);
