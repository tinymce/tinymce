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
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Gather, Arrays, Parent, Clustering, Identify, LanguageZones, Adt, Struct) {
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

          var adt = Adt.generate([
            // keep going and
            { inline: [ 'item', 'mode', 'lang' ] },
            { text: [ 'item', 'mode' ] },
            // things like <img>, <br>
            { empty: [ 'item', 'mode' ] },
            // things like boundary tags
            { boundary: [ 'item', 'mode', 'lang' ] },
            // hit the starting tag
            { concluded: [ 'item', 'mode' ]}
          ]);
      
      
          var _rules = undefined;

          var again = function (aItem, aMode) {
            // console.log('aItem', aItem.dom());
            return Gather.walk(universe, aItem, aMode, Gather.walkers().right(), _rules).fold(function () {
              // console.log('concluding', aItem.dom());
              return adt.concluded(aItem, aMode);
            }, function (n) {
              // console.log('bItem', n.item().dom());
              // Find if the current item has a lang property on it.
              var currentLang = universe.property().isElement(n.item()) ? Option.from(universe.attrs().get(n.item(), 'lang')) : Option.none();
        
              if (universe.property().isText(n.item())) return adt.text(n.item(), n.mode());
              else if (universe.eq(n.item(), last) && n.mode() !== Gather.advance) return adt.concluded(n.item(), n.mode());
              else if (universe.property().isBoundary(n.item())) return adt.boundary(n.item(), n.mode(), currentLang);

              // Different language

              else if (universe.property().isEmptyTag(n.item())) return adt.empty(n.item(), n.mode());
              
              else return adt.inline(n.item(), n.mode(), currentLang);
            });  
          };

          var stack = LanguageZones(defaultLang);

          var walk = function (item, mode) {
            var outcome = again(item, mode);

            // include
            outcome.fold(function (aItem, aMode, aLang) {
              // inline(aItem, aMode, aLang)
              var opening = aMode === Gather.advance;
              (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
              walk(aItem, aMode);

            }, function (aItem, aMode) {
              // text (aItem, aMode)
              stack.addText(aItem);
              // console.log('**** TEXT **** last', last.dom(), 'aItem', aItem.dom());
              if (! universe.eq(aItem, last)) walk(aItem, aMode);
            
            }, function (aItem, aMode) {
              // empty (aItem, aMode)
              stack.addEmpty(aItem);
              walk(aItem, aMode);
                    
            }, function (aItem, aMode, aLang) {
              // boundary(aItem, aMode, aLang) 
              var opening = aMode === Gather.advance;
              (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
              walk(aItem, aMode, aLang);
            // concluded
            }, function (aItem, aMode) {
              // console.log('concluding on adt ....', aItem.dom());
              // DO NOTHING.
            });
          };

          walk(first, Gather.advance);
          var groups = stack.done();

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
