define(
  'ephox.alloy.alien.AdjustPositions',

  [
    'ephox.alloy.alien.Rectangles',
    'ephox.peanut.Fun'
  ],

  function (Rectangles, Fun) {
    var adjust = function (origin, optOffset, scroll, box) {
      // Shared concept with repartee, but we don't have an element.
      // (calls OuterPosition.find in repartee)

      // Not using Origins.cata here because it has DOM imports
      return optOffset.fold(function () {
        return box;
      }, function (offset) {
        return Rectangles.translate(box, offset.left(), offset.top());
      });
    };

    return {
      adjust: adjust
    };
  }
);