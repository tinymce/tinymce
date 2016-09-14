define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.phoenix.api.general.Gather',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Zone',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFilter',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, DomGather, Gather, Arrays, Zone, Clustering, Identify, Compare, Node, PredicateFilter, Text) {
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

      // Will have to group this later.
      var _rules = undefined;
      var nodes = [ ];

      var walk = function (item, mode) {
        return DomGather.walk(item, mode, DomGather.walkers().right(), _rules).map(function (n) {
          if (Compare.eq(n.item(), element)) return [ ];
          var self = Node.isText(n.item()) ? [ n.item() ] : [ ];
          var rest = walk(n.item(), n.mode());
          return self.concat(rest);
        }).getOr([ ]);
      };

      var allnodes = walk(element, Gather.advance);
      console.log('allnodes', Arr.map(allnodes, Text.get));

      var nodes = PredicateFilter.descendants(element, Node.isText);
      var text = Arr.map(nodes, Text.get).join('');

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
