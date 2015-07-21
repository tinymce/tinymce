define(
  'ephox.polaris.pattern.Unsafe',

  [
    'ephox.peanut.Fun',
    'ephox.polaris.pattern.Chars',
    'ephox.polaris.pattern.Custom'
  ],

  function (Fun, Chars, Custom) {

    /**
     * Tokens have no prefix or suffix
     */
    var token = function (input, flags) {
      return Custom(input, Fun.constant(0), Fun.constant(0), flags);
    };

    /**
     * Words have complex rules as to what a "word break" actually is.
     *
     * These are consumed by the regex and then excluded by prefix/suffix lengths.
     */
    var word = function (input, flags) {
      var regex = '((?:^\'?)|(?:' + Chars.wordbreak() + '+\'?))' + input + '((?:\'?$)|(?:\'?' + Chars.wordbreak() + '+))';

      // ASSUMPTION: There are no groups in their input
      var prefix = function (match) {
        return match.length > 1 ? match[1].length : 0;
      };

      var suffix = function (match) {
        return match.length > 2 ? match[2].length : 0;
      };

      return Custom(regex, prefix, suffix, flags);
    };

    return {
      token: token,
      word: word
    };
  }
);
