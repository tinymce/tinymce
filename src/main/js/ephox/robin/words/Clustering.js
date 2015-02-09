define(
  'ephox.robin.words.Clustering',

  [
    'ephox.bud.Unicode',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.words.WordDecision',
    'ephox.robin.words.WordWalking'
  ],

  function (Unicode, Arr, Fun, Extract, Gather, WordDecision, WordWalking) {
    /*
     * Identification of words:
     *
     * For boundaries, stop the gathering process and do not include
     * For empty tags, stop the gathering process and do not include
     * For text nodes:
     *   a) text node has a character break, stop the gathering process and include partial
     *   b) text node has no character breaks, keep gathering and include entire node
     * For others, keep gathering and do not include
     */
    var doWords = function (universe, item, mode, direction) {
      var destination = Gather.walk(universe, item, mode, direction);
      var result = destination.map(function (dest) {
        var decision = WordDecision.decide(universe, dest.item(), direction.slicer);
        var recursive = decision.abort() ? [] : doWords(universe, dest.item(), dest.mode(), direction);
        return decision.items().concat(recursive);
      }).getOr([]);

      return Arr.filter(result, function (res) {
        // Removing the unicode characters that mess up with words. This won't be sufficient, but 
        // we'll have to look at handling this later.
        return res.text().replace(Unicode.zeroWidth(), '') !== '';
      });
    };

    // Represent all the text nodes within item.
    var extract = function (universe, item) {
      if (universe.property().isText(item)) return [ WordDecision.detail(universe, item) ];
      var children = Extract.all(universe, item);
      return Arr.bind(children, function (child) {
        return universe.property().isText(child) ? [ WordDecision.detail(universe, child) ] : [];
      });
    };

    var words = function (universe, item) {
      var toLeft = doWords(universe, item, Gather.sidestep, WordWalking.left);
      var middle = extract(universe, item);
      var toRight = doWords(universe, item, Gather.sidestep, WordWalking.right);
      return {
        all: Fun.constant(Arr.reverse(toLeft).concat(middle).concat(toRight)),
        left: Fun.constant(toLeft),
        middle: Fun.constant(middle),
        right: Fun.constant(toRight)
      };
    };

    return {
      words: words
    };
  }
);