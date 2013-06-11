define(
  'ephox.robin.util.WordUtil',

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

    var lastWord = function (text) {
      var indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero));
      var last = Option.from(indices[indices.length - 1]);
      return last.map(function (v) {
        return text.substring(v.start());
      });
    };

    var firstWord = function (text) {
      // ASSUMPTION: search is sufficient because we only need to find the first one.
      var index = text.search(wordstart);
      return index > -1 ? Option.some(text.substring(0, index + 1)) : Option.none();
    };

    return {
      firstWord: firstWord,
      lastWord: lastWord
    };

  }
);
