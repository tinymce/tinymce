define(
  'ephox.robin.parent.Breaker',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Arr, Fun, Option) {
    var bisect = function (universe, parent, child) {
      var children = universe.property().children(parent);
      var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
      return index > -1 ? Option.some({
        before: Fun.constant(children.slice(0, index)),
        after: Fun.constant(children.slice(index + 1))
      }) : Option.none();
    };

    var unsafeBreakAt = function (universe, parent, parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return second;
    };

    var breakAt = function (universe, parent, child) {
      var parts = bisect(universe, parent, child);
      return parts.map(function (ps) {
        return unsafeBreakAt(universe, parent, ps);
      });
    };

    return {
      breakAt: breakAt
    };
  }
);
