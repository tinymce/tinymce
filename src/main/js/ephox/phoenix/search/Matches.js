define(
  'ephox.phoenix.search.Matches',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.group.Group',
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.search.Transform',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.str.Find',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, Group, Splitter, Transform, PositionArray, List, Find, Struct, Text) {

    var WordMatch = Struct.immutable('word', 'start', 'finish');

    var sort = function (array) {
      var r = Array.prototype.slice.call(array, 0);
      r.sort(function (a, b) {
        if (a.start() < b.start()) return -1;
        else if (b.start() < a.start()) return 1;
        else return 0;
      });
      return r;
    };

    var gen = function (input) {
      return PositionArray.make(input, function (x, offset) {
        var finish = offset + Text.get(x).length;
        return Option.from(Spot.range(x, offset, finish));
      });
    };

    var run = function (elements, words) {
      var patterns = Transform.safe(words);

      var sections = Group.group(elements);
      var result = Arr.bind(sections, function (x) {
        var input = List.justText(x);
        var text = Arr.map(input, Text.get).join('');

        var matches = Arr.bind(patterns, function (y) {
          var results = Find.viper(text, y.pattern);
          return Arr.map(results, function (z) {
            return WordMatch(y.word, z[0], z[1]);
          });
        });

        var sorted = sort(matches);
        var structure = gen(input);

        /* Not great that structure changes outside and inside the map */
        return Arr.map(sorted, function (y) {
          structure = PositionArray.splitAt(structure, y.start(), y.finish(), Splitter.split, Splitter.split);
          var sub = PositionArray.sub(structure, y.start(), y.finish());
          return {
            elements: Fun.constant(Arr.map(sub, function (z) { return z.element(); })),
            word: y.word
          };
        });
      });

      return result;
    };

    return {
      run: run
    };
  }
);
