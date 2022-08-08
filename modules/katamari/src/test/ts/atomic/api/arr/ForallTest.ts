import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ForallTest', () => {
  it('unit tests', () => {
    const isOne = (i: number) => i === 1;

    const check = <T>(expected: boolean, input: T[], f: (x: T, i: number) => boolean) => {
      assert.deepEqual(Arr.forall(input, f), expected);
      assert.deepEqual(Arr.forall(Object.freeze(input.slice()), f), expected);
    };

    check(true, [ 1, 1, 1 ], isOne);
    check(false, [ 1, 2, 1 ], isOne);
    check(false, [ 1, 2, 1 ], (x, i) => i === 0);
    check(true, [ 1, 12, 3 ], (x, i) => i < 10);
  });

  it('forall of an empty array is true', () => {
    assert.isTrue(Arr.forall([], Fun.die('should not be called')));
  });

  it('forall of a non-empty array with a predicate that always returns false is false', () => {
    fc.assert(fc.property(
      fc.array(fc.integer(), 1, 30),
      (xs) => {
        assert.isFalse(Arr.forall(xs, Fun.never));
      }
    ));
  });

  it('forall of a non-empty array with a predicate that always returns true is true', () => {
    fc.assert(fc.property(
      fc.array(fc.integer(), 1, 30),
      (xs) => {
        assert.isTrue(Arr.forall(xs, Fun.always));
      }
    ));
  });
});
