define(
  'ephox.polaris.search.Safe',

  [
    'ephox.polaris.search.Pattern'
  ],

  function (Pattern) {
    var sanitise = function (x) {
      return x.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    };

    var word = function (input) {
      var value = sanitise(input);
      return Pattern.word(value);
    };

    var token = function (input) {
      var value = sanitise(input);
      return Pattern.token(value);
    };

    return {
      word: word,
      token: token,
      sanitise: sanitise
    };
  }
);
