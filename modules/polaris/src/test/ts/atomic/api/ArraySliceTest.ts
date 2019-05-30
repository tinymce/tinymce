import { assert, UnitTest } from '@ephox/bedrock';
import * as Arrays from 'ephox/polaris/api/Arrays';

UnitTest.test('api.Arrays.sliceby', function () {
  const check = function (expected: number[], input: number[], pred: (x: number, i: number, xs: ArrayLike<number>) => boolean) {
    const actual = Arrays.sliceby(input, pred);
    assert.eq(expected, actual);
  };

  const is = function (value: number) {
    return function (x: number) {
      return x === value;
    };
  };

  check([ ], [ ], is(0));
  check([ ], [ 1 ], is(1));
  check([ 1 ], [ 1, 2 ], is(2));
  check([ 1, 2, 3 ], [1, 2, 3, 4 ], is(4));
});
