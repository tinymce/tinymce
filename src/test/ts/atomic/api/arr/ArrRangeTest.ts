import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrRangeTest', function() {
  var check = function (expected, input, f) {
    var actual = Arr.range(input, f);
    assert.eq(expected, actual);
  };

  check([ ], 0, Fun.constant(10));
  check([ 10 ], 1, Fun.constant(10));
  check([ 10, 20, 30 ], 3, function (x) { return 10 * (x+1); });

  Jsc.property(
    'Range(num, Fun.identity) should Arr.forall(x === index) && length === num',
    Jsc.nat,
    function (num) {
      var range = Arr.range(num, Fun.identity);
      return Arr.forall(range, function (x, i) {
        return x === i;
      }) && range.length === num;
    }
  );

  Jsc.property(
    'Range(num, Fun.constant(c)) should Arr.forall(x === c) && length === num',
    Jsc.nat,
    Jsc.json,
    function (num, c) {
      var range = Arr.range(num, Fun.constant(c));
      return Arr.forall(range, function (x, i) {
        return x === c;
      }) && range.length === num;
    }
  );
});

