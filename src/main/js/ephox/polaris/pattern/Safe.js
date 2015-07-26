define(
  'ephox.polaris.pattern.Safe',

  [
    'ephox.polaris.pattern.Unsafe'
  ],

  /** Sanitises all inputs to Unsafe */
  function (Unsafe) {
    /** Escapes regex characters in a string */
    var sanitise = function (input) {
      return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    };

    var word = function (input) {
      var value = sanitise(input);
      return Unsafe.word(value);
    };

    var token = function (input) {
      var value = sanitise(input);
      return Unsafe.token(value);
    };

    return {
      sanitise: sanitise,
      word: word,
      token: token
    };
  }
);
