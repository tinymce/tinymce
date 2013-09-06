define(
  'ephox.robin.leftblock.Prune',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    return function (universe) {
      var stop = function (element) {
        // INVESTIGATE: Probably shouldn't stop on empty.
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
