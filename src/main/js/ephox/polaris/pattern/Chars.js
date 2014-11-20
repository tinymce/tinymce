define(
  'ephox.polaris.pattern.Chars',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var chars = '\\w\'\\-\\u00C0-\\u00FF\\uFEFF';
    var wordbreak = '[^' + chars + ']';
    var wordchar = '[' + chars + ']';

    return {
      chars: Fun.constant(chars),
      wordbreak: Fun.constant(wordbreak),
      wordchar: Fun.constant(wordchar)
    };
  }
);
