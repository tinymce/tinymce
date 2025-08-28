import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ArrRangeTest', () => {

  it('unit tests', () => {
    const check = <R>(expected: R[], input: number, f: (i: number) => R) => {
      const actual = Arr.range(input, f);
      assert.deepEqual(actual, expected);
    };

    check([], 0, Fun.constant(10));
    check([ 10 ], 1, Fun.constant(10));
    check([ 10, 20, 30 ], 3, (x) => 10 * (x + 1));
  });

  it('property tests', () => {
    fc.assert(fc.property(
      fc.nat(30),
      (num) => {
        const range = Arr.range(num, Fun.identity);
        assert.deepEqual(num, range.length);
        assert.isTrue(Arr.forall(range, (x, i) => x === i));
      }));
  });
});
