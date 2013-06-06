define(
  'ephox.phoenix.ghetto.search.GhettoMatchSplitter',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.ghetto.search.GhettoListSplitter',
    'ephox.phoenix.ghetto.search.GhettoSplitter',
    'ephox.phoenix.util.arr.PositionArray'
  ],

  function (Arr, Fun, GhettoListSplitter, GhettoSplitter, PositionArray) {
    var identify = function (universe, list, matches) {
      return Arr.map(matches, function (y) {
        var sub = PositionArray.sub(list, y.start(), y.finish());
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
      var splitter = function (offset, item) {
        return GhettoSplitter.split(universe, offset, item);
      };

      var allPositions = Arr.bind(matches, function (match) {
        return [ match.start(), match.finish() ];
      });

      var structure = GhettoListSplitter.yipes(universe, list, allPositions);
      return identify(universe, structure, matches);
    };

    return {
      separate: separate
    };

  }
);
