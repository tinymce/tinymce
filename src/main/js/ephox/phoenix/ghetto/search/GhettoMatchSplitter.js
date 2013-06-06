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

      var splitAt = function (list, start, finish, first, last) {
        return Arr.foldr(list, function (b, a) {
          if (start >= a.start() && start <= a.finish()) {
            var rest = first(start, a);
            var after = rest[rest.length - 1];
            if (finish >= after.start() && finish  <= after.finish()) {
              var before = rest.length > 1 ? [rest[0]] : [];
              return before.concat(last(finish, after)).concat(b);
            } else {
              return rest.concat(b);
            }
            return first(start, a).concat(b);
          } else if (finish >= a.start() && finish <= a.finish()) {
            return last(finish, a).concat(b);
          } else {
            return [a].concat(b);
          }
        }, []);
      };

      var structure = list;
      return Arr.map(matches, function (y) {
        structure = splitAt(structure, y.start(), y.finish(), splitter, splitter);
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
