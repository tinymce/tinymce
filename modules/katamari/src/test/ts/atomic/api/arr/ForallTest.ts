import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ForallTest', () => {
  it('Arr.forall: unit tests', () => {
    const isone = (i) => i === 1;

    const check = (expected, input, f) => {
      assert.deepEqual(Arr.forall(input, f), expected);
      assert.deepEqual(Arr.forall(Object.freeze(input.slice()), f), expected);
    };

    check(true, [ 1, 1, 1 ], isone);
    check(false, [ 1, 2, 1 ], isone);
    check(false, [ 1, 2, 1 ], (x, i) => i === 0);
    check(true, [ 1, 12, 3 ], (x, i) => i < 10);
  });

  it('forall of an empty array is true', () => {
    assert.deepEqual(Arr.forall([], () => {
      throw new Error('⊥');
    }), true);
  });

  it('forall of a non-empty array with a predicate that always returns false is false', () => {
    fc.assert(fc.property(
      fc.array(fc.integer(), 1, 30),
      (xs) => {
        const output = Arr.forall(xs, Fun.never);
        assert.deepEqual(output, false);
      }
    ));
  });

  it('forall of a non-empty array with a predicate that always returns true is true', () => {
    fc.assert(fc.property(
      fc.array(fc.integer(), 1, 30),
      (xs) => {
        const output = Arr.forall(xs, Fun.always);
        assert.deepEqual(output, true);
      }
    ));
  });

});
