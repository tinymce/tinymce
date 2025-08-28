import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Unique from 'ephox/katamari/api/Unique';

describe('atomic.katamari.api.arr.UniqueTest', () => {
  it('unit tests', () => {
    const expected = [ 'three', 'two', 'one' ];

    const check = (input: string[]) => {
      assert.deepEqual(Unique.stringArray(input), expected);
    };

    check([ 'three', 'two', 'one' ]);
    check([ 'three', 'three', 'two', 'one' ]);
    check([ 'three', 'three', 'two', 'two', 'one' ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one' ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three' ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two' ]);
    check([ 'three', 'three', 'two', 'two', 'one', 'one', 'three', 'two', 'one' ]);
  });

  it('each element is not found in the rest of the array', () => {
    fc.assert(fc.property(fc.array(fc.string()), (arr) => {
      const unique = Unique.stringArray(arr);
      return Arr.forall(unique, (x, i) => !Arr.contains(unique.slice(i + 1), x));
    }));
  });

  it('is idempotent', () => {
    fc.assert(fc.property(fc.array(fc.string()), (arr) => {
      const once = Unique.stringArray(arr);
      const twice = Unique.stringArray(once);
      assert.deepEqual(Arr.sort(twice), Arr.sort(once));
    }));
  });
});
