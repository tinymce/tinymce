define(
  'ephox.polaris.pattern.Safe',

  [
    'ephox.classify.Type',
    'ephox.polaris.pattern.Unsafe'
  ],

  /** Sanitises all inputs to Unsafe */
  function (Type, Unsafe) {
    /** Escapes regex characters in a string */
    var sanitise = function (input) {
      if(!Type.isString(input)) {
        debugger;
      }
      return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    };

    var word = function (input, flags) {
      var value = sanitise(input);
      return Unsafe.word(value, flags);
    };

    var token = function (input, flags) {
      var value = sanitise(input);
      return Unsafe.token(value, flags);
    };

    return {
      sanitise: sanitise,
      word: word,
      token: token
    };
  }
);
