define(
  'ephox.robin.api.general.Words',

  [
    'ephox.robin.util.WordUtil',
    'ephox.robin.words.Identify'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (WordUtil, Identify) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var isWord = function (_universe, text) {
      return !WordUtil.hasBreak(text);
    };

    return {
      identify: identify,
      isWord: isWord
    };
  }
);
