define(
  'ephox.phoenix.search.Searcher',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.NamedPattern',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Family',
    'ephox.phoenix.extract.TypedList',
    'ephox.phoenix.search.MatchSplitter',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.PositionArray',
    'ephox.polaris.api.Search'
  ],

  function (Arr, Option, NamedPattern, Spot, Family, TypedList, MatchSplitter, Pattern, PositionArray, Search) {
    var gen = function (universe, input) {
      return PositionArray.generate(input, function (unit, offset) {
        var finish = offset + universe.property().getText(unit).length;
        return Option.from(Spot.range(unit, offset, finish));
      });
    };

    /**
     * Extracts groups of elements separated by boundaries.
     *
     * For each group, search the text for pattern matches.
     *
     * Returns a list of matches.
     */
    var run = function (universe, elements, patterns, optimise) {
      var sections = Family.group(universe, elements, optimise);
      var result = Arr.bind(sections, function (x) {
        var input = TypedList.justText(x);
        var text = Arr.map(input, universe.property().getText).join('');

        var matches = Search.findmany(text, patterns);
        var plist = gen(universe, input);

        return MatchSplitter.separate(universe, plist, matches);
      });

      return result;
    };


    /**
     * Runs a search for one or more words
     */
    var safeWords = function (universe, elements, words, optimise) {
      var patterns = Arr.map(words, function (word) {
        var pattern = Pattern.safeword(word);
        return NamedPattern(word, pattern);
      });
      return run(universe, elements, patterns, optimise);
    };


    /**
     * Runs a search for a single token
     */
    var safeToken = function (universe, elements, token, optimise) {
      var pattern = NamedPattern(token, Pattern.safetoken(token));
      return run(universe, elements, [pattern], optimise);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
