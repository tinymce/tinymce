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
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Gather, Arrays, Zone, ArrayGroup, Clustering, Identify, Adt, Struct) {
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
      var languageStack = universe.up().closest(element, '[lang]', Fun.constant(false)).bind(function (el) {
        return Option.from(universe.attrs().get(el, 'lang')).map(function (lang) {
          return [ { item: el, lang: lang } ];
        });
      }).getOr([ ]);

      console.log('languageStack', languageStack);

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

      var topStack = function () {
        return languageStack.length > 0 ? Option.some(languageStack[languageStack.length - 1]) : Option.none();
      };

      var isOnTop = function (item) {
        return topStack().exists(function (data) {
          return universe.eq(item, data.item);
        });
      };

      var popStack = function () {
        languageStack = languageStack.slice(0, languageStack.length - 1);
      };

      var adt = Adt.generate([
        // keep going and
        { include: [ 'item', 'direction' ] },
        // things like <img>, <br>
        { gap: [ 'item', 'direction' ] },
        // things like boundary tags
        { boundary: [ 'item', 'direction' ] },

        // things like language sections
        { section: [ 'item', 'direction', 'lang' ] },

        // hit the starting tag
        { concluded: [ 'item', 'direction' ]}
      ]);
  
      // Will have to group this later.
      var _rules = undefined;
      var nodes = [ ];

      var again = function (aItem, aMode) {
        
        return Gather.walk(universe, aItem, aMode, Gather.walkers().right(), _rules).fold(function () {
          return adt.concluded(aItem, aMode, Option.none());
        }, function (n) {
          var currentLang = universe.property().isElement(n.item()) ? Option.from(universe.attrs().get(n.item(), 'lang')) : Option.none();
          // HACKY HACKY HACKY
          var diffLang = false;
          // Check the stack
          if (isOnTop(n.item())) {
            popStack();
            diffLang = true;
          }
          else {
            currentLang.each(function (cl) {
              topStack().each(function (top) {
                if (cl !== top.lang) {
                  languageStack.push({ item: n.item(), lang: cl });              
                  diffLang = true;
                }
              });              
            });
          }

          
          // console.log('on item', n.item().id + ' ', n.item().text || n.item().name + ' ', n.item().attrs, ', lang: ', 
          //   Arr.map(languageStack.slice(0), function (s) { return s.lang; }),
          //   'diffLang', diffLang,
          //   'currentLang', currentLang.getOr('none')
          // );
          if (universe.eq(n.item(), element)) return adt.concluded(n.item(), n.mode());
          else if (universe.property().isBoundary(n.item())) return adt.boundary(n.item(), n.mode());

          // Different language

          else if (universe.property().isEmptyTag(n.item())) return adt.gap(n.item(), n.mode());
          else return diffLang ? adt.section(n.item(), n.mode(), currentLang) : adt.include(n.item(), n.mode());
        });  
      };

        
      // }

      var grouping = ArrayGroup();

      var walk = function (item, mode, lastLang) {
        var outcome = again(item, mode);

        // include
        outcome.fold(function (aItem, aMode) {
          if (universe.property().isText(aItem)) grouping.add(aItem);
          walk(aItem, aMode, lastLang);

        // separator  
        }, function (aItem, aMode) {
          grouping.end();
          // grouping.separator(aItem);
          walk(aItem, aMode, Option.none());
        // boundary
        }, function (aItem, aMode) {
          grouping.end();
          walk(aItem, aMode, Option.none());
        
        // section
        }, function (aItem, aMode, aLang) {
          var starting = aMode === Gather.advance;
        
          if (starting) {
            if (Option.equals(lastLang, aLang)) grouping.reopen();
            else grouping.end();
          } else {
            grouping.end();
          }
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


      walk(element, Gather.advance, Option.none());
      var groups = grouping.done();

      var words = Arr.bind(groups, function (g) {
        var line = Arr.map(g, function (gi) {
          if (! universe.property().isText(gi)) {
            debugger;
          }
          return universe.property().getText(gi);
        }).join('');
        return Identify.words(line);
      });

      return {
        // zone: function () {
        //   return {
        //     elements: Fun.constant([ element ])
        //   };
        // },
        // groups: Fun.constant(words),
        // lang: Option.none
        zones: Fun.constant([ ])
      };
    };

    var zone = Struct.immutableBag([ 'lang', 'words', 'elements' ], [ ]);

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
      var words = findWords(universe, cluster);

      var zones = [
        zone({
          lang: rawCluster.lang(),
          words: words,
          elements: items
        })
      ];

      var recalculate = function () {
        return generate(universe, element, optimise);
      };
     
      return {
        zones: Fun.constant(zones),
        recalculate: recalculate
      };
    };

    var empty = function () {
      return {
        zones: Fun.constant([ ])
      };
    };

    return {
      generate: generate,
      block: block,
      empty: empty
    };
  }
);
