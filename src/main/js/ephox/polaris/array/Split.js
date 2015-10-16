define(
  'ephox.polaris.array.Split',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Splitting'
  ],

  function (Arr, Splitting) {
    /**
     * Split an array into chunks matched by the predicate
     */
    var splitby = function (xs, pred) {
      return splitbyAdv(xs, function (x) {
        return pred(x) ? Splitting.excludeWithout(x) : Splitting.include(x);
      });
    };

    /**
     * Split an array into chunks matched by the predicate
     */
    var splitbyAdv = function (xs, pred) {
      var r = [];
      var part = [];
      Arr.each(xs, function (x) {
        var choice = pred(x);
        Splitting.cata(choice, function () {
          // Include in the current sublist.
          part.push(x);
        }, function () {
          // Stop the current list, create a new list containing just list, and then restart the next list.
          r.push(part);
          r.push([ x ]);
          part = [];
        }, function () {
          // Stop the current list, and restart the next list.
          r.push(part);
          part = [];
        });
      });

      if (part.length > 0) r.push(part);
      return r;
    };

    return {
      splitby: splitby,
      splitbyAdv: splitbyAdv
    };
  }
);
