test(
  'DragCoordTest',

  [
    'ephox.alloy.dragging.DragCoord',
    'ephox.sugar.alien.Position',
    'ephox.wrap.Jsc'
  ],

  function (DragCoord, Position, Jsc) {
    var assertPt = function (label, expected, actual) {
      var comparing = label + '\nCoordinate Expected: (' + expected.left() + ', ' + expected.top() + ')' +
        '\nCoordinate Actual: (' + actual.left() + ', ' + actual.top() + ')';

      return Jsc.eq(expected.left(), actual.left()) &&
        Jsc.eq(expected.top(), actual.top()) ? true : comparing;
    };

    Jsc.property(
      'round-tripping fixed coordinate',
      Jsc.integer,
      Jsc.integer,
      Jsc.integer,
      Jsc.integer,
      Jsc.integer,
      Jsc.integer,
      function (fixX, fixY, scrollX, scrollY, originX, originY) {
        var scroll = Position(scrollX, scrollY);
        var origin = Position(originX, originY);

        var fixed = DragCoord.fixed(fixX, fixY);
        
        var fixedAsFixed = (function () {
          return assertPt(
            'fixed -> fixed', 
            Position(fixX, fixY), 
            DragCoord.asFixed(fixed, scroll, origin)
          );
        })();

        if (fixedAsFixed !== true) return fixedAsFixed;

        var fixedToAbsoluteToFixed = (function () {
          var abs = DragCoord.asAbsolute(fixed, scroll, origin);
          var c = DragCoord.absolute(abs.left(), abs.top());
          return assertPt(
            'fixed -> absolute -> fixed',
            Position(fixX, fixY),
            DragCoord.asFixed(c, scroll, origin)
          );
        })();

        if (fixedToAbsoluteToFixed !== true) return fixedToAbsoluteToFixed;

        var fixedToOffsetToFixed = (function () {
          var abs = DragCoord.asOffset(fixed, scroll, origin);
          var c = DragCoord.offset(abs.left(), abs.top());
          return assertPt(
            'fixed -> offset -> fixed',
            Position(fixX, fixY),
            DragCoord.asFixed(c, scroll, origin)
          );
        })();

        if (fixedToOffsetToFixed !== true) return fixedToOffsetToFixed;

        return true;
      }
    );
  }
);