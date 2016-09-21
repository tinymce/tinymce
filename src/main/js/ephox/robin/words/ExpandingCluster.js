define(
  'ephox.robin.words.ExpandingCluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.polaris.api.Arrays',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Identify',
    'ephox.robin.words.Zone'
  ],

  function (Arr, Fun, Arrays, Clustering, Identify, Zone) {
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

    /**
     * Searches from the element left and right until it amasses a single zone where
     * the language is all the same, and no word boundaries exist (except for the first node)
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     *  'words' is an array of strings being the words detected from the zone items.
     *  'zone' contains the dom nodes from the clustering data structure detected in an element.
     */
    var scour = function (universe, element) {
      // An Extract.all flag used for not expanding children.
      var optimise = Fun.constant(false);
      var rawCluster = Clustering.words(universe, element, optimise);
      var cluster = rawCluster.all();
      var items = Arr.map(cluster, function (c) { return c.item(); });      
      var words = findWords(universe, cluster);

      var zones = [
        Zone({
          lang: rawCluster.lang().getOr('en'),
          words: words,
          elements: items
        })
      ];

      return {
        zones: Fun.constant(zones)
      };
    };

    return {
      scour: scour
    };
  }
);