import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tArray, tNumber } = Testable;

UnitTest.test('chunk: unit tests', () => {
  const check = (expected: number[][], initial: number[], size: number): void => {
    Assert.eq('chunk', expected, Arr.chunk(initial, size));
    Assert.eq('chunk frozen', expected, Arr.chunk(Object.freeze(initial.slice()), size));
  };

  check([ [ 1, 2, 3 ], [ 4, 5, 6 ] ], [ 1, 2, 3, 4, 5, 6 ], 3);
  check([ [ 1, 2, 3, 4, 5, 6 ] ], [ 1, 2, 3, 4, 5, 6 ], 6);
  check([ [ 1, 2, 3, 4, 5, 6 ] ], [ 1, 2, 3, 4, 5, 6 ], 12);
  check([ [ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ] ], [ 1, 2, 3, 4, 5, 6 ], 1);
  check([ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10 ] ], [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], 4);
  check([], [], 2);
});

UnitTest.test('Chunking should create an array of the appropriate length except for the last one', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.nat(),
    (arr, rawChunkSize) => {
      // ensure chunkSize is at least one
      const chunkSize = rawChunkSize + 1;
      const chunks = Arr.chunk(arr, chunkSize);

      const hasRightSize = (part) => part.length === chunkSize;

      const numChunks = chunks.length;
      const firstParts = chunks.slice(0, numChunks - 1);
      Assert.eq('Incorrect chunk size', true, Arr.forall(firstParts, hasRightSize));
      if (arr.length === 0) {
        Assert.eq('empty', [], chunks, tArray(tArray(tNumber)));
      } else {
        Assert.eq('nonEmpty', true, chunks[chunks.length - 1].length <= chunkSize);
      }
    }
  ));
});
