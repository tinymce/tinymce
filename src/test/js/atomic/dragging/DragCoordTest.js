test(
  'DragCoordTest',

  [
    'ephox.alloy.dragging.DragCoord',
    'ephox.compass.Arr',
    'ephox.sugar.alien.Position',
    'ephox.wrap.Jsc'
  ],

  function (DragCoord, Arr, Position, Jsc) {
    var assertPt = function (label, expected, actual) {
      var comparing = label + '\nCoordinate Expected: (' + expected.left() + ', ' + expected.top() + ')' +
        '\nCoordinate Actual: (' + actual.left() + ', ' + actual.top() + ')';

      return Jsc.eq(expected.left(), actual.left()) &&
        Jsc.eq(expected.top(), actual.top()) ? true : comparing;
    };

    var roundtrip = function (label, asOther, nuOther, asInitial, nuInitial, pt, scroll, origin) {
      return (function () {
        var initial = nuInitial(pt.left(), pt.top());
        var changed = asOther(initial, scroll, origin);
        var c = nuOther(changed.left(), changed.top());
        return assertPt(
          label,
          pt,
          asInitial(c, scroll, origin)
        );
      })();
    };

    var tryTrips = function (asInitial, nuInitial, pt, scroll, origin, trips) {
      return Arr.foldl(trips, function (b, trip) {
        return b !== true || roundtrip(
          trip.label,
          trip.asOther, trip.nuOther,
          asInitial, nuInitial,
          pt,
          scroll, origin
        );
      }, true);
    };

    Jsc.property(
      'round-tripping fixed coordinate',
      Jsc.integer, Jsc.integer, Jsc.integer, Jsc.integer, Jsc.integer, Jsc.integer,
      function (fixX, fixY, scrollX, scrollY, originX, originY) {
        var scroll = Position(scrollX, scrollY);
        var origin = Position(originX, originY);

        var trips = [
          {
            label: 'fixed -> fixed -> fixed',
            asOther: DragCoord.asFixed,
            nuOther: DragCoord.fixed
          }
        ];

        return tryTrips(
          DragCoord.asFixed, DragCoord.fixed,
          Position(fixX, fixY),
          scroll, origin,
          trips
        );
      }
    );

  }
);