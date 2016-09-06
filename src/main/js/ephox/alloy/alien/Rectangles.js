define(
  'ephox.alloy.alien.Rectangles',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Fun, Struct) {
    var make = Struct.immutableBag([ 'x', 'y', 'width', 'height' ], [ ]);

    var empty = make({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });

    var translate = function (rect, x, y) {
      return make({
        x: rect.x() + x,
        y: rect.y() + y,
        width: rect.width(),
        height: rect.height()
      });
    };

    var fromRaw = function (rect) {
      return make({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    };

    return {
      make: make,
      empty: Fun.constant(empty),
      translate: translate,
      fromRaw: fromRaw
    };
  }
);