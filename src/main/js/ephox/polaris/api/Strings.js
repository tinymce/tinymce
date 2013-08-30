define(
  'ephox.polaris.api.Strings',

  [
    'ephox.polaris.string.Split'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Split) {
    var splits = function (text, points) {
      return Split.splits(text, points);
    };

    return {
      splits: splits
    };
  }
);
