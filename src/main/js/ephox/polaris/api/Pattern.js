define(
  'ephox.polaris.api.Pattern',

  [
    'ephox.polaris.pattern.Custom',
    'ephox.polaris.pattern.Safe',
    'ephox.polaris.pattern.Unsafe'
  ],

  function (Custom, Safe, Unsafe) {
    var safeword = function (input) {
      return Safe.word(input);
    };

    var safetoken = function (input) {
      return Safe.token(input);
    };

    var custom = function (input, prefix, suffix) {
      return Custom(input, prefix, suffix);
    };

    var unsafeword = function (input) {
      return Unsafe.word(input);
    };

    var unsafetoken = function (input) {
      return Unsafe.token(input);
    };

    var sanitise = function (input) {
      return Safe.sanitise(input);
    };

    return {
      safeword: safeword,
      safetoken: safetoken,
      custom: custom,
      unsafeword: unsafeword,
      unsafetoken: unsafetoken,
      sanitise: sanitise
    };
  }
);
