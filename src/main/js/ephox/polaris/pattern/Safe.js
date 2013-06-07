define(
  'ephox.polaris.pattern.Safe',

  [
    'ephox.polaris.pattern.Unsafe'
  ],

  function (Unsafe) {
    var sanitise = function (input) {
      return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
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
