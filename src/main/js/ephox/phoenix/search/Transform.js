define(
  'ephox.phoenix.search.Transform',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.search.Pattern'
  ],

  function (Arr, Pattern) {

    var safe = function (words) {
      return Arr.map(words, function (x) {
        var safeX = x.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        return {
          word: x,
          pattern: Pattern.word(safeX)
        };
      });
    };

    return {
      safe: safe
    };
  }
);
