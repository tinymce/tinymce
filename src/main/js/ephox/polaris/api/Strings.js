define(
  'ephox.polaris.api.Strings',

  [
    'ephox.polaris.string.Split'
  ],

  function (Split) {
    var splits = function (text, points) {
      return Split.splits(text, points);
    };

    return {
      splits: splits
    };
  }
);
