define(
  'ephox.alloy.alien.AdjustPositions',

  [
    'ephox.alloy.alien.Rectangles',
    'ephox.peanut.Fun'
  ],

  function (Rectangles, Fun) {
    var adjust = function (origin, optOffset, scroll, box) {
      var addScroll = function (rect) {
        return Rectangles.translate(rect, scroll.left(), scroll.top());
      };

      var subtractScroll = function (rect) {
        return Rectangles.translate(rect, -scroll.left(), -scroll.top());
      };

      var addExtra = function (f, g, rect) {
        return optOffset.fold(function () {
          return rect;
        }, function (offset) {
          return Rectangles.translate(rect, offset.left(), offset.top());
        });
      };

      // Shared concept with repartee, but we don't have an element.
      // (calls OuterPosition.find in repartee)

      // Not using Origins.cata here because it has DOM imports
      return origin.fold(function (/*none*/) {
        return addExtra(Fun.identity, Fun.identity, box);
      }, function (/* relative */) {
        return addExtra(Fun.identity, Fun.identity, box);
      }, function (/* fixed */) {
        return addExtra(subtractScroll, subtractScroll, box);
      });
    };

    return {
      adjust: adjust
    };
  }
);