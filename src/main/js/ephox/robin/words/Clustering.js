define(
  'ephox.robin.words.Clustering',

  [
    'ephox.bud.Unicode',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.WordDecision',
    'ephox.robin.words.WordWalking'
  ],

  function (Unicode, Arr, Fun, Extract, Gather, LanguageZones, WordDecision, WordWalking) {
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
     *   b) if the (destination) language has not changed, keep gathering and do not include
     * These rules are encoded in WordDecision.decide
     * Returns: [WordDecision.make Struct] of all the words recursively from item in direction.
     */
    var doWords = function (universe, item, mode, direction, currLanguage) {
      var destination = Gather.walk(universe, item, mode, direction);
      var result = destination.map(function (dest) {
        var decision = WordDecision.decide(universe, dest.item(), direction.slicer, currLanguage);
        console.log('decision', decision, dest, currLanguage);
        var recursive = decision.abort() ? [] : doWords(universe, dest.item(), dest.mode(), direction, currLanguage);
        return decision.items().concat(recursive);
      }).getOr([]);

      return Arr.filter(result, function (res) {
        // Removing the unicode characters that mess up with words. This won't be sufficient, but 
        // we'll have to look at handling this later.
        return res.text().replace(Unicode.zeroWidth(), '') !== '';
      });
    };

    // Represent all the text nodes within all the sub-tree elements of item.
    // Returns: [WordDecision.make Struct] of all the words at item.
    // TODO: for TBIO-470: For multi-language spell checking: This currently assumes the language of 'item' 
    //       is the language of the entire descendent tree of 'item'. This will be wrong if the sub-tree
    //       has multiple languages annotated. Extract.all needs to return an array of items that retain this language type information.
    var extract = function (universe, item, optimise) {
      if (universe.property().isText(item)) return [ WordDecision.detail(universe, item) ];
      var children = Extract.all(universe, item, optimise);
      return Arr.bind(children, function (child) {
        return universe.property().isText(child) ? [ WordDecision.detail(universe, child) ] : [];
      });
    };

    // Return the words to the left and right of item, and the descendants of item (middle), and the language of item.
    var words = function (universe, item, optimise) {
      var lang = LanguageZones.getDefault(universe, item); // closest language anywhere up the DOM ancestor path
      console.log('lang', lang.getOr('none'));
      var toLeft = doWords(universe, item, Gather.sidestep, WordWalking.left, lang); // lang tag of the current element, if any
      var middle = extract(universe, item, optimise); // TODO: for TBIO-470 multi-language spelling: for now we treat middle/innerText as being single language
      var toRight = doWords(universe, item, Gather.sidestep, WordWalking.right, lang); // lang tag of the current element, if any
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