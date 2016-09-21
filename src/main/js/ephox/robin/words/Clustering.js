define(
  'ephox.robin.words.Clustering',

  [
    'ephox.bud.Unicode',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.WordDecision',
    'ephox.robin.words.WordWalking'
  ],

  function (Unicode, Arr, Fun, Gather, LanguageZones, WordDecision, WordWalking) {
    /*
     * Identification of words:
     *
     * For boundaries, stop the gathering process and do not include
     * For empty tags, stop the gathering process and do not include
     * For text nodes:
     *   a) text node has a character break, stop the gathering process and include partial
     *   b) text node has no character breaks, keep gathering and include entire node
     * For other elements, calculate the language of the closest ancestor:
     *   a) if the (destination) language has changed, stop the gathering process and do not include
     *   b) if the (destination) language has not changed, keep gathering and include
     * These rules are encoded in WordDecision.decide
     * Returns: [WordDecision.make Struct] of all the words recursively from item in direction.
     */
    var doWords = function (universe, item, mode, direction, currLanguage) {
      var destination = Gather.walk(universe, item, mode, direction);
      var result = destination.map(function (dest) {
        var decision = WordDecision.decide(universe, dest.item(), direction.slicer, currLanguage);
        var recursive = decision.abort() ? [] : doWords(universe, dest.item(), dest.mode(), direction, currLanguage);
        return decision.items().concat(recursive);
      }).getOr([]);

      return Arr.filter(result, function (res) {
        // Removing the unicode characters that mess up with words. This won't be sufficient, but 
        // we'll have to look at handling this later.
        return res.text().replace(Unicode.zeroWidth(), '') !== '';
      });
    };

    // Return the words to the left and right of item, and as well as the any text nodes inside the item itself, and the language of item.
    var words = function (universe, item, _optimise) {
      // TODO: Remote optimise parameter.
      var lang = LanguageZones.getDefault(universe, item); // closest language anywhere up the DOM ancestor path including self
      var toLeft = doWords(universe, item, Gather.sidestep, WordWalking.left, lang);

      var middle = universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : Arr.map(
        universe.down().predicate(item, universe.property().isText),
        function (e) { return WordDecision.detail(universe, e); }
      );
      var toRight = doWords(universe, item, Gather.sidestep, WordWalking.right, lang);
      return {
        all: Fun.constant(Arr.reverse(toLeft).concat(middle).concat(toRight)),
        left: Fun.constant(toLeft),
        middle: Fun.constant(middle),
        right: Fun.constant(toRight),
        lang: Fun.constant(lang)
      };
    };

    return {
      words: words
    };
  }
);