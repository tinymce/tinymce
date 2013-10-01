define(
  'ephox.robin.words.Selection',

  [
    'ephox.robin.data.WordRange'
  ],

  function (WordRange) {
    var current = function (universe, item, offset) {
      return WordRange(item, offset, item, offset);
    };

    return {
      current: current
    };
  }
);
