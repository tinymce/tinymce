import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ChunkTest', function() {
  const check = function (expected, initial: any[], size: number) {
    assert.eq(expected, Arr.chunk(initial, size));
    assert.eq(expected, Arr.chunk(Object.freeze(initial.slice()), size));
  };

  check([[ 1, 2, 3 ], [4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  3);
  check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  6);
  check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  12);
  check([[ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  1);
  check([[ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10 ]],  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],  4);
  check([], [], 2);

  Jsc.property(
    'Chunking should create an array of the appropriate length except for the last one',
    Jsc.array(Jsc.json),
    Jsc.nat,
    function (arr, rawChunkSize) {
      // ensure chunkSize is at least one
      const chunkSize = rawChunkSize + 1;
      const chunks = Arr.chunk(arr, chunkSize);

      const hasRightSize = function (part) {
        return part.length === chunkSize;
      };

      const numChunks = chunks.length;
      const firstParts = chunks.slice(0, numChunks - 1);
      if (! Arr.forall(firstParts, hasRightSize)) return 'Incorrect chunk size';
      return arr.length === 0 ? Jsc.eq([ ], chunks) : chunks[chunks.length - 1].length <= chunkSize;
    }
  );
});

