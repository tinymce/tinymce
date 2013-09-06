define(
  'ephox.robin.leftblock.Prune',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    /**
     * A prune that keeps going left until it reaches an empty element or boundary.
     */
    return function (universe) {
      var stop = function (element) {
        // INVESTIGATE: Should it really stop on empty?
        return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);
      };

      var left = function (element) {
        return stop(element) ? Option.some([]) : Option.none();
      };

      var right = function (/* element */) {
        return Option.some([]);
      };

      return {
        left: left,
        right: right,
        stop: stop
      };
    };

  }
);
