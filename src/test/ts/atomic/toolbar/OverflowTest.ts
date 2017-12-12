import Overflows from 'ephox/alloy/toolbar/Overflows';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('OverflowTest', function() {
  /* global assert */
  var len = function (unit) {
    return unit.length;
  };

  var check = function (expectedWithin, expectedExtra, total, input, overflower) {
    var actual = Overflows.partition(total, input, len, overflower);
    assert.eq(expectedWithin, actual.within());
    assert.eq(expectedExtra, actual.extra());
  };

  check([ 'cat' ], [], 100, [ 'cat' ], 'overflow');
  check([ 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
  check([ 'ap', 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'ap', 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
});

