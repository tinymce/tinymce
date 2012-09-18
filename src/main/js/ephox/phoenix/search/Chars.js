define(
  'ephox.phoenix.search.Chars',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {

    var chars = '\\w\'\\-';
    var wordbreak = '[^' + chars + ']';
    var wordchar = '[' + chars + ']';

    return {
      chars: Fun.constant(chars),
      wordbreak: Fun.constant(wordbreak),
      wordchar: Fun.constant(wordchar)
    };
  }
);
