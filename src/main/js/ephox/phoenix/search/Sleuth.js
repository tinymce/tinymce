define(
  'ephox.phoenix.search.Sleuth',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Search',
    'global!Array'
  ],

  function (Arr, Search, Array) {
    var sort = function (array) {
      var r = Array.prototype.slice.call(array, 0);
      r.sort(function (a, b) {
        if (a.start() < b.start()) return -1;
        else if (b.start() < a.start()) return 1;
        else return 0;
      });
      return r;
    };


    /**
     * For each pattern, find the matching text (if there is any) and record the start and end offsets.
     *
     * Then sort the result by start point.
     */
    var search = function (text, patterns) {
      var unsorted = Arr.bind(patterns, function (p) {
        var results = Search.findall(text, p.pattern());
        return Arr.map(results, function (r) {
          return {
            word: p.word,
            start: r.start,
            finish: r.finish
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
