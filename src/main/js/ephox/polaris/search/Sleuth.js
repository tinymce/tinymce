define(
  'ephox.polaris.search.Sleuth',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.polaris.search.Find',
    'global!Array'
  ],

  function (Arr, Merger, Find, Array) {
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
     * For each target (pattern, ....), find the matching text (if there is any) and record the start and end offsets.
     *
     * Then sort the result by start point.
     */
    var search = function (text, targets) {
      var unsorted = Arr.bind(targets, function (t) {
        var results = Find.all(text, t.pattern());
        return Arr.map(results, function (r) {
          return Merger.merge(t, {
            start: r.start,
            finish: r.finish
          });
        });
      });

      return sort(unsorted);
    };

    return {
      search: search
    };
  }
);
