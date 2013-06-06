define(
  'ephox.phoenix.search.Sleuth',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.util.str.Find',
    'global!Array'
  ],

  function (Arr, Find, Array) {
    var sort = function (array) {
      var r = Array.prototype.slice.call(array, 0);
      r.sort(function (a, b) {
        if (a.start() < b.start()) return -1;
        else if (b.start() < a.start()) return 1;
        else return 0;
      });
      return r;
    };

    var search = function (text, patterns) {
      var unsorted = Arr.bind(patterns, function (y) {
        var results = Find.all(text, y.pattern());
        return Arr.map(results, function (z) {
          return {
            word: y.word,
            start: z.start,
            finish: z.finish
          };
        });
      });

      return sort(unsorted);
    };

    return {
      search: search
    };
  }
);
