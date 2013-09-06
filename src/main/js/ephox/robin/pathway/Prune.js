define(
  'ephox.robin.pathway.Prune',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fun, Option) {
    /**
     * A prune that given a start element, goes left or right until it reaches the finish element.
     */
    var range = function (universe, start, finish) {
      var abort = Fun.constant(Option.some([]));
      var scour = function (item) {
        return universe.eq(item, finish) ? Option.some([item]) : Option.none();
      };

      var direction = universe.query().comparePosition(start, finish);
      return {
        left: direction & 2 ? scour : abort,
        right: direction & 4 ? scour : abort,
        stop: Fun.constant(false)
      };
    };

    return {
      range: range
    };
  }
);
