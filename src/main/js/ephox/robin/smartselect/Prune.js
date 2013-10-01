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
        console.log('element: ', element.id);
        return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);
      };

      var breakUsing = function (breaker, element, adjust, extremity) {
        if (stop(element)) { return  Option.some([]); }
        var textOption = universe.property().isText(element) ? Option.some(universe.property().getText(element)) : Option.none();
        return textOption.map(function (text) {
          return breaker(text).fold(function () {
            return [ Spot.point(element, extremity(text)) ];
          }, function (index) {
            return [ Spot.point(element, index + adjust) ];
          });
        });
      };

      var left = function (element) {
        console.log('going left');
        // The 1 here is because we don't want to include the breaking character.
        return breakUsing(WordUtil.leftBreak, element, 1, Fun.constant(0));
      };

      var right = function (element) {
        console.log('going right');
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
