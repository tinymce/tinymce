define(
  'ephox.robin.words.Prune',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.util.WordUtil'
  ],

  function (Fun, Option, Spot, WordUtil) {
    return function (universe) {
      var inc = function (element, word) {
        return universe.property().isText(element) ? word(universe.property().getText(element)) : Option.none();
      };

      var stop = function (element) {
        return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);
      };

      /**
       * Prune transform for word cluster gathering. Stops on boundaries, empty elements and word edges.
       *
       * Splits the text (but not the node) on word boundaries.
       */
      var prune = function (word, element) {
        var include = inc(element, word);
        return include.fold(function () {
          return stop(element) ? Option.some([]) : Option.none();
        }, function (v) {
          return Option.some([Spot.text(element, v)]);
        });
      };

      return {
        left: Fun.curry(prune, WordUtil.lastWord),
        right: Fun.curry(prune, WordUtil.firstWord),
        stop: stop
      };
    };
  }
);
