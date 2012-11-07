define(
  'ephox.robin.word.Identify',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.search.Chars',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.str.Find',
    'ephox.robin.data.WordScope',
    'ephox.robin.util.WordSanitiser',
    'global!RegExp'
  ],

  function (Arr, Option, Chars, Pattern, Find, WordScope, WordSanitiser, RegExp) {
  
    var whitelist = ["'twas"];

    var words = function (allText) {
      var pattern = Pattern.token(Chars.wordchar() + '+');
      var matches = Find.all(allText, pattern);
      var len = allText.length;

      // FIX ... I may possibly index strings elsewhere.
      return Arr.bind(matches, function (x) {
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
