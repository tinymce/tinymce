define(
  'ephox.phoenix.search.DomMatchSplitter',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Splitter, PositionArray, Text) {
    var separate = function (list, matches) {
      var structure = list;
      return Arr.map(matches, function (y) {
        structure = PositionArray.splitAt(structure, y.start(), y.finish(), Splitter.split, Splitter.split);
        var sub = PositionArray.sub(structure, y.start(), y.finish());
        var information = Arr.foldl(sub, function (b, a) {
          return {
            elements: b.elements.concat( [a.element()] ),
            exact: b.exact + Text.get(a.element())
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
