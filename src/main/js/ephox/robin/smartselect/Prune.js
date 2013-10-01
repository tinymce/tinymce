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

      var left = function (element) {
        var textOption = universe.property().isText(element) ? Option.some(universe.property().getText(element)) : Option.none();
        var edge = textOption.bind(WordUtil.leftBreak);
        return edge.map(function (index) {
          return Spot.point(element, index);
        });
      };

      var right = function (element) {
        // Dupe with above.
        var textOption = universe.property().isText(element) ? Option.some(universe.property().getText(element)) : Option.none();
        var edge = textOption.bind(WordUtil.rightBreak);
        return edge.map(function (index) {
          return Spot.point(element, index);
        });
      };

      return {
        left: left,
        right: right,
        stop: stop
      };
    };

  }
);
