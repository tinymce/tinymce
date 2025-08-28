import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ArrUniqueTest', () => {
  it('unit tests', () => {
    const expected = [ 'three', 'two', 'one', 4, 5, 6 ];

    const check = (input: Array<string | number>) => {
      assert.deepEqual(Arr.unique(input), expected);
    };

    check([ 'three', 'two', 'one', 4, 5, 6 ]);
    check([ 'three', 'three', 'two', 'one', 4, 4, 5, 6 ]);
    check([ 'three', 'three', 'two', 'two', 'one', 4, 4, 5, 5, 6 ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 4, 4, 5, 5, 6, 6 ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 4, 4, 5, 5, 6, 6, 4 ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two', 4, 4, 5, 5, 6, 6, 4, 5 ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two', 'one', 4, 4, 5, 5, 6, 6, 4, 5, 6 ]);
  });

  it('custom comparator', () => {
    const startsWithTh = (left: string, right: string) => left.slice(0, 2) === right.slice(0, 2);
    assert.deepEqual(Arr.unique([ 'one', 'three', 'there', 'their' ], startsWithTh), [ 'one', 'three' ]);

    assert.deepEqual(Arr.unique([
      { a: 1, b: 2 },
      { a: 1, b: 2 },
      { a: 2, b: 4 }
    ], (left, right) => left.a === right.a), [
      { a: 1, b: 2 },
      { a: 2, b: 4 }
    ]);
  });

  it('each element is not found in the rest of the array', () => {
    fc.assert(fc.property(fc.array(fc.string()), (arr) => {
      const unique = Arr.unique(arr);
      return Arr.forall(unique, (x, i) => !Arr.contains(unique.slice(i + 1), x));
    }));
  });

  it('is idempotent', () => {
    fc.assert(fc.property(fc.array(fc.anything()), (arr) => {
      const once = Arr.unique(arr);
      const twice = Arr.unique(once);
      assert.deepEqual(twice, once);
    }));
  });
});
