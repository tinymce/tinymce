define(
  'ephox.polaris.pattern.Chars',

  [
    'ephox.bud.Unicode',
    'ephox.peanut.Fun'
  ],

  function (Unicode, Fun) {
    // \w is a word character
    // \' is an apostrophe
    // '-' is a hyphen
    // \u00C0 - \u00FF are various language characters
    // \u2018 and \u2019 are the smart quote characters
    var chars = '\\w' + '\'' + '\\-' + '\\u00C0-\\u00FF' + Unicode.zeroWidth() + '\\u2018\\u2019';
    var wordbreak = '[^' + chars + ']';
    var wordchar = '[' + chars + ']';

    return {
      chars: Fun.constant(chars),
      wordbreak: Fun.constant(wordbreak),
      wordchar: Fun.constant(wordchar)
    };
  }
);
