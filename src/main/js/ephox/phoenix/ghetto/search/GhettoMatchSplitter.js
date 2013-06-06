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

      var yipes = function (list, positions) {
        // get all the positions that are within this item.
        var inItem = function (item, position) {
          return position >= item.start() && position <= item.finish();
        };

        var subdivide = function (item, points) {
          var raw = GhettoSplitter.subdivide(universe, item.element(), points);
          return PositionArray.translate(raw, item.start());
        };

        return Arr.bind(list, function (unit) {
          var relevant = Arr.bind(positions, function (pos) {
            return inItem(unit, pos) ? [ pos - unit.start() ] : [];
          });

          console.log('Unit: ', unit.start(), unit.finish(), 'relevant: ', relevant, 'text: ', universe.property().getText(unit.element()));

          return relevant.length > 0 ? subdivide(unit, relevant) : [ unit ];
        });
      };

      var allPositions = Arr.bind(matches, function (match) {
        return [ match.start(), match.finish() ];
      });


      console.log('splitting at positions: ', allPositions);
      var logList = function (label, plist) {
        console.log(label, Arr.map(plist, function (unit) {
          return unit.start() + '->' + unit.finish();
        }).join(', '));
      };

      var structure = yipes(list, allPositions);
      logList('Yipes: ', structure);

      // var structure = list;
      return Arr.map(matches, function (y) {
        console.log('looking for elements: ', y.start(), y.finish());
        // structure = PositionArray.splitAt(structure, y.start(), y.finish(), splitter, splitter);
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
