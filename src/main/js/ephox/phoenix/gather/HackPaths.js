define(
  'ephox.phoenix.gather.HackPaths',

  [
    'ephox.phoenix.gather.Hacksy'
  ],

  function (Hacksy) {
    var words = function (universe, current, direction) {
      // This will be pseudo code ... but let's see how far I can get.
      var next = Hacksy.go(universe, current.item(), current.mode(), direction);
      return next.map(function (next) {
        // if we are at a boundary tag or an empty tag, break.
        if (universe.property().isBoundary(n.item()) || universe.property().isEmptyTag(n.item())) return [];
        // If there is a space in the word, split
        else if (universe.property().isText(n.item())) {

        } else {
          // keeping going.
          return words(universe, n, direction);
        }
      });
    };

    return {
      words: words
    };
  }
);