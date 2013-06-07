define(
  'ephox.phoenix.search.Searcher',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Family',
    'ephox.phoenix.search.MatchSplitter',
    'ephox.phoenix.search.Sleuth',
    'ephox.phoenix.util.doc.List',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.PositionArray',
    'ephox.scullion.Struct'
  ],

  function (Arr, Option, Spot, Family, MatchSplitter, Sleuth, List, Pattern, PositionArray, Struct) {
    var namedPattern = Struct.immutable('word', 'pattern');

    var gen = function (universe, input) {
      return PositionArray.generate(input, function (unit, offset) {
        var finish = offset + universe.property().getText(unit).length;
        return Option.from(Spot.range(unit, offset, finish));
      });
    };

    var run = function (universe, elements, patterns) {
      var sections = Family.group(universe, elements);
      var result = Arr.bind(sections, function (x) {
        var input = List.justText(x);
        var text = Arr.map(input, universe.property().getText).join('');

        var matches = Sleuth.search(text, patterns);
        var plist = gen(universe, input);

        return MatchSplitter.separate(universe, plist, matches);
      });

      return result;
    };

    var safeWords = function (universe, elements, words) {
      var patterns = Arr.map(words, function (word) {
        var pattern = Pattern.safeword(word);
        return namedPattern(word, pattern);
      });
      return run(universe, elements, patterns);
    };

    var safeToken = function (universe, elements, token) {
      var pattern = namedPattern(token, Pattern.safetoken(token));
      return run(universe, elements, [pattern]);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
