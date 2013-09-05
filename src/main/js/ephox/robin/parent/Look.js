define(
  'ephox.robin.parent.Look',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    /**
     * Creates a look function that searches the parent elements until
     * the predicate returns true
     *
     * f: element -> boolean
     */
    var predicate = function (f) {
      var look = function(universe, element) {
        return f(element) ?
            Option.some(element) :
            universe.up().predicate(element, f);
      };
      return look;
    };

    return {
      predicate: predicate
    };
  }
);
