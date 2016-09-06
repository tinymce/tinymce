test(
  'AdjustPositionsTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.alien.AdjustPositions',
    'ephox.alloy.alien.Rectangles',
    'ephox.perhaps.Option',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (RawAssertions, AdjustPositions, Rectangles, Option, Adt, Struct) {
    // NOTE: Recreating Origins from repartee because it uses DOM modules
    var adt = Adt.generate([
      { 'none': [ ] },
      { 'relative': [ 'x', 'y' ] },
      { 'fixed': [ 'x', 'y', 'width', 'height' ] }
    ]);

    var s = Struct.immutable('left', 'top');

    var check = function (expected, origin, optOffset, sx, sy, rx, ry, rw, rh) {
      var input = Rectangles.make({
        x: rx,
        y: ry,
        width: rw,
        height: rh
      });

      var scroll = s(sx, sy);
      var actual = AdjustPositions.adjust(origin, optOffset, scroll, input);
      RawAssertions.assertEq('checking x', expected.x, actual.x());
      RawAssertions.assertEq('checking y', expected.y, actual.y());
      RawAssertions.assertEq('checking w', expected.w, actual.width());
      RawAssertions.assertEq('checking h', expected.h, actual.height());
    };

    check(
      { x: 10, y: 10, w: 100, h: 50 },
      adt.relative(0, 0), Option.none(),
      0, 0,
      10, 10, 100, 50
    );

    
  }
);