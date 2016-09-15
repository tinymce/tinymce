define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Zone',
    'ephox.robin.util.ArrayGroup',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify',
    'ephox.scullion.ADT'
  ],

  function (Arr, Fun, Option, Gather, Arrays, Zone, ArrayGroup, Clustering, Identify, Adt) {
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

      var language = function (item) {
        return universe.up().closest(item, '[lang]', Fun.constant(false)).bind(function (el) {
          return Option.from(universe.attrs().get(el, 'lang'));
        });
      };

      var lang = language(element);
      console.log('lang', lang);

      // kind of need an ADT
      // if you hit a tag inside the tag that should break up a word (e.g. image, diff language)
      // then return adt.section(item, mode, xs). The walking process will then start a new array from there with a 
      // language attached.
      // if you hit the starting tag again, then return adt.complete(item, xs)
      // otherwise, return adt.gathering(item, mode, xs)

      /*
        var all = [ ];
        var current = [ ];

        adt.match({
          section: function (item, mode, xs) {
            // we have just
          },
          complete: function (item, xs) {

          },
          gathering: function (item, mode, xs) {
            
          }
        })



      */

      var adt = Adt.generate([
        // keep going and
        { include: [ 'item', 'direction', 'lang' ] },
        // things like <img>, <br>
        { gap: [ 'item', 'direction', 'lang' ] },
        // things like different language sections
        { section: [ 'item', 'direction', 'lang' ] },
        // hit the starting tag
        { concluded: [ 'item', 'direction', 'lang' ]}
      ]);
  
      // Will have to group this later.
      var _rules = undefined;
      var nodes = [ ];

      
      var again = function (aItem, aMode, aLang) {
        return Gather.walk(universe, aItem, aMode, Gather.walkers().right(), _rules).fold(function () {
          return adt.concluded(aItem, aMode, Option.none());
        }, function (n) {
          var currentLang = Option.from(universe.attrs().get(n.item(), 'lang'));
          var isDiffLang = function () {
            return currentLang.exists(function (l) {
              // We have a current language, so we need to create a new section if this language
              // does not match the previous language. The previous language will be the language
              // that has carried through from the previous item
              return !aLang.forall(function (a) {
                console.log('comparing', a, 'with', l);
                return a === l;
              });
            });

          };

          console.log('different lang', isDiffLang());
          // n.item() is the next element
          // n.mode() is the direction to go
          // finished.
          if (universe.eq(n.item(), element)) return adt.concluded(n.item(), n.mode(), aLang);
          else if (universe.property().isBoundary(n.item())) return adt.section(n.item(), n.mode(), aLang);

          // Different language

          else if (universe.property().isEmptyTag(n.item())) return adt.gap(n.item(), n.mode(), aLang);
          else return isDiffLang() ? adt.section(n.item(), n.mode(), currentLang) : adt.include(n.item(), n.mode(), aLang);
        });  
      };

        
      // }

      var grouping = ArrayGroup();

      var walk = function (item, mode, wLang) {
        var outcome = again(item, mode, wLang);

        // include
        outcome.fold(function (aItem, aMode, aLang) {
          grouping.add(aItem);
          walk(aItem, aMode, aLang);

        // separator  
        }, function (aItem, aMode, aLang) {
          grouping.end();
          // grouping.separator(aItem);
          walk(aItem, aMode, aLang);
        // section
        }, function (aItem, aMode, aLang) {
          console.log('ending section', aItem);
          grouping.end(aItem);
          walk(aItem, aMode, aLang);
        // concluded
        }, function (aItem, aMode, aLang) {
          // do nothing.
        });

        // hacky
        // console.log('grouping', grouping.done());
        // return Gather.walk(universe, item, mode, Gather.walkers().right(), _rules).map(function (n) {
        //   console.log('n', n.item());
        //   if (universe.eq(n.item(), element)) return [ ];
        //   var self = universe.property().isText(n.item()) ? [ n.item() ] : [ ];
        //   var rest = walk(n.item(), n.mode());
        //   return self.concat(rest);
        // }).getOr([ ]);
      };


      walk(element, Gather.advance, lang);
      var groups = grouping.done();

      var words = Arr.bind(groups, function (g) {
        var line = Arr.map(g, universe.property().getText).join('');
        return Identify.words(line);
      });

      return {
        zone: function () {
          return {
            elements: Fun.constant([ element ])
          };
        },
        words: Fun.constant(words),
        lang: Option.none
      };
    };

    /**
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     *  'words' is an array of strings being the words detected from the zone items.
     *  'zone' contains the dom nodes from the clustering data structure detected in an element.
     */
    var generate = function (universe, element, optimise) {
      var rawCluster = Clustering.words(universe, element, optimise);
      var cluster = rawCluster.all();
      var items = Arr.map(cluster, function (c) { return c.item(); });      
      var zone = Zone.constant(items);
      var words = findWords(universe, cluster);
      return {
        zone: Fun.constant(zone),
        words: Fun.constant(words),
        lang: rawCluster.lang
      };
    };

    var empty = function () {
      return {
        zone: Zone.empty,
        words: Fun.constant([]),
        lang: Option.none
      };
    };

    return {
      generate: generate,
      block: block,
      empty: empty
    };
  }
);
