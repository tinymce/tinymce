define(
  'ephox.phoenix.search.MatchSplitter',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Splitter',
    'ephox.polaris.api.PositionArray'
  ],

  function (Arr, Fun, Splitter, PositionArray) {
    /**
     * Split each text node in the list using the match endpoints.
     *
     * Each match is then mapped to the word it matched and the elements that make up the word.
     */
    var separate = function (universe, list, matches) {
      var allPositions = Arr.bind(matches, function (match) {
        return [ match.start(), match.finish() ];
      });

      var subdivide = function (unit, positions) {
        return Splitter.subdivide(universe, unit.element(), positions);
      };

      var structure = PositionArray.splits(list, allPositions, subdivide);

      var collate = function (match) {
        var sub = PositionArray.sublist(structure, match.start(), match.finish());

        var elements = Arr.map(sub, function (unit) { return unit.element(); });

        var exact = Arr.map(elements, universe.property().getText).join('');
        return {
          elements: Fun.constant(elements),
          word: match.word,
          exact: Fun.constant(exact)
        };
      };

      return Arr.map(matches, collate);
    };

    return {
      separate: separate
    };

  }
);
