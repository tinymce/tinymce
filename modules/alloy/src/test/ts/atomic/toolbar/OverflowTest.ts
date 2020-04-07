import { UnitTest, assert } from '@ephox/bedrock-client';

import * as Overflows from 'ephox/alloy/toolbar/Overflows';

UnitTest.test('OverflowTest', () => {
  const len = (unit: string) => unit.length;

  const check = (expectedWithin: string[], expectedExtra: string[], total: number, input: string[], overflower: string) => {
    const actual = Overflows.partition(total, input, len, overflower);
    assert.eq(expectedWithin, actual.within());
    assert.eq(expectedExtra, actual.extra());
  };

  check([ 'cat' ], [], 100, [ 'cat' ], 'overflow');
  check([ 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
  check([ 'ap', 'overflowing' ], [ 'apple', 'bear', 'caterpillar', 'dingo' ], 15, [ 'ap', 'apple', 'bear', 'caterpillar', 'dingo' ], 'overflowing');
});
