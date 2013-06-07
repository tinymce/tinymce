define(
  'ephox.phoenix.search.MatchSplitter',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Splitter',
    'ephox.polaris.api.PositionArray'
  ],

  function (Arr, Fun, Splitter, PositionArray) {
    var identify = function (universe, list, matches) {
      return Arr.map(matches, function (y) {
        var sub = PositionArray.sublist(list, y.start(), y.finish());
        var elements = Arr.map(sub, function (s) {
          return s.element();
        });

        var exact = Arr.map(elements, universe.property().getText).join('');
        return {
          elements: Fun.constant(elements),
          word: y.word,
          exact: Fun.constant(exact)
        };
      });
    };

    var separate = function (universe, list, matches) {
      var allPositions = Arr.bind(matches, function (match) {
        return [ match.start(), match.finish() ];
      });

      var subdivide = function (unit, positions) {
        return Splitter.subdivide(universe, unit.element(), positions);
      };

      var structure = PositionArray.splits(list, allPositions, subdivide);
      return identify(universe, structure, matches);
    };

    return {
      separate: separate
    };

  }
);
