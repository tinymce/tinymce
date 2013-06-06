define(
  'ephox.phoenix.search.Searcher',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.group.DomGroup',
    'ephox.phoenix.search.Safe',
    'ephox.phoenix.search.Sleuth',
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.str.Find',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, DomGroup, Safe, Sleuth, Splitter, PositionArray, List, Find, Struct, Text) {

    var WordPattern = Struct.immutable('word', 'pattern');

    
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

        var matches = Sleuth.search(text, patterns);
        var structure = gen(input);

        /* Not great that structure changes outside and inside the map */
        return Arr.map(matches, function (y) {
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
