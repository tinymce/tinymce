define(
  'ephox.phoenix.gather.RobinWord',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.Search',
    'global!RegExp'
  ],

  function (Fun, Option, Pattern, Search, RegExp) {

    var wordstart = new RegExp(Pattern.wordbreak() + '+', 'g');

    var zero = Fun.constant(0);

    /*
     * Returns the index position of a break when going left (i.e. last word break)
     */
    var leftBreak = function (text) {
      var indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero));
      return Option.from(indices[indices.length - 1]).map(function (match) {
        return match.start();
      });
    };

    /*
     * Returns the index position of a break when going right (i.e. first word break)
     */
    var rightBreak = function (text) {
      // ASSUMPTION: search is sufficient because we only need to find the first one.
      var index = text.search(wordstart);
      return index > -1 ? Option.some(index) : Option.none();
    };

    return {
      leftBreak: leftBreak,
      rightBreak: rightBreak
    };

  }
);
