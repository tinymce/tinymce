define(
  'ephox.phoenix.search.Matcher',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.group.Group',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.search.Searcher'
  ],

  function (Arr, Group, Pattern, Searcher) {

    var word = function (elements, w) {
      var p = Pattern.word(w);
      return pattern(elements, p);
    };

    var token = function (elements, tok) {
      var p = Pattern.token(tok);
      return pattern(elements, p);
    };

    var pattern = function (elements, p) {
      var sections = Group.group(elements);
      return Arr.bind(sections, function (x) {
        return Searcher.search(x, p);
      });
    };

    return {
      token: token,
      word: word,
      pattern: pattern
    };
  }
);
