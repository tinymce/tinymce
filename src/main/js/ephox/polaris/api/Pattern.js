define(
  'ephox.polaris.api.Pattern',

  [
    'ephox.polaris.pattern.Chars',
    'ephox.polaris.pattern.Custom',
    'ephox.polaris.pattern.Safe',
    'ephox.polaris.pattern.Unsafe'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Chars, Custom, Safe, Unsafe) {
    var safeword = function (input, flags) {
      return Safe.word(input, flags);
    };

    var safetoken = function (input, flags) {
      return Safe.token(input, flags);
    };

    var custom = function (input, prefix, suffix, flags) {
      return Custom(input, prefix, suffix, flags);
    };

    var unsafeword = function (input, flags) {
      return Unsafe.word(input, flags);
    };

    var unsafetoken = function (input, flags) {
      return Unsafe.token(input, flags);
    };

    var sanitise = function (input) {
      return Safe.sanitise(input);
    };

    var chars = function () {
      return Chars.chars();
    };

    var wordbreak = function () {
      return Chars.wordbreak();
    };

    var wordchar = function () {
      return Chars.wordchar();
    };

    return {
      safeword: safeword,
      safetoken: safetoken,
      custom: custom,
      unsafeword: unsafeword,
      unsafetoken: unsafetoken,
      sanitise: sanitise,
      chars: chars,
      wordbreak: wordbreak,
      wordchar: wordchar
    };
  }
);
