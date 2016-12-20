define(
  'ephox.sugar.alien.Recurse',

  [

  ],

  function () {
    /**
     * Applies f repeatedly until it completes (by returning Option.none()).
     *
     * Normally would just use recursion, but JavaScript lacks tail call optimisation.
     *
     * This is what recursion looks like when manually unravelled :)
     */
    var toArray = function (target, f) {
      var r = [];

      var recurse = function (e) {
        r.push(e);
        return f(e);
      };

      var cur = f(target);
      do {
        cur = cur.bind(recurse);
      } while (cur.isSome());

      return r;
    };

    return {
      toArray: toArray
    };
  }
);