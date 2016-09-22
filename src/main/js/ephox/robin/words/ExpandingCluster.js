define(
  'ephox.robin.words.ExpandingCluster',

  [
    'ephox.peanut.Fun',
    'ephox.robin.words.Clustering',
    'ephox.robin.words.Zones'
  ],

  function (Fun, Clustering, Zones) {
    /**
     * Searches from the element left and right until it amasses a single zone where
     * the language is all the same, and no word boundaries exist (except for the first node)
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     *  'words' is an array of strings being the words detected from the zone items.
     *  'zone' contains the dom nodes from the clustering data structure detected in an element.
     */
    var scour = function (universe, element, envLang) {
      // An Extract.all flag used for not expanding children.
      var optimise = Fun.constant(false);
      var cluster = Clustering.sameLang(universe, element, optimise);
      return Zones.fromUnits(universe, cluster.all(), cluster.lang().getOr(envLang));
    };

    return {
      scour: scour
    };
  }
);