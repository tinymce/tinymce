import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ChunkTest', () => {
  it('unit tests', () => {
    const check = (expected: number[][], initial: number[], size: number): void => {
      assert.deepEqual(Arr.chunk(initial, size), expected);
      assert.deepEqual(Arr.chunk(Object.freeze(initial.slice()), size), expected);
    };

    check([[ 1, 2, 3 ], [ 4, 5, 6 ]], [ 1, 2, 3, 4, 5, 6 ], 3);
    check([[ 1, 2, 3, 4, 5, 6 ]], [ 1, 2, 3, 4, 5, 6 ], 6);
    check([[ 1, 2, 3, 4, 5, 6 ]], [ 1, 2, 3, 4, 5, 6 ], 12);
    check([[ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ]], [ 1, 2, 3, 4, 5, 6 ], 1);
    check([[ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10 ]], [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], 4);
    check([], [], 2);
  });

  it('creates an array of the appropriate length except for the last one', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.nat(),
      (arr, rawChunkSize) => {
        // ensure chunkSize is at least one
        const chunkSize = rawChunkSize + 1;
        const chunks = Arr.chunk(arr, chunkSize);

        const numChunks = chunks.length;
        const firstParts = chunks.slice(0, numChunks - 1);

        for (const firstPart of firstParts) {
          assert.lengthOf(firstPart, chunkSize);
        }

        if (arr.length === 0) {
          assert.deepEqual(chunks, []);
        } else {
          assert.isAtMost(chunks[chunks.length - 1].length, chunkSize);
        }
      }
    ));
  });
});
