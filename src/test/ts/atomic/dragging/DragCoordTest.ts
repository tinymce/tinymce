import DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Arr } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('DragCoordTest', function() {
  var assertPt = function (label, expected, actual) {
    var comparing = label + '\nCoordinate Expected: (' + expected.left() + ', ' + expected.top() + ')' +
      '\nCoordinate Actual: (' + actual.left() + ', ' + actual.top() + ')';

    return Jsc.eq(expected.left(), actual.left()) &&
      Jsc.eq(expected.top(), actual.top()) ? true : comparing;
  };

  var arbConversions = Jsc.elements([
    { asPoint: DragCoord.asFixed, nu: DragCoord.fixed, mode: 'fixed' },
    { asPoint: DragCoord.asAbsolute, nu: DragCoord.absolute, mode: 'absolute' },
    { asPoint: DragCoord.asOffset, nu: DragCoord.offset, mode: 'offset' }
  ]);

  var arbPosition = function (name) {
    return Jsc.tuple([ Jsc.integer, Jsc.integer ]).smap(function (arr) {
      return Position(arr[0], arr[1]);
    }, function (pos) {
      return [ pos.left(), pos.top() ];
    }, function (pos) {
      return name + ': { left: ' + pos.left() + ', top: ' + pos.top() + '}';
    });
  };

  Jsc.property(
    'round-tripping coordinates',
    arbConversions,
    Jsc.array(arbConversions),
    arbPosition('point'),
    arbPosition('scroll'),
    arbPosition('origin'),
    function (original, transformations, coord, scroll, origin) {
      var o = original.nu(coord.left(), coord.top());

      var label = [ original.mode ].concat(Arr.map(transformations, function (t) { return t.mode; }));

      var result = Arr.foldl(transformations, function (b, transformation) {
        var pt = transformation.asPoint(b, scroll, origin);
        return transformation.nu(pt.left(), pt.top());
      }, o);

      var output = original.asPoint(result, scroll, origin);
      return assertPt(
        '\n' + label,
        coord,
        output
      );
    }
  );
});

