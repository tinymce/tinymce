define(
  'ephox.phoenix.ghetto.search.GhettoMatchSplitter',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.ghetto.search.GhettoSplitter',
    'ephox.phoenix.util.arr.PositionArray'
  ],

  function (Arr, Fun, GhettoSplitter, PositionArray) {
    var separate = function (universe, list, matches) {
      var splitter = function (offset, item) {
        return GhettoSplitter.split(universe, offset, item);
      };

      var structure = list;
      return Arr.map(matches, function (y) {
        structure = PositionArray.splitAt(structure, y.start(), y.finish(), splitter, splitter);
        var sub = PositionArray.sub(structure, y.start(), y.finish());
        var information = Arr.foldl(sub, function (b, a) {
          var item = a.element();
          return {
            elements: b.elements.concat( [ item ] ),
            exact: b.exact + universe.property().getText(item)
          };
        }, { elements: [], exact: '' });
        return {
          elements: Fun.constant(information.elements),
          word: y.word,
          exact: Fun.constant(information.exact)
        };
      });
    };

    return {
      separate: separate
    };

  }
);
