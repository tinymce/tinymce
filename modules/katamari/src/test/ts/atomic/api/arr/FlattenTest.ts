import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.FlattenTest', () => {
  it('unit tests', () => {
    const check = (expected: number[], input: number[][]) => {
      assert.deepEqual(Arr.flatten(input), expected);
    };

    check([], []);
    check([ 1 ], [[ 1 ]]);
    check([ 1, 2 ], [[ 1 ], [ 2 ]]);
    check([ 1, 2, 3, 4, 5 ], [[ 1, 2 ], [], [ 3 ], [ 4, 5 ], []]);
  });

  it('is consistent with chunking', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.integer(1, 5),
      (arr, chunkSize) => {
        const chunks = Arr.chunk(arr, chunkSize);
        const bound = Arr.flatten(chunks);
        assert.deepEqual(bound, arr);
      }
    ));
  });

  it('wrap then flatten array is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      assert.deepEqual(arr, Arr.flatten(Arr.pure(arr)));
    }));
  });

  it('mapping pure then flattening array is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      assert.deepEqual(arr, Arr.flatten(Arr.map(arr, Arr.pure)));
    }));
  });

  it('flattening two lists === concat', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
      assert.deepEqual(xs.concat(ys), Arr.flatten([ xs, ys ]));
    }));
  });
});
