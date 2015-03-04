define(
  'ephox.polaris.api.Strings',

  [
    'ephox.polaris.string.Sanitise',
    'ephox.polaris.string.Split'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Sanitise, Split) {
    var splits = function (text, points) {
      return Split.splits(text, points);
    };

    var cssSanitise = function (str) {
      return Sanitise.css(str);
    };

    return {
      cssSanitise: cssSanitise,
      splits: splits
    };
  }
);
