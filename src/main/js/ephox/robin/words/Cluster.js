define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Zone',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify',
    'ephox.scullion.ADT'
  ],

  function (Arr, Fun, Option, Gather, Arrays, Zone, Clustering, Identify, Adt) {
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
        { include: [ 'item', 'direction' ] },
        // things like <img>, <br>
        { gap: [ 'item', 'direction' ] },
        // things like different language sections
        { section: [ 'item', 'direction' ] },
        // hit the starting tag
        { concluded: [ 'item', 'direction' ]}
      ]);
      /*
      var splitbyAdv = function (xs, pred) {
      var r = [];
      var part = [];
      Arr.each(xs, function (x) {
        var choice = pred(x);
        Splitting.cata(choice, function () {
          // Include in the current sublist.
          part.push(x);
        }, function () {
          // Stop the current sublist, create a new sublist containing just x, and then start the next sublist.
          if (part.length > 0) r.push(part);
          r.push([ x ]);
          part = [];
        }, function () {
          // Stop the current sublist, and start the next sublist.
          if (part.length > 0) r.push(part);
          part = [];
        });
      });

      if (part.length > 0) r.push(part);
      return r;
    };
    */

      // Will have to group this later.
      var _rules = undefined;
      var nodes = [ ];

      // var walkHack = function (item, mode) {
      //   var r = [ ];
      //   var part = [ ];

      //   var again = function (aItem, aMode) {
      //     return Gather.walk(universe, item, mode, Gather.walkers().right(), _rules).map(function (n) {
      //       // n.item() is the next element
      //       // n.mode() is the direction to go
      //       // finished.
      //       if (universe.eq(aItem, element)) return adt.concluded(aItem, aMode);
      //       else if (universe.property().isBoundaryTag(aItem)) return adt.section(aItem, aMode);
      //       else if (universe.property().isEmptyTag(elem)) return adt.gap(aItem, aMode);
      //       else {
      //         var rest = again(n.item(), n.mode());

      //     });  
      //   };

        
      // }

      var walk = function (item, mode) {
        return Gather.walk(universe, item, mode, Gather.walkers().right(), _rules).map(function (n) {
          console.log('n', n.item());
          if (universe.eq(n.item(), element)) return [ ];
          var self = universe.property().isText(n.item()) ? [ n.item() ] : [ ];
          var rest = walk(n.item(), n.mode());
          return self.concat(rest);
        }).getOr([ ]);
      };

      var allnodes = walk(element, Gather.advance);
      var text = Arr.map(allnodes, universe.property().getText).join(' ');
      console.log('text', text, 'item', element);

      var words = Identify.words(text);

      return {
        zone: function () {
          return {
            elements: Fun.constant(nodes)
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
