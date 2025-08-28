import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ContainsTest', () => {
  it('unit test', () => {
    const check = <T>(expected: boolean, input: T[], value: T) => {
      assert.deepEqual(Arr.contains(input, value), expected);
      assert.deepEqual(Arr.contains(Object.freeze(input.slice()), value), expected);
    };

    check(false, [], 1);
    check(true, [ 1 ], 1);
    check(false, [ 1 ], 2);
    check(true, [ 2, 4, 6 ], 2);
    check(true, [ 2, 4, 6 ], 4);
    check(true, [ 2, 4, 6 ], 6);
    check(false, [ 2, 4, 6 ], 3);
  });

  it('returns false when array is empty', () => {
    assert.isFalse(Arr.contains([], Fun.die('should not be called')));
  });

  it('returns true when element is in array', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, element, suffix) => {
      const arr2 = [ ...prefix, element, ...suffix ];
      assert.isTrue(Arr.contains(arr2, element));
    }));
  });
});
