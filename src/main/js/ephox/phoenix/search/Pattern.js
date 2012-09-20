define(
  'ephox.phoenix.search.Pattern',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Chars'
  ],

  function (Fun, Chars) {
    
    var custom = function (regex, preOffset, postOffset) {
      var term = function () {
        return new RegExp(regex, 'gi');
      };

      return {
        term: term,
        preOffset: preOffset,
        postOffset: postOffset
      };
    };
    
    var token = function (x) {
      // FIX: This will need to be sanitised.
      return custom(x, Fun.constant(0), Fun.constant(0));
    };

    var word = function (w) {
      // FIX: This will need to be sanitised.
      var regex = '(^|' + Chars.wordbreak() + '+)' + w + '($|' + Chars.wordbreak() + '+)';

      var prefix = function (match) {
        return match.length > 1 ? match[1].length : 0;
      };

      var suffix = function (match) {
        return match.length > 2 ? match[2].length : 0;
      };

      return custom(regex, prefix, suffix);
    };

    return {
      token: token,
      word: word,
      custom: custom
    };
  }
);
