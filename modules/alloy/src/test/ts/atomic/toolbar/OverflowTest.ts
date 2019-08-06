import { UnitTest, assert } from '@ephox/bedrock';

import * as Overflows from 'ephox/alloy/toolbar/Overflows';

UnitTest.test('OverflowTest', () => {
  /* global assert */
  const len = (unit) => {
    return unit.length;
  };

  const check = (expectedWithin, expectedExtra, total, input, overflower) => {
    const actual = Overflows.partition(total, input, len, overflower);
    assert.eq(expectedWithin, actual.within());
    assert.eq(expectedExtra, actual.extra());
  };

  check([ 'cat' ], [], 100, [ 'cat' ], 'overflow');
  check([ 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
  check([ 'ap', 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'ap', 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
});
