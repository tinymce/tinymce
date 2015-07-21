define(
  'ephox.robin.words.Identify',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.Search',
    'ephox.robin.data.WordScope',
    'ephox.robin.util.WordSanitiser',
    'global!RegExp'
  ],

  function (Arr, Option, Pattern, Search, WordScope, WordSanitiser, RegExp) {
    var words = function (allText) {
      var pattern = Pattern.unsafetoken(Pattern.wordchar() + '+', Option.none());
      var matches = Search.findall(allText, pattern);

      var len = allText.length;

      // FIX ... I may possibly index strings elsewhere.
      return Arr.map(matches, function (x) {
        var start = x.start();
        var finish = x.finish();
        var text = allText.substring(start, finish);
        var prev = start > 0 ? Option.some(allText.charAt(start - 1)) : Option.none();
        var next = finish < len ? Option.some(allText.charAt(finish)) : Option.none();
        var r = WordScope(text, prev, next);
        return WordSanitiser.scope(r);
      });
    };

    return {
      words: words
    };
  }
);
