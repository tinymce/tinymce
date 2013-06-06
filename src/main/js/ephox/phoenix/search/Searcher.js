define(
  'ephox.phoenix.search.Searcher',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.group.DomGroup',
    'ephox.phoenix.search.Safe',
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.str.Find',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, DomGroup, Safe, Splitter, PositionArray, List, Find, Struct, Text) {

    var WordMatch = Struct.immutable('word', 'start', 'finish');
    var WordPattern = Struct.immutable('word', 'pattern');

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

    var run = function (elements, patterns) {
      var sections = DomGroup.group(elements);
      var result = Arr.bind(sections, function (x) {
        var input = List.justText(x);
        var text = Arr.map(input, Text.get).join('');

        var matches = Arr.bind(patterns, function (y) {
          var results = Find.all(text, y.pattern());
          return Arr.map(results, function (z) {
            return WordMatch(y.word(), z.start(), z.finish());
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
            word: y.word,
            exact: Fun.constant(text.substring(y.start(), y.finish()))
          };
        });
      });

      return result;
    };

    var safeWords = function (elements, words) {
      var patterns = Arr.map(words, function (x) {
        var pattern = Safe.word(x);
        return WordPattern(x, pattern);
      });
      return run(elements, patterns);
    };

    var safeToken = function (elements, token) {
      var pattern = WordPattern(token ,Safe.token(token));
      return run(elements, [pattern]);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };
  }
);
