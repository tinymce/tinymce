define(
  'ephox.robin.leftblock.Prune',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.util.node.Classification'
  ],

  function (Option, Classification) {
    var stop = function (element) {
      // FIX: Probably shouldn't stop on empty.
      return Classification.isEmpty(element) || Classification.isBoundary(element);
    };

    var left = function (element) {
      return stop(element) ? Option.some([]) : Option.none();
    };

    var right = function (element) {
      return Option.some([]);
    };

    return {
      left: left,
      right: right,
      stop: stop
    };

  }
);