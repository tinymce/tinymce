import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ReverseTest', () => {
  it('unit tests', () => {
    const check = <T>(expected: T[], input: T[]) => {
      assert.deepEqual(Arr.reverse(input), expected);
      assert.deepEqual(Arr.reverse(Object.freeze(input.slice())), expected);
    };

    check([], []);
    check([ 1 ], [ 1 ]);
    check([ 1, 2 ], [ 2, 1 ]);
    check([ 2, 1 ], [ 1, 2 ]);
    check([ 1, 4, 5, 3, 2 ], [ 2, 3, 5, 4, 1 ]);
  });

  it('Reversing twice is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      assert.deepEqual(Arr.reverse(Arr.reverse(arr)), arr);
    }));
  });

  it('reversing a one element array is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (a) => {
      assert.deepEqual(Arr.reverse([ a ]), [ a ]);
    }));
  });

  it('reverses 2 elements', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      assert.deepEqual(Arr.reverse([ a, b ]), [ b, a ]);
    }));
  });

  it('reverses 3 elements', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
      assert.deepEqual(Arr.reverse([ a, b, c ]), [ c, b, a ]);
    }));
  });

  it('every element in the input is in the output, and vice-versa', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (xs) => {
      const rxs = Arr.reverse(xs);
      assert.isTrue(Arr.forall(rxs, (x) => Arr.contains(xs, x)));
      assert.isTrue(Arr.forall(xs, (x) => Arr.contains(rxs, x)));
    }));
  });
});
