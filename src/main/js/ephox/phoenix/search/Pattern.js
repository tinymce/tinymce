define(
  'ephox.phoenix.search.Pattern',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Chars'
  ],

  function (Fun, Chars) {
    
    var custom = function (regex, length, preOffset, postOffset) {
      var term = function () {
        return new RegExp(regex, 'g');
      };

      return {
        term: term,
        length: Fun.constant(length),
        preOffset: preOffset,
        postOffset: postOffset
      };
    };
    
    var token = function (x) {
      // FIX: This will need to be sanitised.
      return custom(x, x.length, Fun.constant(0), Fun.constant(0));
    };

    var word = function (w) {
      // FIX: This will need to be sanitised. It is also heavily based on English.
      var regex = '((?:^\'?)|(?:' + Chars.wordbreak() + '+\'?))' + w + '((?:\'?$)|(?:\'?' + Chars.wordbreak() + '+))';

      var prefix = function (match) {
        return match.length > 1 ? match[1].length : 0;
      };

      var suffix = function (match) {
        return match.length > 2 ? match[2].length : 0;
      };

      return custom(regex, w.length, prefix, suffix);
    };

    return {
      token: token,
      word: word,
      custom: custom
    };
  }
);
