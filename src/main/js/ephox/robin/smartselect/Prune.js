define(
  'ephox.robin.smartselect.Prune',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.util.WordUtil'
  ],

  function (Option, Spot, WordUtil) {
    return function (universe) {
      var stop = function (element) {
        return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);
      };

      var breakUsing = function (breaker, element, adjust) {
        var textOption = universe.property().isText(element) ? Option.some(universe.property().getText(element)) : Option.none();
        var edge = textOption.bind(breaker);
        return edge.map(function (index) {
          return Spot.point(element, index + adjust);
        });
      };

      var left = function (element) {
        // The 1 here is because we don't want to include the breaking character.
        return breakUsing(WordUtil.leftBreak, element, 1);
      };

      var right = function (element) {
        return breakUsing(WordUtil.rightBreak, element, 0);
      };

      return {
        left: left,
        right: right,
        stop: stop
      };
    };

  }
);
