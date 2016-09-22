define(
  'ephox.robin.words.ClusterSearch',

  [
    'ephox.bud.Unicode',
    'ephox.compass.Arr',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.words.WordDecision',
    'ephox.robin.words.WordWalking'
  ],

  function (Unicode, Arr, Gather, WordDecision, WordWalking) {
    /*
     * Identification of words:
     *
     * For boundaries, stop the gathering process and do not include
     * For empty tags, stop the gathering process and do not include
     * For items satisfying the custom boundary, stop the gathering process and do not include. This is
     * often a language boundary function.
     * For text nodes:
     *   a) text node has a character break, stop the gathering process and include partial
     *   b) text node has no character breaks, keep gathering and include entire node
     *
     * These rules are encoded in WordDecision.decide
     * Returns: [WordDecision.make Struct] of all the words recursively from item in direction.
     */
    var doWords = function (universe, item, mode, direction, isCustomBoundary) {
      var destination = Gather.walk(universe, item, mode, direction);
      var result = destination.map(function (dest) {
        var decision = WordDecision.decide(universe, dest.item(), direction.slicer, isCustomBoundary);
        var recursive = decision.abort() ? [] : doWords(universe, dest.item(), dest.mode(), direction, isCustomBoundary);
        return decision.items().concat(recursive);
      }).getOr([]);

      return Arr.filter(result, function (res) {
        // Removing the unicode characters that mess up with words. This won't be sufficient, but 
        // we'll have to look at handling this later.
        return res.text().replace(Unicode.zeroWidth(), '') !== '';
      });
    };

    var creepLeft = function (universe, item, isCustomBoundary) {
      return doWords(universe, item, Gather.sidestep, WordWalking.left, isCustomBoundary);
    };

    var creepRight = function (universe, item, isCustomBoundary) {
      return doWords(universe, item, Gather.sidestep, WordWalking.right, isCustomBoundary);
    };

    var isEmpty = function (universe, item) {      
      // This is PredicateFilter.descendants
      return universe.down().predicate(item, universe.property().isText).length > 0;
    };

    var flatten = function (universe, item) {
      return universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : Arr.map(
        universe.down().predicate(item, universe.property().isText),
        function (e) { return WordDecision.detail(universe, e); }
      );
    };

    return {
      creepLeft: creepLeft,
      creepRight: creepRight,
      flatten: flatten,
      isEmpty: isEmpty
    };
  }
);