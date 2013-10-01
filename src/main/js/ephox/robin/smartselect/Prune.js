define(
  'ephox.robin.smartselect.Prune',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.util.WordUtil'
  ],

  function (Fun, Option, Spot, WordUtil) {
    return function (universe) {
      var stop = function (element) {
        return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);
      };

      var breakUsing = function (breaker, element, adjust, extremity) {
        if (stop(element)) { return  Option.some([]); }
        var textOption = universe.property().isText(element) ? Option.some(universe.property().getText(element)) : Option.none();
        return textOption.bind(function (text) {
          return breaker(text).map(function (index) {
            return [ Spot.point(element, index + adjust) ];
          });
        });
      };

      var left = function (element) {
        // The 1 here is because we don't want to include the breaking character.
        return breakUsing(WordUtil.leftBreak, element, 1, Fun.constant(0));
      };

      var right = function (element) {
        return breakUsing(WordUtil.rightBreak, element, 0, function (text) {
          return text.length;
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
